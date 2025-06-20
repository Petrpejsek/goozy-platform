import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserCache, CountryProfileCache } from '@/lib/cache'

interface CountryData {
  country: string
  countryName: string
  flag: string
  totalProfiles: number
  categories: {
    fashion: number
    beauty: number
    lifestyle: number
    fitness: number
    food: number
    travel: number
    parenting: number
    photography: number
  }
  geographicDistribution: {
    [city: string]: number
  }
  qualityMetrics: {
    active: number
    inactive: number
    avgFollowers: number
    avgEngagement: number
  }
  discoveryMethods: {
    googleSearch: number
    hashtags: number
    manual: number
    import: number
  }
  lastUpdate: string
  profiles: Array<{
    id: string
    username: string
    displayName: string
    followers: number
    category: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }>
  totalCount: number
  metadata: {
    country: string
    fetchedAt: string
    version: number
  }
}

export function useCountryData(country: string) {
  const [data, setData] = useState<CountryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Načíst data z cache nebo API
  const fetchData = useCallback(async (incremental = false) => {
    try {
      setLoading(incremental ? false : true)
      setError(null)

      // Nejdříve zkusit načíst z browser cache
      if (!incremental) {
        const cached = BrowserCache.get(`country_${country}`)
        if (cached) {
          console.log(`Browser cache hit for ${country}`)
          setData(cached)
          setLastUpdate(cached.lastUpdate)
          setLoading(false)
          // Pokračovat v backgroundu pro aktualizaci
        }
      }

      // Sestavit URL pro API
      const url = new URL(`/api/admin/database/${country}`, window.location.origin)
      if (incremental && lastUpdate) {
        url.searchParams.set('since', lastUpdate)
      }

      console.log(`Fetching ${incremental ? 'incremental' : 'full'} data for ${country}`)
      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const newData = await response.json()

      if (incremental && data && newData.profiles?.length > 0) {
        // Merge incremental data s existujícími
        const existingProfilesMap = new Map(
          data.profiles.map(p => [p.id, p])
        )

        // Přidat/aktualizovat nové profily
        newData.profiles.forEach((profile: any) => {
          existingProfilesMap.set(profile.id, profile)
        })

        const mergedData = {
          ...data,
          profiles: Array.from(existingProfilesMap.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          totalProfiles: Math.max(data.totalProfiles, existingProfilesMap.size),
          totalCount: existingProfilesMap.size,
          lastUpdate: newData.lastUpdate,
          metadata: {
            ...data.metadata,
            fetchedAt: new Date().toISOString(),
            version: data.metadata.version + 1
          }
        }

        console.log(`Merged ${newData.profiles.length} new/updated profiles`)
        setData(mergedData)
        setLastUpdate(newData.lastUpdate)
        
        // Uložit do browser cache
        BrowserCache.set(`country_${country}`, mergedData, 15 * 60 * 1000) // 15 minut
      } else {
        // Plná aktualizace
        console.log(`Loaded ${newData.profiles?.length || 0} profiles for ${country}`)
        setData(newData)
        setLastUpdate(newData.lastUpdate)
        
        // Uložit do browser cache
        BrowserCache.set(`country_${country}`, newData, 15 * 60 * 1000)
      }

    } catch (err) {
      console.error('Error fetching country data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [country, data, lastUpdate])

  // Vynutit refresh cache
  const forceRefresh = useCallback(async () => {
    BrowserCache.delete(`country_${country}`)
    setData(null)
    setLastUpdate(null)
    await fetchData(false)
  }, [country, fetchData])

  // Spustit incremental update
  const checkForUpdates = useCallback(() => {
    if (data && lastUpdate) {
      fetchData(true)
    }
  }, [data, lastUpdate, fetchData])

  // Inicializace a periodic updates
  useEffect(() => {
    fetchData(false)

    // Nastavit interval pro pravidelné aktualizace (každé 2 minuty)
    intervalRef.current = setInterval(() => {
      checkForUpdates()
    }, 2 * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [country])

  // Cleanup při změně země
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [country])

  // Real-time aktualizace při focus okna
  useEffect(() => {
    const handleFocus = () => {
      if (!loading && data) {
        checkForUpdates()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loading, data, checkForUpdates])

  return {
    data,
    loading,
    error,
    lastUpdate,
    forceRefresh,
    checkForUpdates,
    // Pomocné gettery
    profiles: data?.profiles || [],
    totalProfiles: data?.totalProfiles || 0,
    isStale: data ? (Date.now() - new Date(data.metadata.fetchedAt).getTime() > 5 * 60 * 1000) : false
  }
} 