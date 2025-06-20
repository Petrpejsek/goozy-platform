import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [DEBUG] GET /api/admin/instagram-scraping/runs called')

    // Get all Instagram scraping runs
    const runs = await prisma.scrapingRun.findMany({
      where: {
        type: 'instagram_scraping'
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 50, // Limit to recent runs
      include: {
        config: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`📋 [DEBUG] Found ${runs.length} Instagram scraping runs`)

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
        errors: run.errors ? JSON.parse(run.errors) : null
      }))
    })

  } catch (error) {
    console.error('❌ [ERROR] Error getting Instagram scraping runs:', error)
    return NextResponse.json({ error: 'Failed to get runs' }, { status: 500 })
  }
} 