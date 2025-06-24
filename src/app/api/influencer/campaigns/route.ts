import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueCampaignSlug } from '@/lib/campaign-utils'

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // For now, we'll use a mock influencer ID since we don't have auth yet
    // In production, this would come from the authenticated user session
    const mockInfluencerId = 'mock-influencer-1'
    const mockInfluencerName = 'aneta' // V produkci z databáze nebo auth session
    
    // Get or create a mock brand for the campaign
    let mockBrand = await prisma.brand.findFirst({
      where: { email: 'demo@goozy.com' }
    })
    
    if (!mockBrand) {
      mockBrand = await prisma.brand.create({
        data: {
          name: 'Goozy Demo Brand',
          email: 'demo@goozy.com',
          isApproved: true,
          isActive: true,
          targetCountries: '["CZ"]'
        }
      })
    }

    // Generate unique campaign slug
    const campaignSlug = await generateUniqueCampaignSlug(
      mockInfluencerName,
      mockBrand.name
    )

    console.log(`🔗 Generated unique campaign slug: ${campaignSlug}`)

    // Create campaign in database
    const campaign = await prisma.campaign.create({
      data: {
        slug: campaignSlug,
        brandId: mockBrand.id,
        name: data.name || `Campaign ${new Date().toISOString().slice(0, 10)}`,
        description: data.description || 'Influencer campaign created via platform',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetCountries: JSON.stringify(['CZ']),
        influencerIds: mockInfluencerId,
        status: 'active',
        currency: 'EUR',
        expectedReach: data.expectedReach || 10000,
        budgetAllocated: data.budgetAllocated || 1000
      },
      include: {
        brand: true
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
        brand: campaign.brand
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
    // For now, we'll use a mock influencer ID
    const mockInfluencerId = 'mock-influencer-1'
    
    console.log('🔍 Searching for campaigns with influencerIds:', mockInfluencerId)
    
    const campaigns = await prisma.campaign.findMany({
      where: {
        influencerIds: mockInfluencerId
      },
      include: {
        brand: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${campaigns.length} campaigns for influencer`)

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        slug: campaign.slug || `legacy-${campaign.id.slice(-8)}`, // Fallback pro starší kampaně
        name: campaign.name,
        description: campaign.description,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        status: campaign.status,
        brand: campaign.brand,
        expectedReach: campaign.expectedReach,
        budgetAllocated: campaign.budgetAllocated,
        currency: campaign.currency,
        createdAt: campaign.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('❌ Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
} 