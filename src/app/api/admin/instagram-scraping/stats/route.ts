import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [DEBUG] GET /api/admin/instagram-scraping/stats called')

    // Get total profiles count
    const totalProfiles = await prisma.influencerDatabase.count({
      where: {
        isActive: true,
        instagramUsername: {
          not: null
        }
      }
    })

    // Get profiles with complete Instagram data
    const profilesWithData = await prisma.influencerDatabase.count({
      where: {
        isActive: true,
        instagramUsername: {
          not: null
        },
        instagramData: {
          not: null
        }
      }
    })

    // Get all failed scraping attempts (these are the ones that actually failed during scraping)
    const failedAttempts = await prisma.scrapingAttempt.findMany({
      where: {
        status: 'failed'
      },
      select: {
        username: true,
        targetProfileId: true
      }
    })

    // Count profiles that had failed scraping attempts
    const profilesWithFailedScraping = await prisma.influencerDatabase.count({
      where: {
        isActive: true,
        instagramUsername: {
          not: null
        },
        instagramData: null,
        OR: [
          // Profiles that had failed attempts via targetProfileId
          failedAttempts.filter(a => a.targetProfileId).length > 0 ? {
            id: {
              in: failedAttempts.filter(a => a.targetProfileId).map(a => a.targetProfileId!)
            }
          } : undefined,
          // Profiles that had failed attempts via username (when targetProfileId is NULL)
          failedAttempts.filter(a => !a.targetProfileId).length > 0 ? {
            instagramUsername: {
              in: failedAttempts.filter(a => !a.targetProfileId).map(a => a.username)
            }
          } : undefined
        ].filter(Boolean)
      }
    })

    // Get all attempted usernames (successful or failed)
    const attemptedUsernames = await prisma.scrapingAttempt.findMany({
      select: {
        username: true,
        targetProfileId: true
      }
    })

    // Count profiles never attempted
    const attemptedProfileIds = attemptedUsernames
      .filter(a => a.targetProfileId)
      .map(a => a.targetProfileId!)
    
    const attemptedUsernameList = attemptedUsernames.map(a => a.username)

    const profilesNeverAttempted = await prisma.influencerDatabase.count({
      where: {
        isActive: true,
        instagramUsername: {
          not: null
        },
        instagramData: null,
        AND: [
          {
            id: {
              notIn: attemptedProfileIds.length > 0 ? attemptedProfileIds : ['']
            }
          },
          {
            instagramUsername: {
              notIn: attemptedUsernameList.length > 0 ? attemptedUsernameList : ['']
            }
          }
        ]
      }
    })

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
      profilesWithFailedScraping,
      profilesNeverAttempted,
      lastScrapingRun: lastScrapingRun ? {
        id: lastScrapingRun.id,
        status: lastScrapingRun.status,
        completedAt: lastScrapingRun.completedAt?.toISOString(),
        successRate: lastScrapingRun.totalProcessed > 0 
          ? Math.round((lastScrapingRun.totalFound / lastScrapingRun.totalProcessed) * 100)
          : 0
      } : undefined
    }

    console.log('📊 [DEBUG] Instagram scraping stats:', stats)
    console.log('📊 [DEBUG] Failed attempts:', failedAttempts)
    console.log('📊 [DEBUG] Attempted usernames count:', attemptedUsernameList.length)

    return NextResponse.json(stats)

  } catch (error) {
    console.error('❌ [ERROR] Error getting Instagram scraping stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
} 