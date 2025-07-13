import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all campaigns for admin overview
export async function GET(request: NextRequest) {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        brand: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate statistics
    const stats = {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === 'active').length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
      totalBudget: campaigns.reduce((sum, c) => sum + (c.budgetAllocated || 0), 0),
      totalReach: campaigns.reduce((sum, c) => sum + (c.expectedReach || 0), 0)
    }

    console.log(`📊 Admin: Found ${campaigns.length} campaigns`)

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
        influencerIds: campaign.influencerIds,
        targetCountries: campaign.targetCountries,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString()
      })),
      stats
    })

  } catch (error) {
    console.error('❌ Error fetching admin campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// PUT - Update campaign status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { campaignId, status } = await request.json()

    if (!campaignId || !status) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and status are required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
      include: { brands: true }
    })

    console.log(`✅ Admin: Updated campaign ${campaignId} status to ${status}`)

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        brand: campaign.brands
      }
    })

  } catch (error) {
    console.error('❌ Error updating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
} 