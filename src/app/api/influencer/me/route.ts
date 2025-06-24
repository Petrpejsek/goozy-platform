import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [INFLUENCER-ME] Getting authenticated influencer data...')
    
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
      console.log('❌ [INFLUENCER-ME] Invalid token:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!decoded.id || decoded.type !== 'influencer') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 })
    }

    console.log('✅ [INFLUENCER-ME] Token valid for influencer:', decoded.email)

    // Get influencer with all related data
    const influencer = await prisma.influencer.findUnique({
      where: { id: decoded.id },
      include: {
        socialNetworks: true,
        contentCategories: true,
        selectedProducts: {
          include: {
            product: true
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
      console.log('❌ [INFLUENCER-ME] Influencer not found:', decoded.id)
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Calculate statistics
    const totalEarnings = influencer.commissions.reduce((sum, commission) => sum + commission.amount, 0)
    const activeProducts = influencer.selectedProducts.length
    const totalOrders = influencer.orders.length
    const totalFollowers = influencer.socialNetworks.reduce((sum, social) => sum + social.followers, 0)

    // Get main social network for followers display
    const mainSocial = influencer.socialNetworks.find(s => s.platform === 'instagram') 
      || influencer.socialNetworks[0]

    const response = {
      id: influencer.id,
      name: influencer.name,
      email: influencer.email,
      slug: influencer.slug,
      avatar: influencer.avatar,
      bio: influencer.bio,
      followers: mainSocial ? formatFollowers(mainSocial.followers) : '0',
      totalEarnings: totalEarnings,
      activeProducts: activeProducts,
      totalOrders: totalOrders,
      commissionRate: Math.round(influencer.commissionRate * 100), // Convert to percentage
      socialNetworks: influencer.socialNetworks,
      contentCategories: influencer.contentCategories,
      isActive: influencer.isActive,
      isApproved: influencer.isApproved,
      onboardingStatus: influencer.onboardingStatus
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