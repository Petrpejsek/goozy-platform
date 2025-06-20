import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params
    const runId = resolvedParams.id
    console.log('🔍 [DEBUG] Fetching run details for ID:', runId)
    
    const run = await prisma.scrapingRun.findUnique({
      where: { id: runId },
      include: {
        config: true,
        prospects: true,
        scrapingAttempts: {
          orderBy: { attemptedAt: 'asc' }
        }
      }
    })
    
    console.log('🔍 [DEBUG] Found run:', run ? 'YES' : 'NO')
    if (run) {
      console.log('🔍 [DEBUG] Scraping attempts count:', run.scrapingAttempts?.length || 0)
    }
    
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }
    
    return NextResponse.json(run)
  } catch (error) {
    console.error('Error fetching run details:', error)
    return NextResponse.json({ error: 'Failed to fetch run details' }, { status: 500 })
  }
} 