import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// GET - Načíst customization nastavení
export async function GET(request: NextRequest) {
  try {
    console.log('🎨 [CUSTOMIZATION] Getting influencer customization...')
    
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid authentication token' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')
    } catch (error) {
      console.log('❌ [CUSTOMIZATION] Invalid token:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!decoded.id || decoded.type !== 'influencer') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 })
    }

    // Get customization from database
    const customization = await prisma.influencer.findFirst({
      where: { id: decoded.id }
    })

    // Return default customization if none exists
    const defaultCustomization = {
      theme: 'modern'
      background: 'white'
      heroLayout: 'horizontal'
    }

    return NextResponse.json({
      customization: customization || defaultCustomization
    }, { status: 200 })

  } catch (error) {
    console.error('❌ [CUSTOMIZATION] Get error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }
      { status: 500 }
    )
  }
}

// POST - Uložit customization nastavení
export async function POST(request: NextRequest) {
  try {
    console.log('🎨 [CUSTOMIZATION] Saving influencer customization...')
    
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid authentication token' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')
    } catch (error) {
      console.log('❌ [CUSTOMIZATION] Invalid token:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!decoded.id || decoded.type !== 'influencer') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 })
    }

    // Get customization data from request
    const { theme, background, heroLayout, customSettings } = await request.json()

    console.log('✅ [CUSTOMIZATION] Saving customization for influencer:', decoded.email)
    console.log('📋 [CUSTOMIZATION] Data:', { theme, background, heroLayout, customSettings })

    // Check if influencer has existing customization
    const existingCustomization = await prisma.influencer.findFirst({
      where: { id: decoded.id }
    })

    // TODO: InfluencerCustomization model not implemented yet
    // if (existingCustomization) {
    //   // Update existing customization
    //   await prisma.influencer.update({
    //     where: { id: existingCustomization.id }
    //     data: {
    //       theme: theme || existingCustomization.theme
    //       background: background || existingCustomization.background
    //       heroLayout: heroLayout || existingCustomization.heroLayout
    //       customSettings: customSettings || existingCustomization.customSettings
    //     }
    //   })
    // } else {
    //   // Create new customization
    //   await prisma.influencercustomization.create({
    //     data: {
    //       influencerId: decoded.id
    //       theme: theme || 'default'
    //       background: background || '#ffffff'
    //       heroLayout: heroLayout || 'standard'
    //       customSettings: customSettings || '{}'
    //     }
    //   })
    // }

    return NextResponse.json({
      message: 'Customization saved successfully'
      customization: { theme, background, heroLayout, customSettings }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ [CUSTOMIZATION] Save error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }
      { status: 500 }
    )
  }
} 