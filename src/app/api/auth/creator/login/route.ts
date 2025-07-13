import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 [CREATOR-LOGIN] Login attempt for:', body.email)
    
    // Validace dat
    const validatedData = loginSchema.parse(body)
    
    // FIXED: Najdeme creatora v hlavní tabulce influencers místo aplikací
    const creator = await prisma.influencer.findFirst({
      where: { 
        email: validatedData.email, 
        isApproved: true,
        isActive: true
      },
    })

    if (!creator) {
      console.log('❌ [CREATOR-LOGIN] No approved creator found for:', validatedData.email)
      
      // Check if there is a pending or rejected application
      const application = await prisma.influencerApplication.findFirst({
        where: { email: validatedData.email },
        orderBy: { createdAt: 'desc' }
      })
      if (application) {
        if (application.status === 'pending') {
          return NextResponse.json({ error: 'Your application is still being reviewed.' }, { status: 403 })
        }
        if (application.status === 'rejected') {
          return NextResponse.json({ error: 'Your application has been rejected.' }, { status: 403 })
        }
        if (application.status === 'converted') {
          return NextResponse.json({ error: 'Please contact support for account activation.' }, { status: 403 })
        }
      }
      return NextResponse.json({ error: 'Invalid credentials or unapproved account.' }, { status: 401 })
    }

    // Check if creator has a password (converted from application should have one)
    if (!creator.password) {
      console.log('❌ [CREATOR-LOGIN] Creator has no password:', validatedData.email)
      return NextResponse.json({ error: 'Account setup incomplete. Please contact support.' }, { status: 403 })
    }

    console.log('🔍 [CREATOR-LOGIN] Found creator, verifying password...')

    // Ověření hesla
    const isPasswordValid = await bcrypt.compare(validatedData.password, creator.password)
    
    if (!isPasswordValid) {
      console.log('❌ [CREATOR-LOGIN] Invalid password for:', validatedData.email)
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    console.log('✅ [CREATOR-LOGIN] Login successful for:', validatedData.email)

    // Vytvoření JWT tokenu
    const token = jwt.sign(
      { 
        id: creator.id,
        email: creator.email,
        name: creator.name,
        type: 'creator'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Login successful.',
      token,
      creator: {
        id: creator.id,
        name: creator.name,
        email: creator.email
      }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ [CREATOR-LOGIN] Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 