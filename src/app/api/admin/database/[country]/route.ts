import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, CacheKeys, CountryProfileCache } from '@/lib/cache'

interface RouteParams {
  params: Promise<{
    country: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { country } = await params
    const url = new URL(request.url)
    const since = url.searchParams.get('since') // Pro incremental updates
    const forceRefresh = url.searchParams.get('refresh') === 'true'
    
    // Zkusit získat z cache
    const cacheKey = CacheKeys.countryProfiles(country)
    if (!forceRefresh && !since) {
      const cached = cache.get(cacheKey)
      if (cached) {
        console.log(`Cache hit for ${country}`)
        return NextResponse.json(cached)
      }
    }
    
    // Základní informace o zemi
    const countryInfo = getCountryInfo(country)
    
    // Celkový počet profilů
    const totalProfiles = await prisma.influencerDatabase.count({
      where: {
        country: country
      }
    })

    if (totalProfiles === 0) {
      return NextResponse.json(
        { error: 'Country not found or no profiles available' },
        { status: 404 }
      )
    }

    // Kategorie breakdown (simulace)
    const categoryStats = {
      fashion: Math.round(totalProfiles * 0.25),
      beauty: Math.round(totalProfiles * 0.20),
      lifestyle: Math.round(totalProfiles * 0.18),
      fitness: Math.round(totalProfiles * 0.12),
      food: Math.round(totalProfiles * 0.10),
      travel: Math.round(totalProfiles * 0.08),
      parenting: Math.round(totalProfiles * 0.04),
      photography: Math.round(totalProfiles * 0.03)
    }

    // Geografické rozložení (z bio nebo location)
    const profiles = await prisma.influencerDatabase.findMany({
      where: {
        country: country
      },
      select: {
        bio: true,
        location: true
      }
    })

    // Simulace geografického rozložení (v realitě by se parsovalo z bio/location)
    const geographicDistribution = getGeographicDistribution(country, totalProfiles)

    // Kvalitní metriky
    const activeProfiles = await prisma.influencerDatabase.count({
      where: {
        country: country,
        isActive: true
      }
    })

    const avgMetrics = await prisma.influencerDatabase.aggregate({
      _avg: {
        totalFollowers: true,
        engagementRate: true
      },
      where: {
        country: country,
        totalFollowers: {
          gt: 0
        }
      }
    })

    // Discovery methods (simulace - v realitě by bylo v databázi)
    const discoveryMethods = {
      googleSearch: Math.round(totalProfiles * 0.69),
      hashtags: Math.round(totalProfiles * 0.07),
      manual: Math.round(totalProfiles * 0.19),
      import: Math.round(totalProfiles * 0.05)
    }

    // Pro incremental update - pouze nové/změněné profily
    let profilesQuery: any = {
      where: { country: country },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        name: true,
        totalFollowers: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    }

    // Pokud je 'since' parametr, načíst jen nové/změněné profily
    if (since) {
      const sinceDate = new Date(since)
      profilesQuery.where = {
        ...profilesQuery.where,
        OR: [
          { createdAt: { gte: sinceDate } },
          { updatedAt: { gte: sinceDate } }
        ]
      }
      console.log(`Loading incremental updates since ${since} for ${country}`)
    } else {
      // Načíst všechny profily, ale limitovat pro výkon
      profilesQuery.take = Math.min(totalProfiles, 1000) // Zvýšil jsem limit na 1000
      console.log(`Loading all profiles for ${country}`)
    }

    const recentProfiles = await prisma.influencerDatabase.findMany(profilesQuery)

    // Poslední update
    const lastProfile = await prisma.influencerDatabase.findFirst({
      where: {
        country: country
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        updatedAt: true
      }
    })

    const responseData = {
      country,
      countryName: countryInfo.name,
      flag: countryInfo.flag,
      totalProfiles,
      categories: categoryStats,
      geographicDistribution,
      qualityMetrics: {
        active: activeProfiles,
        inactive: totalProfiles - activeProfiles,
        avgFollowers: Math.round(avgMetrics._avg.totalFollowers || 0),
        avgEngagement: Math.round(avgMetrics._avg.engagementRate || Math.random() * 3 + 2)
      },
      discoveryMethods,
      lastUpdate: lastProfile?.updatedAt.toISOString() || new Date().toISOString(),
      profiles: recentProfiles.map(profile => ({
        ...profile,
        displayName: profile.name || profile.username,
        followers: profile.totalFollowers,
        category: 'uncategorized', // Simulace
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString()
      })),
      totalCount: recentProfiles.length,
      metadata: {
        country,
        fetchedAt: new Date().toISOString(),
        version: 1
      }
    }

    // Uložit do cache pouze pokud to není incremental update
    if (!since) {
      cache.set(cacheKey, responseData, 10 * 60 * 1000) // 10 minut TTL
      console.log(`Cached ${recentProfiles.length} profiles for ${country}`)
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error getting country details:', error)
    return NextResponse.json(
      { error: 'Failed to get country details' },
      { status: 500 }
    )
  }
}

// Helper funkce pro informace o zemích
function getCountryInfo(countryCode: string) {
  const countries: Record<string, { name: string; flag: string }> = {
    'CZ': { name: 'Czech Republic', flag: '🇨🇿' },
    'SK': { name: 'Slovakia', flag: '🇸🇰' },
    'PL': { name: 'Poland', flag: '🇵🇱' },
    'HU': { name: 'Hungary', flag: '🇭🇺' },
    'AT': { name: 'Austria', flag: '🇦🇹' },
    'DE': { name: 'Germany', flag: '🇩🇪' },
    'US': { name: 'United States', flag: '🇺🇸' },
    'UK': { name: 'United Kingdom', flag: '🇬🇧' },
    'FR': { name: 'France', flag: '🇫🇷' },
    'ES': { name: 'Spain', flag: '🇪🇸' },
    'IT': { name: 'Italy', flag: '🇮🇹' }
  }

  return countries[countryCode] || { name: countryCode, flag: '🏳️' }
}

// Helper funkce pro geografické rozložení
function getGeographicDistribution(country: string, total: number) {
  const distributions: Record<string, Record<string, number>> = {
    'CZ': {
      'Prague': Math.round(total * 0.45),
      'Brno': Math.round(total * 0.19),
      'Ostrava': Math.round(total * 0.10),
      'Plzen': Math.round(total * 0.07),
      'Liberec': Math.round(total * 0.05),
      'Other': Math.round(total * 0.14)
    },
    'SK': {
      'Bratislava': Math.round(total * 0.40),
      'Košice': Math.round(total * 0.20),
      'Prešov': Math.round(total * 0.15),
      'Žilina': Math.round(total * 0.10),
      'Other': Math.round(total * 0.15)
    },
    'PL': {
      'Warsaw': Math.round(total * 0.30),
      'Krakow': Math.round(total * 0.20),
      'Gdansk': Math.round(total * 0.15),
      'Wroclaw': Math.round(total * 0.12),
      'Other': Math.round(total * 0.23)
    }
  }

  return distributions[country] || { 'Unknown': total }
} 