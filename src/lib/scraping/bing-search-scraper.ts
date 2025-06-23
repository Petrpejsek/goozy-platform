// Skutečný Bing Search Discovery pro Instagram profily
import { chromium, Browser, Page } from 'playwright'

interface InstagramProfile {
  username: string
  url: string
}

interface BingSearchOptions {
  maxPagesPerHashtag?: number
  maxProfilesTotal?: number
}

export class BingSearchScraper {
  private browser: Browser | null = null
  private sessionCount = 0
  private lastRequestTime = 0
  
  // Jednoduchý User Agent
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  async initialize(): Promise<void> {
    try {
      console.log('🔍 [BING-SEARCH] Initializing Bing Search scraper...')
      
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      })
      
      console.log('✅ [BING-SEARCH] Browser initialized successfully')
    } catch (error) {
      console.error('❌ [BING-SEARCH] Failed to initialize browser:', error)
      throw error
    }
  }

  // Náhodné zpoždění pro lidské chování
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    console.log(`⏳ [BING-SEARCH] Waiting ${delay}ms...`)
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  // Jednoduché zpoždění (zachováno pro kompatibilitu)
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Sestavení optimalizovaného Bing Search URL
  private buildBingSearchUrl(searchTerm: string, country: string, page: number = 1): string {
    // Vytvoření dotazu zaměřeného přímo na doménu Instagramu
    // Použijeme operátor "site:" abychom Bing přinutili vracet odkazy z instagram.com
    const queryParts: string[] = [
      'site:instagram.com',     // silný filtr pouze na Instagram doménu
      'Instagram',              // přidat text "Instagram" pro lepší výsledky
      searchTerm.trim()         // konkrétní klíčové slovo / hashtag / výraz
    ]

    // Přidat zemi jako další klíčové slovo – Bing to často respektuje v titulku/bio
    if (country && country.trim()) {
      queryParts.push(country.trim())
    }

    const query = queryParts.join(' ')

    // Zakódovat + přidat stránkování (parametr first)
    const encodedQuery = encodeURIComponent(query)
    const resultsPerPage = 50 // Více výsledků na stránku
    const first = ((page - 1) * resultsPerPage) + 1 // Správný výpočet offsetu

    let finalUrl = `https://www.bing.com/search?q=${encodedQuery}&count=${resultsPerPage}`
    if (page > 1) {
      finalUrl += `&first=${first}`
    }

    // Lepší lokalizace – přidej jazyk/region parametry
    if (country) {
      const lang = country.toLowerCase()
      const marketCode = lang === 'es' ? 'es-ES' : lang === 'cz' ? 'cs-CZ' : `${lang}-${lang.toUpperCase()}`
      finalUrl += `&mkt=${marketCode}&setlang=${lang}`
    }

    console.log(`🔗 [BING-SEARCH] Built URL: ${finalUrl}`)
    console.log(`🔍 [BING-SEARCH] Search query: "${query}" (page ${page})`)
    return finalUrl
  }

  // Nastavení stránky
  private async setupPage(page: Page): Promise<void> {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.setExtraHTTPHeaders({
      'User-Agent': this.userAgent,
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    })
    console.log(`🎭 [BING-SEARCH] Page setup completed`)
  }

  // Extrakce Instagram profilů - zaměřit se na Bing výsledky
  private async extractInstagramProfiles(page: Page): Promise<string[]> {
    try {
      console.log(`🔍 [BING-SEARCH] Starting profile extraction...`)
      
      // Náhodné čekání na načtení (2-7 sekund)
      await this.randomDelay(2000, 7000)
      
      // DEBUG: Zjistit základní info o stránce
      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          bodyLength: document.body.innerText.length,
          hasInstagramText: document.body.innerText.includes('instagram.com'),
          linkCount: document.querySelectorAll('a').length,
          instagramLinkCount: document.querySelectorAll('a[href*="instagram.com"]').length,
          bingResultsCount: document.querySelectorAll('#b_results').length,
          searchResultsCount: document.querySelectorAll('.b_algo').length
        }
      })
      
      console.log(`📄 [BING-SEARCH] Page info:`, JSON.stringify(pageInfo, null, 2))
      
      // Extrakce zaměřená na Bing search výsledky
      const profiles = await page.evaluate(() => {
        function tryDecodeRedirect(href: string): string {
          try {
            const url = new URL(href)
            // Projít všechny parametry a dekódovat první, která po dekódování obsahuje instagram.com
            for (const [key, value] of url.searchParams.entries()) {
              if (!value) continue
              let decoded = decodeURIComponent(value)
              if (!decoded.startsWith('http')) {
                try {
                  decoded = atob(decoded)
                } catch {}
              }
              if (decoded.includes('instagram.com')) {
                return decoded
              }
            }
          } catch {}
          return href
        }

        function isValidUsername(username: string): boolean {
          const invalid = [
            'p','reel','explore','stories','tv','accounts','about','help','press','api','jobs','privacy','terms','directory','language','static','rsrc','js','css','html','php'
          ]
          if (!username) return false
          if (invalid.includes(username)) return false
          if (username.length < 2 || username.length > 30) return false
          if (!/^[a-zA-Z0-9._]+$/.test(username)) return false
          if (username.startsWith('.') || username.endsWith('.')) return false
          return true
        }

        const found: string[] = []

        // 1) Iterate all anchor links on the page
        const anchors = Array.from(document.querySelectorAll('a'))
        anchors.forEach((a, idx) => {
          let href = a.getAttribute('href') || ''
          if (!href) return
          // decode redirect links
          href = tryDecodeRedirect(href)
          if (href.includes('instagram.com')) {
            const match = href.match(/instagram\.com\/([a-zA-Z0-9._]+)/)
            if (match && match[1] && isValidUsername(match[1])) {
              found.push(match[1])
            }
          }
        })

        // 2) Fallback – scan entire HTML for encoded instagram links (u= parameter)
        if (found.length === 0) {
          const html = document.documentElement.innerHTML
          const urlRegex = /(?:(?:u|url)=)([A-Za-z0-9%]+)(?:&|"|')/g
          let m
          while ((m = urlRegex.exec(html)) !== null) {
            let enc = m[1]
            try {
              let decoded = decodeURIComponent(enc)
              if (!decoded.startsWith('http')) {
                decoded = atob(decoded)
              }
              const match = decoded.match(/instagram\.com\/([a-zA-Z0-9._]+)/)
              if (match && match[1] && isValidUsername(match[1])) {
                found.push(match[1])
              }
            } catch {}
          }
        }

        return [...new Set(found)]
      })
      
      console.log(`📱 [BING-SEARCH] Found ${profiles.length} Instagram profiles:`, profiles)
      return profiles
      
    } catch (error) {
      console.error(`❌ [BING-SEARCH] Error extracting profiles:`, error)
      return []
    }
  }

  // Hlavní funkce pro vyhledávání
  async searchInstagramProfiles(
    searchTerms: string[], 
    country: string = 'CZ', 
    options: BingSearchOptions = {}
  ): Promise<string[]> {
    const { maxPagesPerHashtag = 20, maxProfilesTotal = 0 } = options // Default 20 stránek pro důkladné prohledání
    
    console.log(`🔍 [BING-SEARCH] Starting search for ${searchTerms.length} terms in ${country}`)
    console.log(`⚙️ [BING-SEARCH] Config: ${maxPagesPerHashtag} pages per hashtag, ${maxProfilesTotal || 'unlimited'} total profiles`)
    
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }
    
    const allProfiles: Set<string> = new Set()
    
    for (const searchTerm of searchTerms) {
      console.log(`🔍 [BING-SEARCH] Processing search term: "${searchTerm}"`)
      
      // Vícestránkové vyhledávání
      for (let pageNum = 1; pageNum <= maxPagesPerHashtag; pageNum++) {
        console.log(`📄 [BING-SEARCH] Processing page ${pageNum}/${maxPagesPerHashtag}`)
        
        let page: Page | null = null
        
        try {
          page = await this.browser.newPage()
          await this.setupPage(page)
          
          // Pro další stránky upravíme URL
          const searchUrl = this.buildBingSearchUrl(searchTerm, country, pageNum)
          console.log(`🌐 [BING-SEARCH] Navigating to: ${searchUrl}`)
          
          const response = await page.goto(searchUrl, {
            waitUntil: 'networkidle',
            timeout: 30000
          })
          
          console.log(`📡 [BING-SEARCH] Response status: ${response?.status()}`)
          
          if (!response || !response.ok()) {
            console.log(`⚠️ [BING-SEARCH] Page ${pageNum} failed with status: ${response?.status()}`)
            
            if (response?.status() === 429) {
              console.log(`🔄 [BING-SEARCH] Rate limited, waiting...`)
              await this.randomDelay(12000, 20000)
              continue
            }
            
            break // Ukončit paginaci při jiných chybách
          }
          
          console.log(`✅ [BING-SEARCH] Page ${pageNum} loaded successfully`)
          
          // Extrahovat profily
          const pageProfiles = await this.extractInstagramProfiles(page)
          
          console.log(`📊 [BING-SEARCH] Page ${pageNum} extracted ${pageProfiles.length} profiles for "${searchTerm}":`, pageProfiles)
          
          if (pageProfiles.length === 0) {
            console.log(`📄 [BING-SEARCH] Page ${pageNum} has no results, stopping pagination`)
            break
          }
          
          // Přidat profily do celkového seznamu
          pageProfiles.forEach(profile => {
            if (maxProfilesTotal === 0 || allProfiles.size < maxProfilesTotal) {
              allProfiles.add(profile)
              console.log(`➕ [BING-SEARCH] Added profile: ${profile} (total: ${allProfiles.size})`)
            }
          })
          
          console.log(`📊 [BING-SEARCH] Page ${pageNum}: Found ${pageProfiles.length} profiles (total: ${allProfiles.size})`)
          
          // Kontrola limitu
          if (maxProfilesTotal > 0 && allProfiles.size >= maxProfilesTotal) {
            console.log(`🛑 [BING-SEARCH] Reached profile limit: ${maxProfilesTotal}`)
            break
          }
          
        } catch (error) {
          console.error(`❌ [BING-SEARCH] Error on page ${pageNum} for "${searchTerm}":`, error)
          break
        } finally {
          if (page) {
            try {
              await page.close()
            } catch (e) {
              console.log('⚠️ [BING-SEARCH] Error closing page')
            }
          }
        }
        
        // Pauza mezi stránkami (3-8 sekund)
        await this.randomDelay(3000, 8000)
      }
      
      // Kontrola celkového limitu mezi search terms
      if (maxProfilesTotal > 0 && allProfiles.size >= maxProfilesTotal) {
        console.log(`🛑 [BING-SEARCH] Reached total profile limit: ${maxProfilesTotal}`)
        break
      }
      
      // Pauza mezi search terms (2-5 sekund)
      await this.randomDelay(2000, 5000)
    }
    
    const uniqueProfiles = Array.from(allProfiles)
    console.log(`📊 [BING-SEARCH] Search completed: ${uniqueProfiles.length} unique profiles found`)
    console.log(`📝 [BING-SEARCH] Final profiles:`, uniqueProfiles)
    
    return uniqueProfiles
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close()
        console.log('🔚 [BING-SEARCH] Browser closed')
      } catch (error) {
        console.error('❌ [BING-SEARCH] Error closing browser:', error)
      }
      this.browser = null
    }
  }
} 