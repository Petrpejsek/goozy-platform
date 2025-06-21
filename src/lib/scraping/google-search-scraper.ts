// Google Search Discovery pro Instagram profily
import puppeteer, { Browser, Page } from 'puppeteer'

export interface GoogleSearchResult {
  username: string
  profileUrl: string
  title: string
  snippet: string
  category?: string
  location?: string
}

export class GoogleSearchScraper {
  private browser: Browser | null = null

  async initialize(): Promise<void> {
    console.log('🔍 [GOOGLE-SEARCH] Initializing Google Search scraper...')
    
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-blink-features=AutomationControlled',
          '--no-first-run',
          '--disable-infobars',
          '--disable-extensions',
          '--window-size=1920,1080',
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      })
      
      console.log('✅ [GOOGLE-SEARCH] Browser initialized successfully')
    } catch (error) {
      console.error('❌ [GOOGLE-SEARCH] Failed to initialize browser:', error)
      throw error
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('🔚 [GOOGLE-SEARCH] Closing browser...')
      await this.browser.close()
      this.browser = null
    }
  }

  isInitialized(): boolean {
    return this.browser !== null
  }

  private async randomDelay(min: number = 8000, max: number = 15000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    console.log(`⏳ [GOOGLE-SEARCH] Waiting ${delay}ms before next request...`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
    ]
    return userAgents[Math.floor(Math.random() * userAgents.length)]
  }

  private async setupPage(page: Page): Promise<void> {
    const userAgent = this.getRandomUserAgent()
    console.log(`🎭 [GOOGLE-SEARCH] Using User-Agent: ${userAgent.substring(0, 50)}...`)
    
    // Anti-detection setup
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })
      
      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      })
      
      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['cs-CZ', 'cs', 'en-US', 'en'],
      })

      // Hide automation indicators
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Array
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Promise
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Symbol
    })

    // Set random User-Agent
    await page.setUserAgent(userAgent)
    await page.setViewport({ 
      width: 1366 + Math.floor(Math.random() * 300), 
      height: 768 + Math.floor(Math.random() * 200) 
    })

    // 🌍 FAKE GEOLOCATION - Praha, Czech Republic
    console.log(`🌍 [GOOGLE-SEARCH] Setting geolocation to Prague, Czech Republic`)
    const context = page.browserContext()
    await context.overridePermissions('https://www.google.cz', ['geolocation'])
    await page.setGeolocation({
      latitude: 50.0755,  // Praha
      longitude: 14.4378, // Praha  
      accuracy: 100
    })
    
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'cs-CZ,cs;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
      'X-Forwarded-For': '85.207.2.100', // Czech IP address
      'CF-IPCountry': 'CZ'
    })

    // Add random delay before starting
    await this.randomDelay(3000, 6000)
  }

  // Generování search queries podle kategorie a lokace
  private generateSearchQueries(country: string, category?: string): string[] {
    const baseQueries = [
      'site:instagram.com',
      'site:www.instagram.com'
    ]

    const locationTerms: Record<string, string[]> = {
      'CZ': [
        'Praha', 'prague', 'Brno', 'Ostrava', 'Plzeň', 'České Budějovice',
        'Hradec Králové', 'Pardubice', 'Zlín', 'Olomouc', 'Liberec',
        'česká', 'český', 'czech', 'Československá'
      ],
      'SK': [
        'Bratislava', 'Košice', 'Prešov', 'Nitra', 'Trenčín', 'Žilina', 'Banská Bystrica',
        'slovenská', 'slovenský', 'slovak', 'slovakia', 'slovensko', 'blogerka', 'influencer'
      ]
    }

    const categoryTerms: Record<string, string[]> = {
      'fashion': ['fashion', 'móda', 'style', 'outfit', 'OOTD', 'styling'],
      'beauty': ['beauty', 'makeup', 'cosmetics', 'skincare', 'líčení', 'krása'],
      'lifestyle': ['lifestyle', 'blogger', 'blogerka', 'life', 'životní styl'],
      'fitness': ['fitness', 'gym', 'workout', 'sport', 'health', 'zdraví'],
      'food': ['food', 'recipe', 'cooking', 'jídlo', 'recepty', 'vaření'],
      'travel': ['travel', 'cestování', 'trip', 'vacation', 'dovolená'],
      'parenting': ['mama', 'mum', 'mom', 'baby', 'děti', 'rodina'],
      'photography': ['photography', 'foto', 'photographer', 'fotograf']
    }

    const queries: string[] = []
    const locations = locationTerms[country] || locationTerms['CZ']
    const categories = category ? categoryTerms[category] || [] : Object.values(categoryTerms).flat()

    // Kombinace: site:instagram.com + lokace + kategorie
    locations.forEach(location => {
      categories.forEach(cat => {
        queries.push(`site:instagram.com "${location}" "${cat}"`)
        queries.push(`site:instagram.com "${location} ${cat}"`)
        queries.push(`site:instagram.com ${location} ${cat} influencer`)
        queries.push(`site:instagram.com ${location} ${cat} blogger`)
      })
    })

    // Obecnější queries podle země
    if (country === 'CZ') {
      queries.push(`site:instagram.com "czech blogger"`)
      queries.push(`site:instagram.com "česká blogerka"`)
      queries.push(`site:instagram.com "prague influencer"`)
      queries.push(`site:instagram.com "český youtuber"`)
    } else if (country === 'SK') {
      queries.push(`site:instagram.com "slovak blogger"`)
      queries.push(`site:instagram.com "slovenská blogerka"`)
      queries.push(`site:instagram.com "bratislava influencer"`)
      queries.push(`site:instagram.com "slovenský youtuber"`)
      queries.push(`site:instagram.com "slovakia fashion"`)
    } else {
      queries.push(`site:instagram.com "${country.toLowerCase()} blogger"`)
      queries.push(`site:instagram.com "${country.toLowerCase()} influencer"`)
    }

    return queries
  }

  // Hlavní metoda pro search Instagram profilů
  async searchInstagramProfiles(searchQuery: string, country: string = 'CZ', limit: number = 50000): Promise<string[]> {
    if (!this.browser) {
      await this.initialize()
    }

    console.log(`🔍 [GOOGLE-SEARCH] Starting search for: "${searchQuery}" in country: ${country}`)
    
    try {
      const results = await this.performSingleSearch(searchQuery, country)
      
      // Extrahuj usernames z výsledků
      const usernames = results
        .map(result => result.username)
        .filter(username => username && username.length > 0)
        .slice(0, limit)

      console.log(`📊 [GOOGLE-SEARCH] Found ${usernames.length} Instagram usernames`)
      return usernames

    } catch (error) {
      console.error(`❌ [GOOGLE-SEARCH] Error searching for "${searchQuery}":`, error)
      return []
    }
  }

  // Provést jeden Google search
  private async performSingleSearch(query: string, country: string = 'CZ'): Promise<GoogleSearchResult[]> {
    let page: Page | null = null
    
    try {
      page = await this.browser!.newPage()
      await this.setupPage(page)

      // Použití lokálních Google domén pro lepší výsledky
      const googleDomains: Record<string, string> = {
        'CZ': 'google.cz',
        'SK': 'google.sk', 
        'PL': 'google.pl',
        'HU': 'google.hu',
        'AT': 'google.at',
        'DE': 'google.de'
      }
      
      const domain = googleDomains[country] || 'google.com'
      const searchUrl = `https://www.${domain}/search?q=${encodeURIComponent(query)}&num=100&hl=${country.toLowerCase()}&gl=${country}`
      console.log(`🌐 [GOOGLE-SEARCH] Navigating to: ${searchUrl}`)

      // Přidat delay před navigací
      await this.randomDelay(2000, 5000)
      
      const response = await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      })

      if (!response || !response.ok()) {
        const status = response?.status()
        console.log(`⚠️ [GOOGLE-SEARCH] Google returned status: ${status}`)
        
        if (status === 429) {
          console.log(`🔄 [GOOGLE-SEARCH] Rate limited, waiting longer...`)
          await this.randomDelay(30000, 60000) // Wait 30-60 seconds
        }
        
        throw new Error(`Failed to load Google search: ${status}`)
      }

      // Počkat na načtení výsledků - delší delay
      console.log(`⏳ [GOOGLE-SEARCH] Page loaded, waiting for results...`)
      await this.randomDelay(5000, 10000)

      // Extract search results
      const results = await page.evaluate(() => {
        const searchResults: GoogleSearchResult[] = []
        
        // Selector pro Google search results
        const resultElements = document.querySelectorAll('div[data-ved] h3, .g h3, .tF2Cxc h3')
        
        resultElements.forEach(element => {
          try {
            const linkElement = element.closest('a') || element.querySelector('a')
            if (!linkElement) return

            const href = linkElement.getAttribute('href')
            if (!href || !href.includes('instagram.com/')) return

            // Extract username z Instagram URL
            const instagramUrlMatch = href.match(/instagram\.com\/([a-zA-Z0-9._]+)\/?/)
            if (!instagramUrlMatch) return

            const username = instagramUrlMatch[1]
            
            // Skip URL parameters a nevalidní usernames
            if (username.includes('?') || username.includes('=') || username.length < 2) return

            const title = element.textContent?.trim() || ''
            
            // Najít snippet (description)
            const resultContainer = element.closest('.g, .tF2Cxc, [data-ved]')
            const snippetElement = resultContainer?.querySelector('[data-ved] span, .s, .VwiC3b')
            const snippet = snippetElement?.textContent?.trim() || ''

            searchResults.push({
              username,
              profileUrl: `https://www.instagram.com/${username}/`,
              title,
              snippet
            })

          } catch (error) {
            console.error('Error parsing search result:', error)
          }
        })

        return searchResults
      })

      await page.close()
      
      console.log(`📱 [GOOGLE-SEARCH] Extracted ${results.length} Instagram profiles from search`)
      return results

    } catch (error) {
      console.error(`❌ [GOOGLE-SEARCH] Error performing search:`, error)
      if (page) {
        try {
          await page.close()
        } catch (e) {
          console.error('Error closing page:', e)
        }
      }
      return []
    }
  }

  // Filtrovat výsledky podle kritérií
  filterResults(results: GoogleSearchResult[], filters: {
    minTitleLength?: number
    requiresKeywords?: string[]
    excludeKeywords?: string[]
    maxResults?: number
  } = {}): GoogleSearchResult[] {
    return results
      .filter(result => {
        // Minimální délka title
        if (filters.minTitleLength && result.title.length < filters.minTitleLength) {
          return false
        }

        // Vyžadované keywords
        if (filters.requiresKeywords && filters.requiresKeywords.length > 0) {
          const searchText = `${result.title} ${result.snippet}`.toLowerCase()
          const hasRequiredKeyword = filters.requiresKeywords.some(keyword => 
            searchText.includes(keyword.toLowerCase())
          )
          if (!hasRequiredKeyword) return false
        }

        // Vyloučené keywords
        if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
          const searchText = `${result.title} ${result.snippet}`.toLowerCase()
          const hasExcludedKeyword = filters.excludeKeywords.some(keyword => 
            searchText.includes(keyword.toLowerCase())
          )
          if (hasExcludedKeyword) return false
        }

        return true
      })
      .slice(0, filters.maxResults || 10000)
  }
} 