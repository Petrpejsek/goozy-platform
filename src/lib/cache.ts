// Cache utility pro efektivní správu dat
class CacheManager {
  private static instance: CacheManager
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minut

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // Uložit data do cache
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Získat data z cache
  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Zkontrolovat TTL
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  // Smazat z cache
  delete(key: string): void {
    this.cache.delete(key)
  }

  // Vyčistit celou cache
  clear(): void {
    this.cache.clear()
  }

  // Invalidovat cache podle patternu
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Získat statistiky cache
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Browser localStorage cache pro persistence
export class BrowserCache {
  private static prefix = 'goozy_cache_'

  static set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    if (typeof window === 'undefined') return

    const item = {
      data,
      timestamp: Date.now(),
      ttl
    }

    try {
      localStorage.setItem(
        this.prefix + key, 
        JSON.stringify(item)
      )
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  static get(key: string): any | null {
    if (typeof window === 'undefined') return null

    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) return null

      const parsed = JSON.parse(item)
      
      // Zkontrolovat TTL
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(this.prefix + key)
        return null
      }

      return parsed.data
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return null
    }
  }

  static delete(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.prefix + key)
  }

  static clear(): void {
    if (typeof window === 'undefined') return
    
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

// Typy pro cache data
export interface CountryProfileCache {
  profiles: Array<{
    id: string
    username: string
    name: string
    totalFollowers: number
    isActive: boolean
    createdAt: string
    updatedAt: string
  }>
  totalCount: number
  lastUpdate: string
  metadata: {
    country: string
    fetchedAt: string
    version: number
  }
}

// Main cache instance export
export const cache = CacheManager.getInstance()

// Pomocné funkce pro práci s cache
export const CacheKeys = {
  // Profily podle země
  countryProfiles: (country: string) => `profiles_${country}`,
  // Poslední update timestamp
  lastUpdate: (country: string) => `last_update_${country}`,
  // Metadata o zemi
  countryMeta: (country: string) => `meta_${country}`,
  // Nové profily od posledního načtení
  newProfiles: (country: string, since: string) => `new_${country}_${since}`,
}

// Utility pro incremental updates
export class IncrementalCache {
  static async getProfilesWithUpdates(
    country: string, 
    lastUpdate?: string
  ): Promise<CountryProfileCache | null> {
    const cacheKey = CacheKeys.countryProfiles(country)
    
    // Zkusit získat z cache
    let cached = cache.get(cacheKey)
    if (cached && !lastUpdate) {
      return cached
    }

    // Pokud máme lastUpdate, zkusit načíst jen rozdíl
    if (lastUpdate && cached) {
      const newProfilesKey = CacheKeys.newProfiles(country, lastUpdate)
      const newProfiles = cache.get(newProfilesKey)
      
      if (newProfiles) {
        // Mergovat nové profily s existujícími
        return this.mergeProfileData(cached, newProfiles)
      }
    }

    return null
  }

  static mergeProfileData(
    existing: CountryProfileCache, 
    updates: Partial<CountryProfileCache>
  ): CountryProfileCache {
    if (!updates.profiles) return existing

    // Vytvořit mapu existujících profilů
    const existingMap = new Map(
      existing.profiles.map(p => [p.id, p])
    )

    // Aktualizovat/přidat nové profily
    updates.profiles.forEach(profile => {
      existingMap.set(profile.id, profile)
    })

    return {
      ...existing,
      profiles: Array.from(existingMap.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      totalCount: existingMap.size,
      lastUpdate: updates.lastUpdate || existing.lastUpdate,
      metadata: {
        ...existing.metadata,
        fetchedAt: new Date().toISOString(),
        version: existing.metadata.version + 1
      }
    }
  }
} 