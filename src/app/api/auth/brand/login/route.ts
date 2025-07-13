import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error:  'Method not allowed' }, { status:  405 })
  }

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error:  'Email and password are required' }, { status:  400 })
    }

    // Najdi brand aplikaci v databázi
    const brandApplication = await prisma.brandApplication.findFirst({
      where: { 
        email: email.toLowerCase().trim()
      }
    })

    if (!brandApplication) {
      return NextResponse.json({ error:  'No application found for this email' }, { status:  401 })
    }

    // Zkontroluj, jestli je aplikace schválená
    if (brandApplication.status !== 'approved') {
      return NextResponse.json({ 
        error: `Application status is "${brandApplication.status}". Please wait for approval or contact support.`
        status: brandApplication.status
      }, { status:  401 })
    }

    // Zkontroluj heslo
    if (!brandApplication.password) {
      return NextResponse.json({ 
        error: 'No password set for this account. Please contact support.'
      }, { status:  401 })
    }

    const isPasswordValid = await bcrypt.compare(password, brandApplication.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error:  'Invalid email or password' }, { status:  401 })
    }
    
    // Úspěšné přihlášení - vytvoř JWT token pro session
    const token = jwt.sign(
      { 
        brandId: brandApplication.id
        email: brandApplication.email
        brandName: brandApplication.brandName
      }
      process.env.JWT_SECRET || 'fallback-secret-key'
      { expiresIn: '24h' }
    )
    
    console.log(`✅ [BRAND-LOGIN] Successful login for ${email} (${brandApplication.brandName})`)
    
    // Vytvoř response s user daty
    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful'
      brand: {
        id: brandApplication.id
        name: brandApplication.brandName
        email: brandApplication.email
        contactName: brandApplication.contactName
      }
      redirect: '/partner-company'
    }, { status:  200 })

    // Nastav authentication cookie
    response.cookies.set('brand-auth', token, {
      httpOnly: true
      secure: process.env.NODE_ENV === 'production'
      sameSite: 'lax'
      path: '/'
      maxAge: 24 * 60 * 60 // 24 hodin v sekundách
    })

    return response

  } catch (error) {
    console.error('❌ [BRAND-LOGIN] Error:', error)
    return NextResponse.json({ error:  'Internal server error' }, { status:  500 })
  }
} 