import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find brand by email
    // For now, we'll use a simple check since brand authentication isn't fully implemented
    // TODO: Implement proper brand authentication with database lookup
    
    // Temporary placeholder - in production, you would:
    // 1. Look up brand in database by email
    // 2. Verify password hash
    // 3. Create session/JWT token
    // 4. Return success response with token
    
    if (email === 'admin@brand.com' && password === 'password123') {
      return NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        redirect: '/partner-company'
      }, { status: 200 })
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  } catch (error) {
    console.error('Brand login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 