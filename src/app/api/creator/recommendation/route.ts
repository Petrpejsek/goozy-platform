import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'

// POST   /api/influencer/recommendation
// Body: { productId: string, recommendation: string }
export async function POST(request: NextRequest) {
  try {
    const { productId, recommendation } = await request.json()

    if (!productId || typeof recommendation !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    // Extract token – first try cookie, then Authorization header
    let token: string | undefined
    const authCookie = request.cookies.get('influencer-auth')?.value
    if (authCookie) {
      token = authCookie
    } else {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    // Decode JWT – try token first, then fallback to base64-encoded email (same logic as other influencer endpoints)
    let influencerId: string
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default-secret')
      if (decoded.type !== 'influencer') throw new Error('Invalid token type')
      influencerId = decoded.id || decoded.userId || decoded.influencerId
    } catch (jwtError) {
      // Fallback: the token might just be base64-encoded influencer email
      try {
        const email = Buffer.from(token, 'base64').toString('utf-8')
        const influencer = await prisma.influencers.findUnique({
          where: { email },
          select: { id: true }
        })
        if (!influencer) throw new Error('Influencer not found by email')
        influencerId = influencer.id
        console.log('✅ [RECOMMENDATION] Fallback auth successful for', email)
      } catch (fallbackError) {
        return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
      }
    }

    // Upsert influencer_products record
    await prisma.influencer_products.upsert({
      where: {
        influencerId_productId: {
          influencerId,
          productId
        }
      },
      update: {
        recommendation: recommendation.trim(),
        isActive: true
      },
      create: {
        id: randomUUID(),
        influencerId,
        productId,
        recommendation: recommendation.trim(),
        isActive: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error saving recommendation:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
} 