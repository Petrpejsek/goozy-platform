import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, testPassword } = body
    
    console.log('🔍 [DEBUG-PASSWORD] Checking password for:', email)
    
    // Find influencer
    const influencer = await prisma.influencer.findFirst({
      where: { email: email }
    })
    
    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' })
    }
    
    console.log('📋 Found influencer:', {
      id: influencer.id,
      name: influencer.name,
      email: influencer.email,
      hasPassword: !!influencer.password,
      passwordLength: influencer.password ? influencer.password.length : 0
    })
    
    // Find original application
    const application = await prisma.influencerApplication.findFirst({
      where: { email: email }
    })
    
    if (application) {
      console.log('📋 Found application:', {
        id: application.id,
        email: application.email,
        status: application.status,
        hasPassword: !!application.password,
        passwordLength: application.password ? application.password.length : 0
      })
    }
    
    // Test password if provided
    if (testPassword && influencer.password) {
      const isValid = await bcrypt.compare(testPassword, influencer.password)
      console.log(`🔑 Password "${testPassword}" is ${isValid ? 'VALID' : 'INVALID'}`)
      
      // Also test some common passwords
      const commonPasswords = ['123456', 'password', 'test123', 'test', 'admin']
      for (const pwd of commonPasswords) {
        const isCommonValid = await bcrypt.compare(pwd, influencer.password)
        if (isCommonValid) {
          console.log(`🔑 Found working password: "${pwd}"`)
        }
      }
      
      return NextResponse.json({
        influencer: {
          id: influencer.id,
          name: influencer.name,
          email: influencer.email,
          hasPassword: !!influencer.password
        },
        application: application ? {
          status: application.status,
          hasPassword: !!application.password
        } : null,
        testResult: {
          password: testPassword,
          isValid: isValid
        }
      })
    }
    
    return NextResponse.json({
      influencer: {
        id: influencer.id,
        name: influencer.name,
        email: influencer.email,
        hasPassword: !!influencer.password
      },
      application: application ? {
        status: application.status,
        hasPassword: !!application.password
      } : null
    })
    
  } catch (error) {
    console.error('❌ [DEBUG-PASSWORD] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 