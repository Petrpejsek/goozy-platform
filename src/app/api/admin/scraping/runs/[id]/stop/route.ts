import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const runId = resolvedParams.id
    
    // Najdi scraping běh
    const run = await prisma.scrapingRun.findUnique({
      where: { id: runId }
    })
    
    if (!run) {
      return NextResponse.json(
        { error: 'Scraping run not found' },
        { status: 404 }
      )
    }
    
    // Kontrola že běh skutečně běží
    if (run.status !== 'running') {
      return NextResponse.json(
        { error: 'Scraping run is not currently running' },
        { status: 400 }
      )
    }
    
    // Aktualizuj status na 'cancelled' a nastav datum dokončení
    const updatedRun = await prisma.scrapingRun.update({
      where: { id: runId },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
        errors: run.errors ? 
          `${run.errors}\nManually cancelled by admin at ${new Date().toISOString()}` :
          `Manually cancelled by admin at ${new Date().toISOString()}`
      }
    })
    
    console.log(`🛑 [ADMIN] Scraping run ${runId} was manually cancelled`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Scraping run has been cancelled',
      run: updatedRun
    })
    
  } catch (error) {
    console.error('Error stopping scraping run:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 