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
    console.log('🔍 [INFLUENCER-LOGIN] Login attempt for:', body.email)
    
    // Validace dat
    const validatedData = loginSchema.parse(body)
    
    // FIXED: Najdeme influencera v hlavní tabulce influencers místo aplikací
    const influencer = await prisma.influencers.findFirst({
      where: { 
        email: validatedData.email, 
        isApproved: true,
        isActive: true
      },
    })

    if (!influencer) {
      console.log('❌ [INFLUENCER-LOGIN] No approved influencer found for:', validatedData.email)
      
      // Check if there is a pending or rejected application
      const application = await prisma.influencer_applications.findFirst({
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

    // Check if influencer has a password (converted from application should have one)
    if (!influencer.password) {
      console.log('❌ [INFLUENCER-LOGIN] Influencer has no password:', validatedData.email)
      return NextResponse.json({ error: 'Account setup incomplete. Please contact support.' }, { status: 403 })
    }

    console.log('🔍 [INFLUENCER-LOGIN] Found influencer, verifying password...')

    // Ověření hesla
    const isPasswordValid = await bcrypt.compare(validatedData.password, influencer.password)
    
    if (!isPasswordValid) {
      console.log('❌ [INFLUENCER-LOGIN] Invalid password for:', validatedData.email)
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    console.log('✅ [INFLUENCER-LOGIN] Login successful for:', validatedData.email)

    // Vytvoření JWT tokenu
    const token = jwt.sign(
      { 
        id: influencer.id,
        email: influencer.email,
        name: influencer.name,
        type: 'influencer'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Login successful.',
      token,
      influencer: {
        id: influencer.id,
        name: influencer.name,
        email: influencer.email
      }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ [INFLUENCER-LOGIN] Login error:', error)
    
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