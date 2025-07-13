import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing or invalid authorization header' }, { status:  401 })
    }

    const token = authHeader.split(' ')[1]
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status:  401 })
    }

    if (!decoded.id || decoded.type !== 'influencer') {
      return NextResponse.json({ message: 'Invalid token type' }, { status:  401 })
    }

    // Get request body
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Current password and new password are required' }, { status:  400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'New password must be at least 6 characters long' }, { status:  400 })
    }

    // Get influencer by ID
    const influencer = await prisma.influencer.findUnique({
      where: { id: decoded.id }
    })

    if (!influencer) {
      return NextResponse.json({ message: 'Influencer not found' }, { status:  404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, influencer.password || "")
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status:  400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password in database
    await prisma.influencer.update({
      where: { id: influencer.id },
      data: { password: hashedNewPassword }
    })

    console.log(`✅ [PASSWORD-CHANGE] Password changed for ${influencer.email}`)

    return NextResponse.json({ 
      message: 'Password changed successfully' 
    })

  } catch (error) {
    console.error('❌ [PASSWORD-CHANGE] Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status:  500 })
  }
} 