import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Získat všechny profily seskupené podle země
    const profilesByCountry = await prisma.influencerDatabase.groupBy({
      by: ['country'],
      _count: {
        id: true
      },
      where: {
        country: {
          not: null
        }
      }
    })

    // Získat detailní statistiky pro každou zemi
    const countries = await Promise.all(
      profilesByCountry.map(async (countryGroup) => {
        const country = countryGroup.country!
        
        // Základní informace o zemi
        const countryInfo = getCountryInfo(country)
        
        // Kvalita profilů (aktivní vs neaktivní)
        const totalProfiles = countryGroup._count.id
        
        // Kategorie breakdown (simulace - model nemá category field)
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
        const activeProfiles = await prisma.influencerDatabase.count({
          where: {
            country: country,
            isActive: true
          }
        })

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

        return {
          country,
          countryName: countryInfo.name,
          flag: countryInfo.flag,
          totalProfiles,
          categories: categoryStats,
          lastUpdate: lastProfile?.updatedAt.toISOString() || new Date().toISOString(),
          qualityScore: Math.round((activeProfiles / totalProfiles) * 100)
        }
      })
    )

    // Seřadit podle počtu profilů
    countries.sort((a, b) => b.totalProfiles - a.totalProfiles)

    // Globální statistiky
    const totalProfiles = countries.reduce((sum, c) => sum + c.totalProfiles, 0)
    const totalCountries = countries.length
    const totalCategories = 8 // pevný počet simulovaných kategorií
    const totalActiveProfiles = await prisma.influencerDatabase.count({
      where: { isActive: true }
    })
    const activeRate = totalProfiles > 0 ? (totalActiveProfiles / totalProfiles) * 100 : 0

    return NextResponse.json({
      countries,
      globalStats: {
        totalProfiles,
        totalCountries,
        totalCategories,
        activeRate
      }
    })

  } catch (error) {
    console.error('Error getting database overview:', error)
    return NextResponse.json(
      { error: 'Failed to get database overview' },
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