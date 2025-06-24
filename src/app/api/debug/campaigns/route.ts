import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Debug: Show all campaigns in database
export async function GET(request: NextRequest) {
  try {
    const allCampaigns = await prisma.campaign.findMany({
      include: {
        brand: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const now = new Date()
    
    const analysisResults = allCampaigns.map(campaign => {
      const start = new Date(campaign.startDate)
      const end = new Date(campaign.endDate)
      
      let computedStatus = 'unknown'
      if (now < start) computedStatus = 'upcoming'
      else if (now >= start && now <= end) computedStatus = 'active'
      else if (now > end) computedStatus = 'completed'
      
      const isActiveQuery = now >= start && now <= end && campaign.status === 'active'
      const isUpcomingQuery = now < start
      
      return {
        id: campaign.id,
        name: campaign.name,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        dbStatus: campaign.status,
        computedStatus,
        influencerIds: campaign.influencerIds,
        brand: campaign.brand?.name,
        createdAt: campaign.createdAt.toISOString(),
        isActiveQuery,
        isUpcomingQuery,
        timeChecks: {
          nowTime: now.toISOString(),
          startTime: start.toISOString(), 
          endTime: end.toISOString(),
          nowLessStart: now < start,
          nowGreaterEqualStart: now >= start,
          nowLessEqualEnd: now <= end,
          nowGreaterEnd: now > end
        }
      }
    })

    const stats = {
      totalCampaigns: allCampaigns.length,
      activeCampaigns: analysisResults.filter(c => c.isActiveQuery).length,
      upcomingCampaigns: analysisResults.filter(c => c.isUpcomingQuery).length,
      completedCampaigns: analysisResults.filter(c => c.computedStatus === 'completed').length,
      byDbStatus: {
        active: allCampaigns.filter(c => c.status === 'active').length,
        draft: allCampaigns.filter(c => c.status === 'draft').length,
        completed: allCampaigns.filter(c => c.status === 'completed').length,
        paused: allCampaigns.filter(c => c.status === 'paused').length
      }
    }

    return NextResponse.json({
      success: true,
      currentTime: now.toISOString(),
      stats,
      campaigns: analysisResults
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to debug campaigns' },
      { status: 500 }
    )
  }
} 