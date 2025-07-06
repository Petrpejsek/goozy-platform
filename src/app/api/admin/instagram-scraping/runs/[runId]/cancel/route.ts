import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params
    console.log(`🛑 [DEBUG] POST /api/admin/instagram-scraping/runs/${runId}/cancel called`)

    // Get the scraping run
    const run = await prisma.scrapingRun.findUnique({
      where: { id: runId }
    })

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    if (run.status !== 'running') {
      return NextResponse.json({ 
        error: `Cannot cancel run with status: ${run.status}` 
      }, { status: 400 })
    }

    // Mark the run as cancelled
    const updatedRun = await prisma.scrapingRun.update({
      where: { id: runId },
      data: {
        status: 'failed', // We'll use 'failed' to indicate cancelled
        errors: JSON.stringify(['Run was cancelled by user']),
        completedAt: new Date()
      }
    })

    console.log(`🛑 [DEBUG] Instagram scraping run ${runId} cancelled`)

    return NextResponse.json({
      success: true,
      run: {
        id: updatedRun.id,
        status: updatedRun.status,
        completedAt: updatedRun.completedAt?.toISOString()
      },
      message: 'Run cancelled successfully'
    })

  } catch (error) {
    console.error('❌ [ERROR] Error cancelling run:', error)
    return NextResponse.json({ error: 'Failed to cancel run' }, { status: 500 })
  }
} 