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
    
    // Validace dat
    const validatedData = loginSchema.parse(body)
    
    // Najdeme schváleného influencera v aplikacích
    const influencer = await prisma.influencerApplication.findFirst({
      where: { 
        email: validatedData.email, 
        status: 'approved' 
      },
    })

    if (!influencer) {
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
      }
      return NextResponse.json({ error: 'Invalid credentials or unapproved account.' }, { status: 401 })
    }

    // Ověření hesla
    const isPasswordValid = await bcrypt.compare(validatedData.password, influencer.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

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
    console.error('Login error:', error)
    
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