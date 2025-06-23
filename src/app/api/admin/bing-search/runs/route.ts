import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [DEBUG] GET /api/admin/bing-search/runs called')

    // Získej posledních 20 Bing scraping runs
    const runs = await prisma.scrapingRun.findMany({
      where: {
        type: 'bing_search'
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 20,
      include: {
        config: {
          select: {
            name: true,
            hashtags: true,
            countries: true
          }
        }
      }
    })

    console.log(`📋 [DEBUG] Found ${runs.length} Bing scraping runs`)

    return NextResponse.json({
      runs: runs.map(run => ({
        id: run.id,
        type: run.type,
        status: run.status,
        totalFound: run.totalFound,
        totalProcessed: run.totalProcessed,
        startedAt: run.startedAt.toISOString(),
        completedAt: run.completedAt?.toISOString(),
        sourceFilter: run.sourceFilter ? JSON.parse(run.sourceFilter) : null,
        configName: run.config.name,
        hashtags: run.config.hashtags ? JSON.parse(run.config.hashtags) : [],
        countries: run.config.countries ? JSON.parse(run.config.countries) : [],
        errors: run.errors ? JSON.parse(run.errors) : null
      }))
    })

  } catch (error) {
    console.error('❌ [ERROR] Error getting Bing scraping runs:', error)
    return NextResponse.json({ error: 'Failed to get runs' }, { status: 500 })
  }
} 