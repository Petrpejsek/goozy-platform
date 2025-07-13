import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueCampaignSlug } from '@/lib/campaign-utils'
import jwt from 'jsonwebtoken'

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Get authentication from Authorization header first, then cookies as fallback
    let token: string | undefined
    
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else {
      // Fallback to cookies
      token = request.cookies.get('influencer-auth')?.value
    }
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    let influencerId: string
    let influencerData: any

    try {
      // Try to decode JWT token first
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any
      influencerId = decoded.userId || decoded.influencerId || decoded.id
      
      // Get full influencer data from database
      influencerData = await prisma.influencer.findUnique({
        where: { id: influencerId },
        select: {
          id: true,
          name: true,
          email: true,
          slug: true
        }
      })
      
      console.log('✅ [CAMPAIGNS-POST] Token authentication successful for:', influencerData?.email)
    } catch (jwtError) {
      // Fallback: try to find influencer by email (base64 encoded in cookie)
      try {
        const email = Buffer.from(token, 'base64').toString('utf-8')
        influencerData = await prisma.influencer.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            slug: true
          }
        })
        influencerId = influencerData?.id as string
        console.log('✅ [CAMPAIGNS-POST] Fallback authentication successful for:', email)
      } catch (fallbackError) {
        console.error('❌ Authentication failed:', fallbackError)
        return NextResponse.json(
          { success: false, error: 'Invalid authentication' },
          { status: 401 }
        )
      }
    }

    if (!influencerData) {
      return NextResponse.json(
        { success: false, error: 'Influencer not found' },
        { status: 404 }
      )
    }

    console.log(`🔍 Creating campaign for influencer: ${influencerData.name} (${influencerData.email})`)
    
    // Get or create a mock brand for the campaign
    let mockBrand = await prisma.brand.findFirst({
      where: { email: 'demo@goozy.com' }
    })
    
    if (!mockBrand) {
      mockBrand = await prisma.brand.create({
        data: {
          id: `brand-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          name: 'Goozy Demo Brand',
          email: 'demo@goozy.com',
          isApproved: true,
          isActive: true,
          targetCountries: '["CZ"]',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Use pre-generated slug from frontend or generate new one
    let campaignSlug = data.slug
    
    if (!campaignSlug) {
      // Fallback: generate unique campaign slug using REAL influencer name
      campaignSlug = await generateUniqueCampaignSlug(
        influencerData.name,
        mockBrand.name
      )
      console.log(`🔗 Generated fallback campaign slug: ${campaignSlug}`)
    } else {
      console.log(`🔗 Using pre-generated campaign slug: ${campaignSlug}`)
    }

    // Create campaign in database
    const campaign = await prisma.campaign.create({
      data: {
        id: `campaign-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        slug: campaignSlug,
        brandId: mockBrand.id,
        name: data.name || `${influencerData.name}'s Campaign ${new Date().toISOString().slice(0, 10)}`,
        description: data.description || `Influencer campaign created by ${influencerData.name}`,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetCountries: JSON.stringify(['CZ']),
        influencerIds: influencerId,
        status: 'active',
        currency: 'EUR',
        expectedReach: data.expectedReach || 10000,
        budgetAllocated: data.budgetAllocated || 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        brands: true
      }
    })

    console.log('✅ Campaign created in database:', campaign.id)
    console.log('📝 Campaign influencerIds saved as:', campaign.influencerIds)
    console.log('📅 Campaign dates - start:', campaign.startDate, 'end:', campaign.endDate)
    console.log('🏷️ Campaign status:', campaign.status)

    // Generate campaign URL using our domain
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const campaignUrl = `${origin}/campaign/${campaignSlug}`

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        slug: campaignSlug,
        url: campaignUrl,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        status: campaign.status,
        brand: campaign.brands,
        influencer: {
          id: influencerData.id,
          name: influencerData.name,
          slug: influencerData.slug
        }
      }
    })

  } catch (error) {
    console.error('❌ Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

// GET - Fetch influencer campaigns
export async function GET(request: NextRequest) {
  try {
    // Get authentication from Authorization header first, then cookies as fallback
    let token: string | undefined
    
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else {
      // Fallback to cookies
      token = request.cookies.get('influencer-auth')?.value
    }
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    let influencerId: string

    try {
      // Try to decode JWT token first
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any
      influencerId = decoded.userId || decoded.influencerId || decoded.id
      console.log('✅ [CAMPAIGNS-GET] Token authentication successful for:', decoded.email)
    } catch (jwtError) {
      // Fallback: try to find influencer by email (base64 encoded in cookie)
      try {
        const email = Buffer.from(token, 'base64').toString('utf-8')
        const influencerData = await prisma.influencer.findUnique({
          where: { email },
          select: { id: true }
        })
        influencerId = influencerData?.id as string
        console.log('✅ [CAMPAIGNS-GET] Fallback authentication successful for:', email)
      } catch (fallbackError) {
        return NextResponse.json(
          { success: false, error: 'Invalid authentication' },
          { status: 401 }
        )
      }
    }

    if (!influencerId) {
      return NextResponse.json(
        { success: false, error: 'Influencer not found' },
        { status: 404 }
      )
    }
    
    console.log('🔍 Searching for campaigns with influencerIds:', influencerId)
    
    const campaigns = await prisma.campaign.findMany({
      where: {
        influencerIds: influencerId
      },
      include: {
        brands: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${campaigns.length} campaigns for influencer`)

    // Get campaign statistics
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        // Get orders for this campaign (mock data for now)
        const orders = await prisma.order.findMany({
          where: {
            influencerId: influencerId,
            status: 'completed'
          }
        })

        // Get influencer products count
        const productCount = await prisma.influencerproducts.count({
          where: {
            influencerId: influencerId,
            isActive: true
          }
        })

        // Calculate stats
        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        const conversionRate = (campaign.expectedReach || 0) > 0 ? (totalOrders / (campaign.expectedReach || 1)) * 100 : 0

        return {
          id: campaign.id,
          slug: campaign.slug || `legacy-${campaign.id.slice(-8)}`,
          name: campaign.name,
          description: campaign.description,
          startDate: campaign.startDate.toISOString(),
          endDate: campaign.endDate.toISOString(),
          status: campaign.status,
          brand: campaign.brands,
          expectedReach: campaign.expectedReach,
          budgetAllocated: campaign.budgetAllocated,
          currency: campaign.currency,
          createdAt: campaign.createdAt.toISOString(),
          stats: {
            totalSales: totalOrders,
            totalRevenue: totalRevenue,
            totalOrders: totalOrders,
            productCount: productCount,
            conversionRate: conversionRate
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats
    })

  } catch (error) {
    console.error('❌ Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
} 