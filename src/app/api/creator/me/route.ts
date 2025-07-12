import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [CREATOR-ME] Getting authenticated creator data...')
    
    // Get token from cookies first, then try Authorization header as fallback
    let token: string | undefined
    
    // Try cookies first
    const authCookie = request.cookies.get('creator-auth')?.value
    if (authCookie) {
      token = authCookie
    } else {
      // Fallback to Authorization header
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      }
    }
    
    if (!token) {
      console.log('❌ [CREATOR-ME] No valid authentication found')
      return NextResponse.json({ error: 'No valid authentication token' }, { status: 401 })
    }

    // Try to decode JWT token first
    let decoded: any
    let creatorId: string
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')
      creatorId = decoded.id || decoded.userId || decoded.creatorId
      
      if (!creatorId || decoded.type !== 'creator') {
        throw new Error('Invalid token type')
      }
      
      console.log('✅ [CREATOR-ME] Token valid for creator:', decoded.email)
    } catch (jwtError) {
      // Fallback: try to decode as base64 encoded email
      try {
        const email = Buffer.from(token, 'base64').toString('utf-8')
        console.log('🔄 [CREATOR-ME] Trying base64 fallback for email:', email)
        
        const creatorByEmail = await prisma.influencers.findUnique({
          where: { email },
          select: { id: true, email: true }
        })
        
        if (!creatorByEmail) {
          throw new Error('Creator not found by email')
        }
        
        creatorId = creatorByEmail.id
        console.log('✅ [CREATOR-ME] Fallback authentication successful for:', email)
      } catch (fallbackError) {
        console.log('❌ [CREATOR-ME] Authentication failed:', fallbackError)
        return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
      }
    }

    // Get creator with all related data
    const creator = await prisma.influencers.findUnique({
      where: { id: creatorId },
      include: {
        influencer_socials: true,
        influencer_categories: true,
        influencer_profiles: true,
        influencer_products: {
          include: {
            products: true
          }
        },
        orders: {
          where: {
            status: 'completed'
          }
        },
        commissions: true
      }
    })

    if (!creator) {
      console.log('❌ [CREATOR-ME] Creator not found:', creatorId)
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Calculate statistics
    const totalEarnings = creator.commissions.reduce((sum, commission) => sum + commission.amount, 0)
    const activeProducts = creator.influencer_products.length
    const totalOrders = creator.orders.length
    const totalFollowers = creator.influencer_socials.reduce((sum, social) => sum + (social.followers || 0), 0)

    // Get main social network for followers display
    const mainSocial = creator.influencer_socials.find(s => s.platform === 'instagram') 
      || creator.influencer_socials[0]

    const response = {
      creator: {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        phone: creator.phone,
        slug: creator.slug,
        avatar: creator.avatar,
        bio: creator.bio,
        followers: mainSocial ? formatFollowers(mainSocial.followers) : '0',
        totalEarnings: totalEarnings,
        activeProducts: activeProducts,
        totalOrders: totalOrders,
        commissionRate: Math.round(creator.commissionRate * 100), // Convert to percentage
        socialNetworks: creator.influencer_socials,
        contentCategories: creator.influencer_categories,
        profile: creator.influencer_profiles,
        isActive: creator.isActive,
        isApproved: creator.isApproved,
        onboardingStatus: creator.onboardingStatus
      }
    }

    console.log('📊 [CREATOR-ME] Returning data for:', creator.name)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ [CREATOR-ME] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// Helper function to format follower count
function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
} 