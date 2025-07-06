import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params
    console.log(`📊 [DEBUG] GET /api/admin/instagram-scraping/runs/${runId}/status called`)

    // Get the scraping run with config
    const run = await prisma.scrapingRun.findUnique({
      where: { id: runId },
      include: {
        config: {
          select: {
            name: true
          }
        }
      }
    })

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    // Get attempts for this run
    const attempts = await prisma.scrapingAttempt.findMany({
      where: { scrapingRunId: runId },
      orderBy: { attemptedAt: 'desc' },
      take: 100 // Limit to recent attempts
    })

    console.log(`📊 [DEBUG] Found ${attempts.length} attempts for run ${runId}`)

    // Format attempts data
    const formattedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      username: attempt.username,
      status: attempt.status,
      errorMessage: attempt.errorMessage,
      scrapedData: attempt.scrapedData,
      createdAt: attempt.attemptedAt.toISOString()
    }))

    const responseData = {
      id: run.id,
      type: run.type,
      status: run.status,
      totalFound: run.totalFound,
      totalProcessed: run.totalProcessed,
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString(),
      sourceFilter: run.sourceFilter ? JSON.parse(run.sourceFilter) : null,
      configName: run.config.name,
      errors: run.errors,
      attempts: formattedAttempts
    }

    console.log(`📊 [DEBUG] Returning run details with ${formattedAttempts.length} attempts`)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ [ERROR] Failed to get run status:', error)
    return NextResponse.json(
      { error: 'Failed to get run status' },
      { status: 500 }
    )
  }
} 