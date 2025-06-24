import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateCampaignSlug } from '@/lib/campaign-utils'

// GET - Fetch campaign by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    console.log('🔍 Fetching campaign with slug:', slug)
    
    // Validate slug format
    if (!validateCampaignSlug(slug)) {
      console.log('❌ Invalid slug format:', slug)
      return NextResponse.json(
        { success: false, error: 'Invalid campaign slug format' },
        { status: 400 }
      )
    }
    
    // Find campaign by slug
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      include: {
        brand: true
      }
    })
    
    if (!campaign) {
      console.log('❌ Campaign not found for slug:', slug)
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Campaign found:', campaign.id)
    
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        slug: campaign.slug,
        name: campaign.name,
        description: campaign.description,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        status: campaign.status,
        isActive: campaign.isActive,
        brand: campaign.brand,
        expectedReach: campaign.expectedReach,
        budgetAllocated: campaign.budgetAllocated,
        currency: campaign.currency,
        influencerIds: campaign.influencerIds,
        targetCountries: campaign.targetCountries,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching campaign by slug:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
} 