// Google Search Discovery pro Instagram profily - Anti-Rate-Limiting verze
import { Browser, Page } from 'playwright'
import { chromium } from 'playwright'

interface GoogleSearchResult {
  title: string
  url: string
  snippet: string
}

interface InstagramProfile {
  username: string
  url: string
}

export class GoogleSearchScraper {
  private browser: Browser | null = null
  private sessionCount = 0
  private lastRequestTime = 0
  private consecutiveErrors = 0
  
  // Rotace různých Google domén a parametrů
  private googleDomains = [
    'google.com',
    'google.es', 
    'google.com.mx',
    'google.com.ar',
    'google.com.co',
    'google.cl'
  ]
  
  // Více realistických user agentů
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  ]

  async initialize(): Promise<void> {
    console.log('🔍 [GOOGLE-SEARCH] Initializing Anti-Rate-Limiting Google Search scraper...')
    
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        // Anti-detekce argumenty
        '--disable-extensions-file-access-check',
        '--disable-extensions-http-throttling',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
        '--enable-features=NetworkService,NetworkServiceLogging',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--use-mock-keychain'
      ]
    })
    
    console.log('✅ [GOOGLE-SEARCH] Anti-Rate-Limiting browser initialized successfully')
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
  }

  private getRandomGoogleDomain(): string {
    return this.googleDomains[Math.floor(Math.random() * this.googleDomains.length)]
  }

  // Simulace lidského chování - náhodné čekání s realistickými vzorci
  private async humanLikeDelay(type: 'typing' | 'reading' | 'navigation' | 'error' = 'navigation'): Promise<void> {
    let min: number, max: number
    
    switch (type) {
      case 'typing':
        min = 100; max = 300; // Rychlé psaní
        break
      case 'reading':
        min = 2000; max = 5000; // Čtení výsledků
        break
      case 'navigation':
        min = 8000; max = 20000; // Přechod mezi stránkami
        break
      case 'error':
        min = 300000; max = 900000; // 5-15 minut po chybě
        break
    }
    
    // Exponenciální rozložení pro realističtější čekání
    const lambda = 2 / (min + max)
    const exponentialDelay = -Math.log(Math.random()) / lambda
    const finalDelay = Math.max(min, Math.min(max, exponentialDelay))
    
    console.log(`⏳ [GOOGLE-SEARCH] Human-like ${type} delay: ${Math.round(finalDelay)}ms`)
    await new Promise(resolve => setTimeout(resolve, finalDelay))
  }

  // Pokročilé stealth nastavení stránky
  private async setupStealthPage(page: Page, country: string = 'ES'): Promise<void> {
    const userAgent = this.getRandomUserAgent()
    console.log(`🎭 [GOOGLE-SEARCH] Using stealth User-Agent: ${userAgent.substring(0, 50)}...`)
    
    // Náhodné viewport rozměry
    const viewportWidth = 1200 + Math.floor(Math.random() * 600) // 1200-1800
    const viewportHeight = 700 + Math.floor(Math.random() * 400)  // 700-1100
    
    await page.setViewportSize({ 
      width: viewportWidth, 
      height: viewportHeight 
    })

    // Pokročilé headers s rotací
    const languages = ['es-ES,es;q=0.9,en;q=0.8', 'es;q=0.9,en-US;q=0.8,en;q=0.7', 'es-ES,es;q=0.8,en;q=0.7']
    const acceptHeaders = [
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    ]
    
    await page.setExtraHTTPHeaders({
      'Accept-Language': languages[Math.floor(Math.random() * languages.length)],
      'Accept': acceptHeaders[Math.floor(Math.random() * acceptHeaders.length)],
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': Math.random() > 0.5 ? '1' : '0', // Náhodná DNT hodnota
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    })

    // Skrytí automatizace
    await page.addInitScript(() => {
      // Přepis webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })
      
      // Přepis plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      })
      
      // Přepis languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-ES', 'es', 'en-US', 'en'],
      })
      
      // Chrome runtime
      (window as any).chrome = {
        runtime: {},
      }
    })

    console.log(`🔧 [GOOGLE-SEARCH] Stealth page setup completed for ${country}`)
  }

  // Inteligentní rate limiting s exponenciálním backoff
  private async intelligentRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    // Minimální čekání mezi požadavky (zvyšuje se s počtem chyb)
    const baseMinDelay = 15000 + (this.consecutiveErrors * 30000) // 15s + 30s za každou chybu
    const baseMaxDelay = 45000 + (this.consecutiveErrors * 60000) // 45s + 60s za každou chybu
    
    if (timeSinceLastRequest < baseMinDelay) {
      const additionalWait = baseMinDelay - timeSinceLastRequest
      console.log(`🚦 [GOOGLE-SEARCH] Rate limiting: waiting additional ${additionalWait}ms`)
      await new Promise(resolve => setTimeout(resolve, additionalWait))
    }
    
    // Náhodné čekání pro nepředvídatelnost
    await this.humanLikeDelay('navigation')
    
    this.lastRequestTime = Date.now()
  }

  // Rotace search parametrů pro diverzifikaci
  private buildSearchUrl(searchTerm: string, country: string): string {
    const domain = this.getRandomGoogleDomain()
    
    // Rotace různých parametrů
    const numResults = [50, 100][Math.floor(Math.random() * 2)]
    const safeSearch = ['off', 'medium'][Math.floor(Math.random() * 2)]
    const languages = ['es', 'en', country.toLowerCase()]
    const lang = languages[Math.floor(Math.random() * languages.length)]
    
    // Někdy přidat extra parametry pro diverzifikaci
    const extraParams = Math.random() > 0.5 ? `&tbs=qdr:y&filter=0` : ''
    
    const searchUrl = `https://www.${domain}/search?q=${encodeURIComponent(searchTerm)}&num=${numResults}&hl=${lang}&gl=${country}&safe=${safeSearch}${extraParams}`
    
    console.log(`🌐 [GOOGLE-SEARCH] Using domain: ${domain} with params: num=${numResults}, safe=${safeSearch}, lang=${lang}`)
    return searchUrl
  }

  // Hlavní vyhledávací metoda s pokročilým anti-rate-limiting
  private async performSingleSearch(searchTerm: string, country: string): Promise<InstagramProfile[]> {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    // Rotace kontextu pro každý 3. požadavek
    this.sessionCount++
    const shouldRotateContext = this.sessionCount % 3 === 0
    
    const page = await this.browser.newPage()
    
    try {
      await this.setupStealthPage(page, country)
      
      // Inteligentní rate limiting
      await this.intelligentRateLimit()
      
      const searchUrl = this.buildSearchUrl(searchTerm, country)
      console.log(`🔍 [GOOGLE-SEARCH] Starting search: "${searchTerm}" (session ${this.sessionCount})`)
      
      // Simulace lidského chování - postupné načítání
      console.log(`🌐 [GOOGLE-SEARCH] Navigating to: ${searchUrl}`)
      
      const response = await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 90000 // Delší timeout
      })
      
      if (!response || !response.ok()) {
        const status = response?.status()
        console.log(`⚠️ [GOOGLE-SEARCH] Google returned status: ${status}`)
        
        if (status === 429) {
          this.consecutiveErrors++
          console.log(`🔄 [GOOGLE-SEARCH] Rate limited (error #${this.consecutiveErrors}), using exponential backoff...`)
          
          // Exponenciální backoff - čím více chyb, tím delší čekání
          const backoffDelay = Math.min(3600000, 60000 * Math.pow(2, this.consecutiveErrors)) // Max 1 hodina
          console.log(`⏳ [GOOGLE-SEARCH] Waiting ${Math.round(backoffDelay/1000)}s for exponential backoff...`)
          await new Promise(resolve => setTimeout(resolve, backoffDelay))
          
          throw new Error(`Rate limited by Google (429) - attempt ${this.consecutiveErrors}`)
        } else {
          throw new Error(`Failed to load Google search: ${status}`)
        }
      }

      // Reset error counter při úspěchu
      this.consecutiveErrors = 0

      // Simulace čtení výsledků
      console.log(`⏳ [GOOGLE-SEARCH] Page loaded, simulating human reading behavior...`)
      await this.humanLikeDelay('reading')

      // Někdy simulovat scrollování
      if (Math.random() > 0.7) {
        console.log(`📜 [GOOGLE-SEARCH] Simulating human scrolling...`)
        await page.evaluate(() => {
          window.scrollTo(0, Math.floor(Math.random() * 500))
        })
        await this.humanLikeDelay('reading')
      }

      // Extrakce Instagram profilů s vylepšenou logikou
      const profiles = await page.evaluate(() => {
        const results: InstagramProfile[] = []
        const seenUsernames = new Set<string>()
        
        // Více selektorů pro různé typy výsledků
        const selectors = [
          'a[href*="instagram.com"]',
          'cite[href*="instagram.com"]',
          '[data-ved] a[href*="instagram.com"]',
          'h3 a[href*="instagram.com"]',
          '.g a[href*="instagram.com"]'
        ]
        
        selectors.forEach(selector => {
          const links = document.querySelectorAll(selector)
          
          links.forEach(link => {
            const href = link.getAttribute('href') || link.textContent
            if (href && href.includes('instagram.com')) {
              // Pokročilejší regex pro extrakci username
              const patterns = [
                /instagram\.com\/([a-zA-Z0-9_.]+)\/?(?:\?|$)/,
                /instagram\.com\/([a-zA-Z0-9_.]+)\/$/,
                /instagram\.com\/([a-zA-Z0-9_.]+)$/,
                /instagram\.com\/p\/[^\/]+\/\?taken-by=([a-zA-Z0-9_.]+)/
              ]
              
              for (const pattern of patterns) {
                const match = href.match(pattern)
                if (match && match[1]) {
                  const username = match[1].toLowerCase()
                  
                  // Filtrovat neplatné usernames
                  if (username && 
                      !username.includes('explore') && 
                      !username.includes('reel') && 
                      !username.includes('stories') &&
                      !username.includes('tv') &&
                      username.length >= 1 && 
                      username.length <= 30 &&
                      !seenUsernames.has(username)) {
                    
                    seenUsernames.add(username)
                    results.push({
                      username: username,
                      url: `https://www.instagram.com/${username}/`
                    })
                  }
                  break
                }
              }
            }
          })
        })
        
        return results
      })

      console.log(`📱 [GOOGLE-SEARCH] Extracted ${profiles.length} Instagram profiles from search`)
      
      // Simulace lidského chování před zavřením
      await this.humanLikeDelay('reading')
      
      return profiles

    } catch (error) {
      this.consecutiveErrors++
      console.error(`❌ [GOOGLE-SEARCH] Error performing search:`, error)
      throw error
    } finally {
      try {
        await page.close()
      } catch (e) {
        console.error('Error closing page:', e)
      }
    }
  }

  // Hlavní metoda s retry logikou
  async searchInstagramProfiles(searchTerms: string[], country: string = 'ES'): Promise<string[]> {
    const allProfiles: InstagramProfile[] = []
    const maxRetries = 3
    
    console.log(`🔍 [GOOGLE-SEARCH] Starting search for ${searchTerms.length} terms in country: ${country}`)
    
    for (let i = 0; i < searchTerms.length; i++) {
      const term = searchTerms[i]
      let retryCount = 0
      let success = false
      
      while (retryCount < maxRetries && !success) {
        try {
          console.log(`🔍 [GOOGLE-SEARCH] Processing term ${i + 1}/${searchTerms.length}: "${term}" (attempt ${retryCount + 1}/${maxRetries})`)
          
          const profiles = await this.performSingleSearch(term, country)
          allProfiles.push(...profiles)
          success = true
          
          // Delší čekání mezi různými search terms
          if (i < searchTerms.length - 1) {
            await this.humanLikeDelay('navigation')
          }
          
        } catch (error) {
          retryCount++
          console.error(`❌ [GOOGLE-SEARCH] Error on attempt ${retryCount} for term "${term}":`, error)
          
          if (retryCount < maxRetries) {
            // Exponenciální backoff pro retry
            const retryDelay = 60000 * Math.pow(2, retryCount - 1) // 1min, 2min, 4min
            console.log(`🔄 [GOOGLE-SEARCH] Retrying in ${retryDelay/1000}s...`)
            await new Promise(resolve => setTimeout(resolve, retryDelay))
          }
        }
      }
      
      if (!success) {
        console.error(`❌ [GOOGLE-SEARCH] Failed to search for term "${term}" after ${maxRetries} attempts`)
      }
    }

    // Deduplikace usernames
    const uniqueUsernames = Array.from(new Set(allProfiles.map(p => p.username)))
    
    console.log(`📊 [GOOGLE-SEARCH] Found ${uniqueUsernames.length} Instagram usernames`)
    return uniqueUsernames
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('🔚 [GOOGLE-SEARCH] Closing browser...')
      await this.browser.close()
      this.browser = null
    }
  }
} 