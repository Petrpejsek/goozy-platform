import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const loginSchema = z.object({
  email: z.string().email('Neplatný email'),
  password: z.string().min(1, 'Heslo je povinné'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validace dat
    const validatedData = loginSchema.parse(body)
    
    // Najdeme schváleného influencera v aplikacích
    const application = await prisma.influencerApplication.findFirst({
      where: {
        email: validatedData.email,
        status: 'approved' // Pouze schválení influenceři se mohou přihlásit
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        instagram: true,
        tiktok: true,
        youtube: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Neplatné přihlašovací údaje nebo účet ještě nebyl schválen' },
        { status: 401 }
      )
    }

    // Ověření hesla
    const isValidPassword = await bcrypt.compare(validatedData.password, application.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      )
    }

    // Vytvoření JWT tokenu
    const token = jwt.sign(
      { 
        id: application.id,
        email: application.email,
        name: application.name,
        type: 'influencer'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Úspěšné přihlášení',
      token,
      user: {
        id: application.id,
        name: application.name,
        email: application.email,
        instagram: application.instagram,
        tiktok: application.tiktok,
        youtube: application.youtube
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    )
  }
} 