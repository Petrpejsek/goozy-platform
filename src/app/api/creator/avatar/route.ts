import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import jwt from 'jsonwebtoken'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Validate token
    if (!decoded.id || decoded.type !== 'influencer') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Get influencer
    const influencer = await prisma.influencer.findUnique({
      where: { id: decoded.id }
    })

    if (!influencer) {
      return NextResponse.json({ message: 'Influencer not found' }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File || formData.get('avatar') as File
    const uploadType = formData.get('type') as string || 'avatar'

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${influencer.slug}_${timestamp}.${extension}`

    // Determine upload directory based on type
    const uploadDir = uploadType === 'background' ? 'backgrounds' : 'avatars'
    const fileDir = path.join(process.cwd(), 'public', uploadDir)
    
    try {
      await mkdir(fileDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(fileDir, filename)
    await writeFile(filePath, buffer)

    const fileUrl = `/${uploadDir}/${filename}`

    // Update database only for avatar uploads
    if (uploadType === 'avatar') {
      await prisma.influencer.update({
        where: { id: influencer.id }
        data: { avatar: fileUrl }
      })
    }

    console.log(`✅ [${uploadType.toUpperCase()}-UPLOAD] ${uploadType} uploaded for ${influencer.email}: ${fileUrl}`)

    return NextResponse.json({ 
      message: `${uploadType} uploaded successfully`
      avatarUrl: fileUrl,  // Keep same property name for compatibility
      fileUrl: fileUrl
    })

  } catch (error) {
    console.error('❌ [AVATAR-UPLOAD] Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 