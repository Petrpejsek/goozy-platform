import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const prospects = await prisma.influencerProspect.findMany({
      include: {
        scrapingRun: {
          include: {
            config: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Parsování JSON dat
    const formattedProspects = prospects.map(prospect => ({
      ...prospect,
      instagramData: prospect.instagramData ? JSON.parse(prospect.instagramData) : null,
      tiktokData: prospect.tiktokData ? JSON.parse(prospect.tiktokData) : null,
      youtubeData: prospect.youtubeData ? JSON.parse(prospect.youtubeData) : null
    }))
    
    return NextResponse.json({ success: true, prospects: formattedProspects })
  } catch (error) {
    console.error('Error fetching prospects:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch prospects', prospects: [] }, { status: 500 })
  }
} 