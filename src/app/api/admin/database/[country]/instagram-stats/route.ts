import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  try {
    const country = params.country

    console.log(`📊 [DEBUG] GET /api/admin/database/${country}/instagram-stats called`)

    // Get total profiles count for this country
    const totalProfiles = await prisma.influencerDatabase.count({
      where: {
        isActive: true,
        country: country,
        instagramUsername: {
          not: null
        }
      }
    })

    // Get profiles with Instagram data for this country
    const profilesWithData = await prisma.influencerDatabase.count({
      where: {
        isActive: true,
        country: country,
        instagramUsername: {
          not: null
        },
        instagramData: {
          not: null
        }
      }
    })

    // Get profiles with failed scraping attempts (using raw query) for this country
    const profilesWithFailedScraping = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM influencer_database 
      WHERE isActive = 1 
      AND country = ${country}
      AND instagramUsername IS NOT NULL 
      AND instagramData IS NULL
      AND id IN (
        SELECT DISTINCT targetProfileId FROM scraping_attempts 
        WHERE targetProfileId IS NOT NULL AND status = 'failed'
      )
    `

    // Get profiles never attempted (before full scraping) for this country
    const profilesNeverAttempted = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM influencer_database 
      WHERE isActive = 1 
      AND country = ${country}
      AND instagramUsername IS NOT NULL 
      AND instagramData IS NULL
      AND id NOT IN (
        SELECT DISTINCT targetProfileId FROM scraping_attempts 
        WHERE targetProfileId IS NOT NULL
      )
    `

    // Calculate missing data (total without data)
    const profilesMissingData = totalProfiles - profilesWithData

    // Get last Instagram scraping run
    const lastScrapingRun = await prisma.scrapingRun.findFirst({
      where: {
        type: 'instagram_scraping'
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

    const stats = {
      totalProfiles,
      profilesWithData,
      profilesMissingData,
      profilesWithFailedScraping: Number((profilesWithFailedScraping as any)[0]?.count || 0),
      profilesNeverAttempted: Number((profilesNeverAttempted as any)[0]?.count || 0),
      lastScrapingRun: lastScrapingRun ? {
        id: lastScrapingRun.id,
        status: lastScrapingRun.status,
        completedAt: lastScrapingRun.completedAt?.toISOString(),
        successRate: lastScrapingRun.totalProcessed > 0 
          ? Math.round((lastScrapingRun.totalFound / lastScrapingRun.totalProcessed) * 100)
          : 0
      } : undefined
    }

    console.log(`📊 [DEBUG] Instagram scraping stats for ${country}:`, stats)

    return NextResponse.json(stats)

  } catch (error) {
    console.error(`❌ [ERROR] Error getting Instagram scraping stats for ${params.country}:`, error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
} 