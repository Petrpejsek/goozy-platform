import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const runs = await prisma.scrapingRun.findMany({
      include: {
        config: {
          select: {
            name: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, runs })
  } catch (error) {
    console.error('Error fetching runs:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch runs', runs: [] }, { status: 500 })
  }
} 