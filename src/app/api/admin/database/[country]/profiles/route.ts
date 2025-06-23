import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const { country } = await params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'

    console.log(`📊 [DEBUG] GET /api/admin/database/${country}/profiles?category=${category} called`)

    // Check cache first
    const cacheKey = `profiles-${country}-${category}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📊 [CACHE] Returning cached data for ${cacheKey}`)
      return NextResponse.json(cached.data)
    }

    let whereCondition: any = {
      isActive: true,
      country: country,
      instagramUsername: {
        not: null
      }
    }

    // Filter based on category
    if (category === 'successfully-downloaded') {
      whereCondition.instagramData = {
        not: null
      }
    } else if (category === 'failed-download') {
      // For failed downloads, we need profiles that actually had failed scraping attempts
      // First get all failed attempts
      const failedAttempts = await prisma.scrapingAttempt.findMany({
        where: {
          status: 'failed'
        },
        select: {
          username: true,
          targetProfileId: true
        }
      })

      // Get profiles that had failed scraping attempts
      const failedProfileIds = failedAttempts
        .filter(a => a.targetProfileId)
        .map(a => a.targetProfileId!)
      
      const failedUsernames = failedAttempts
        .filter(a => !a.targetProfileId)
        .map(a => a.username)

      if (failedProfileIds.length === 0 && failedUsernames.length === 0) {
        // No failed attempts found, return empty result
        const result = {
          profiles: [],
          total: 0,
          category: 'failed-download'
        }

        // Cache the result
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        })

        return NextResponse.json(result)
      }

      // Query profiles that had failed attempts
      const profiles = await prisma.influencerDatabase.findMany({
        where: {
          isActive: true,
          country: country,
          instagramUsername: {
            not: null
          },
          instagramData: null,
          OR: [
            failedProfileIds.length > 0 ? {
              id: {
                in: failedProfileIds
              }
            } : undefined,
            failedUsernames.length > 0 ? {
              instagramUsername: {
                in: failedUsernames
              }
            } : undefined
          ].filter(Boolean)
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 100
      })

      const total = await prisma.influencerDatabase.count({
        where: {
          isActive: true,
          country: country,
          instagramUsername: {
            not: null
          },
          instagramData: null,
          OR: [
            failedProfileIds.length > 0 ? {
              id: {
                in: failedProfileIds
              }
            } : undefined,
            failedUsernames.length > 0 ? {
              instagramUsername: {
                in: failedUsernames
              }
            } : undefined
          ].filter(Boolean)
        }
      })

      console.log(`📊 [DEBUG] Found ${profiles.length} actual failed download profiles for ${country}`)

      const result = {
        profiles,
        total,
        category: 'failed-download'
      }

      // Cache the result
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })

      return NextResponse.json(result)
    }

    // For all profiles and successfully downloaded
    const profiles = await prisma.influencerDatabase.findMany({
      where: whereCondition,
      orderBy: {
        updatedAt: 'desc'
      },
      take: 100 // Limit to first 100 for performance
    })

    const total = await prisma.influencerDatabase.count({
      where: whereCondition
    })

    console.log(`📊 [DEBUG] Found ${profiles.length} profiles for category ${category} in ${country}`)

    const result = {
      profiles,
      total,
      category
    }

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error(`❌ [ERROR] Error getting profiles:`, error)
    return NextResponse.json({ error: 'Failed to get profiles' }, { status: 500 })
  }
} 