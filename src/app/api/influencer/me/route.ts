import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [INFLUENCER-ME] Getting authenticated influencer data...')
    
    // Get token from cookies first, then try Authorization header as fallback
    let token: string | undefined
    
    // Try cookies first
    const authCookie = request.cookies.get('influencer-auth')?.value
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
      console.log('❌ [INFLUENCER-ME] No valid authentication found')
      return NextResponse.json({ error: 'No valid authentication token' }, { status: 401 })
    }

    // Try to decode JWT token first
    let decoded: any
    let influencerId: string
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')
      influencerId = decoded.id || decoded.userId || decoded.influencerId
      
      if (!influencerId || decoded.type !== 'influencer') {
        throw new Error('Invalid token type')
      }
      
      console.log('✅ [INFLUENCER-ME] Token valid for influencer:', decoded.email)
    } catch (jwtError) {
      // Fallback: try to decode as base64 encoded email
      try {
        const email = Buffer.from(token, 'base64').toString('utf-8')
        console.log('🔄 [INFLUENCER-ME] Trying base64 fallback for email:', email)
        
        const influencerByEmail = await prisma.influencer.findUnique({
          where: { email },
          select: { id: true, email: true }
        })
        
        if (!influencerByEmail) {
          throw new Error('Influencer not found by email')
        }
        
        influencerId = influencerByEmail.id
        console.log('✅ [INFLUENCER-ME] Fallback authentication successful for:', email)
      } catch (fallbackError) {
        console.log('❌ [INFLUENCER-ME] Authentication failed:', fallbackError)
        return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
      }
    }

    // Get influencer with all related data
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
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

    if (!influencer) {
      console.log('❌ [INFLUENCER-ME] Influencer not found:', influencerId)
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Calculate statistics
    const totalEarnings = influencer.commissions.reduce((sum, commission) => sum + commission.amount, 0)
    const activeProducts = influencer.influencer_products.length
    const totalOrders = influencer.orders.length
    const totalFollowers = influencer.influencer_socials.reduce((sum, social) => sum + (social.followers || 0), 0)

    // Get main social network for followers display
    const mainSocial = influencer.influencer_socials.find(s => s.platform === 'instagram') 
      || influencer.influencer_socials[0]

    const response = {
      influencer: {
        id: influencer.id,
        name: influencer.name,
        email: influencer.email,
        phone: influencer.phone,
        slug: influencer.slug,
        avatar: influencer.avatar,
        bio: influencer.bio,
        followers: mainSocial ? formatFollowers(mainSocial.followers) : '0',
        totalEarnings: totalEarnings,
        activeProducts: activeProducts,
        totalOrders: totalOrders,
        commissionRate: Math.round(influencer.commissionRate * 100), // Convert to percentage
        socialNetworks: influencer.influencer_socials,
        contentCategories: influencer.influencer_categories,
        profile: influencer.influencer_profiles,
        isActive: influencer.isActive,
        isApproved: influencer.isApproved,
        onboardingStatus: influencer.onboardingStatus
      }
    }

    console.log('📊 [INFLUENCER-ME] Returning data for:', influencer.name)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ [INFLUENCER-ME] Error:', error)
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