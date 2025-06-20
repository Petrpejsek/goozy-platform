import puppeteer, { Browser, Page } from 'puppeteer'

export interface InstagramProfile {
  username: string
  name: string
  bio: string
  followers: number
  following: number
  posts: number
  isVerified: boolean
  profilePicUrl: string
  isPrivate: boolean
}

export class InstagramScraper {
  private browser: Browser | null = null
  private maxRetries = 3
  private baseDelay = 3000

  async initialize(): Promise<void> {
    console.log('🚀 [DEBUG] Initializing Instagram scraper with anti-detection...')
    
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000, // 5 minut timeout
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
      
      console.log('✅ [DEBUG] Browser initialized successfully')
    } catch (error) {
      console.error('❌ [ERROR] Failed to initialize browser:', error)
      throw error
    }
  }

  isInitialized(): boolean {
    return this.browser !== null
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('🔚 [DEBUG] Closing browser...')
      await this.browser.close()
      this.browser = null
    }
  }

  private async randomDelay(min: number = 3000, max: number = 8000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  private async setupPage(page: Page): Promise<void> {
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
        get: () => ['en-US', 'en'],
      })
    })

    // Set headers
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    await page.setViewport({ width: 1920, height: 1080 })
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    })
  }

  async scrapeProfile(username: string): Promise<InstagramProfile | null> {
    // 1) RYCHLÝ POKUS: zkusit veřejné JSON endpointy bez přihlášení
    const endpoints = [
      `https://r.jina.ai/http://www.instagram.com/${username}/?__a=1&__d=dis`,
      `https://r.jina.ai/http://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`
    ]

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        if (res.ok) {
          const json = await res.json()
          const data: any = json.graphql?.user || json.data?.user || null
          if (data) {
            return {
              username,
              name: data.full_name || username,
              bio: data.biography || '',
              followers: data.edge_followed_by?.count || data.follower_count || 0,
              following: data.edge_follow?.count || data.following_count || 0,
              posts: data.edge_owner_to_timeline_media?.count || data.media_count || 0,
              isVerified: Boolean(data.is_verified),
              profilePicUrl: data.profile_pic_url_hd || data.profile_pic_url || '',
              isPrivate: Boolean(data.is_private)
            }
          }
        }
      } catch (e) {
        // ignorujeme a pokračujeme na puppeteer
      }
    }

    if (!this.browser) {
      await this.initialize()
    }

    let page: Page | null = null
    let retryCount = 0

    while (retryCount < this.maxRetries) {
      try {
        console.log(`🔍 [DEBUG] Scraping Instagram profile: ${username} (attempt ${retryCount + 1}/${this.maxRetries})`)
        
        page = await this.browser!.newPage()
        await this.setupPage(page)
        
        // Random delay before navigation
        await this.randomDelay(1000, 3000)
        
        const url = `https://www.instagram.com/${username}/`
        console.log(`🌐 [DEBUG] Navigating to ${url}`)
        
        // Navigate with faster loading
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded', // Rychlejší než networkidle2
          timeout: 20000 // Kratší timeout
        })
        
        if (!response || !response.ok()) {
          throw new Error(`Failed to load page: ${response?.status()}`)
        }

        console.log('🌐 [DEBUG] Page loaded successfully')
        
        // RYCHLÁ VALIDACE: Zkontrolovat zda stránka má validní obsah (2-3 sekundy)
        await this.randomDelay(1000, 2000) // Kratší čekání
        
        const quickValidation = await this.quickPageValidation(page, username)
        if (!quickValidation.isValid) {
          throw new Error(quickValidation.reason)
        }
        
        console.log(`✅ [QUICK-CHECK] ${username}: Page has valid content, proceeding with scraping...`)
        
        // Další čekání pouze pokud je stránka validní
        await this.randomDelay(1000, 2000)
        
        // Extract profile data with multiple selectors
        const profileData = await page.evaluate(() => {
          // Helper function to parse numbers
          const parseCount = (text: string): number => {
            const cleanText = text.trim().toLowerCase().replace(/,/g, '')
            if (cleanText.includes('k')) return Math.floor(parseFloat(cleanText) * 1000)
            if (cleanText.includes('m')) return Math.floor(parseFloat(cleanText) * 1000000)
            if (cleanText.includes('b')) return Math.floor(parseFloat(cleanText) * 1000000000)
            return parseInt(cleanText.replace(/[^0-9]/g, '')) || 0
          }

          // Try multiple methods to get profile data
          let name = ''
          let bio = ''
          let followers = 0
          let following = 0
          let posts = 0
          let isVerified = false
          let profilePicUrl = ''
          let isPrivate = false

          // Method 1: Try JSON-LD structured data
          try {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]')
            for (const script of scripts) {
              const data = JSON.parse(script.textContent || '{}')
              if (data['@type'] === 'Person' || data['@type'] === 'Organization') {
                name = data.name || name
                bio = data.description || bio
                break
              }
            }
          } catch (e) {
            console.log('No JSON-LD data found')
          }

          // Method 2: Try meta tags
          const titleMeta = document.querySelector('title')
          if (titleMeta && !name) {
            const titleText = titleMeta.textContent || ''
            const match = titleText.match(/^(.+?)\s*\(@/)
            if (match) name = match[1].trim()
          }

          const descMeta = document.querySelector('meta[name="description"]')
          if (descMeta && !bio) {
            bio = descMeta.getAttribute('content') || ''
          }

          // Method 3: Try to find stats in text content
          const bodyText = document.body.innerText || ''
          const followerMatches = bodyText.match(/(\d+[\.,]?\d*[kmb]?)\s*followers?/i)
          const followingMatches = bodyText.match(/(\d+[\.,]?\d*[kmb]?)\s*following/i)
          const postsMatches = bodyText.match(/(\d+[\.,]?\d*[kmb]?)\s*posts?/i)

          if (followerMatches) followers = parseCount(followerMatches[1])
          if (followingMatches) following = parseCount(followingMatches[1])
          if (postsMatches) posts = parseCount(postsMatches[1])

          // Check for verification
          isVerified = bodyText.includes('Verified') || bodyText.includes('✓')

          // Check for private account
          isPrivate = bodyText.includes('This account is private') || bodyText.includes('Private')

          // Try to get profile picture
          const profilePicImg = document.querySelector('img[alt*="profile picture"]') || 
                               document.querySelector('img[src*="profile"]')
          if (profilePicImg) {
            profilePicUrl = profilePicImg.getAttribute('src') || ''
          }

          return {
            name: name || 'Unknown',
            bio: bio || '',
            followers,
            following,
            posts,
            isVerified,
            profilePicUrl,
            isPrivate
          }
        })

        // Create profile object
        const profile: InstagramProfile = {
          username,
          name: profileData.name,
          bio: profileData.bio,
          followers: profileData.followers,
          following: profileData.following,
          posts: profileData.posts,
          isVerified: profileData.isVerified,
          profilePicUrl: profileData.profilePicUrl,
          isPrivate: profileData.isPrivate
        }

        console.log(`👤 [DEBUG] Profile scraped for ${username}:`, {
          name: profile.name,
          followers: profile.followers,
          following: profile.following,
          posts: profile.posts,
          isPrivate: profile.isPrivate
        })

        // Close page
        await page.close()
        
        // If we have basic data, return it
        if (profile.name !== 'Unknown' || profile.followers > 0) {
          return profile
        } else {
          throw new Error('No valid profile data found')
        }

      } catch (error) {
        console.error(`❌ [ERROR] Error scraping profile ${username} (attempt ${retryCount + 1}):`, error)
        
        if (page) {
          try {
            await page.close()
          } catch (e) {
            console.error('Error closing page:', e)
          }
        }

        retryCount++
        
        if (retryCount < this.maxRetries) {
          console.log(`⏰ [DEBUG] Retrying in ${this.baseDelay}ms...`)
          await new Promise(resolve => setTimeout(resolve, this.baseDelay))
          
          // Exponential backoff
          this.baseDelay *= 1.5
        }
      }
    }

    console.log(`❌ [DEBUG] Failed to scrape ${username} after ${this.maxRetries} attempts`)
    return null
  }

  // VYLEPŠENÁ METODA: Skutečné vyhledávání podle lokace pomocí hashtags
  async searchByLocation(country: string, limit: number = 20): Promise<string[]> {
    console.log(`🔍 [LOCATION-SEARCH] Searching by location: ${country}, limit: ${limit}`)
    
    if (!this.browser) {
      await this.initialize()
    }
    
    // Definovat location-specific hashtags a místa
    const locationData = this.getLocationSearchTerms(country)
    const foundUsernames: string[] = []
    
    try {
      // Projít různé search strategie dokud nenajdeme dostatek usernames
      for (const searchTerm of locationData.searchTerms) {
        if (foundUsernames.length >= limit) break
        
        console.log(`🏷️ [LOCATION-SEARCH] Searching hashtag: #${searchTerm}`)
        const usernamesFromHashtag = await this.searchHashtag(searchTerm, Math.ceil(limit / locationData.searchTerms.length))
        
        // Přidat nové usernames (avoid duplicates)
        for (const username of usernamesFromHashtag) {
          if (!foundUsernames.includes(username) && foundUsernames.length < limit) {
            foundUsernames.push(username)
          }
        }
        
        // Delay mezi hashtag searches
        await this.randomDelay(2000, 4000)
      }
      
      console.log(`✅ [LOCATION-SEARCH] Found ${foundUsernames.length} usernames for ${country}`)
      return foundUsernames
      
    } catch (error) {
      console.error(`❌ [LOCATION-SEARCH] Error searching by location:`, error)
      
      // Žádný fallback - vrátit prázdný seznam, aby viděli skutečnou chybu
      return []
    }
  }
  
  // Definovat search terms podle země
  private getLocationSearchTerms(country: string): { searchTerms: string[] } {
    const locationMap: Record<string, { searchTerms: string[] }> = {
      'CZ': {
        searchTerms: [
          'prague', 'praha', 'czechrepublic', 'brno', 'ostrava',
          'czechgirl', 'praguelife', 'czechblogger', 'instagramcz',
          'czechfashion', 'czechfood', 'czechbeauty', 'visitczech'
        ]
      },
      'SK': {
        searchTerms: [
          'slovakia', 'bratislava', 'kosice', 'slovakgirl', 
          'slovakia_life', 'instagramsk', 'slovakblogger'
        ]
      },
      'PL': {
        searchTerms: [
          'poland', 'warszawa', 'krakow', 'polishgirl',
          'poland_life', 'instagrampl', 'polishblogger'
        ]
      }
    }
    
    return locationMap[country] || locationMap['CZ'] // default to CZ
  }
  
  // Vyhledávání podle hashtagu
  private async searchHashtag(hashtag: string, limit: number = 50000): Promise<string[]> {
    let page: Page | null = null
    
    try {
      page = await this.browser!.newPage()
      await this.setupPage(page)
      
      const url = `https://www.instagram.com/explore/tags/${hashtag}/`
      console.log(`🌐 [HASHTAG-SEARCH] Navigating to ${url}`)
      
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded', // Rychlejší loading
        timeout: 15000 // Kratší timeout
      })
      
      if (!response || !response.ok()) {
        throw new Error(`Failed to load hashtag page: ${response?.status()}`)
      }
      
      // Kratší čekání na načtení
      await this.randomDelay(1500, 2500)
      
      // VYLEPŠENÝ DEBUG: Podrobná kontrola co je na stránce
      const pageAnalysis = await page.evaluate(() => {
        const bodyText = document.body.innerText.toLowerCase()
        const pageTitle = document.title
        const postLinks = document.querySelectorAll('a[href*="/p/"]')
        const profileLinks = document.querySelectorAll('a[href^="/"][href*="/"]')
        const images = document.querySelectorAll('img')
        const hasLoginPrompt = bodyText.includes('log in') || bodyText.includes('sign up')
        const hasErrorMessage = bodyText.includes('sorry') || bodyText.includes('not found') || bodyText.includes('error')
        
        return {
          title: pageTitle,
          bodyLength: bodyText.length,
          hasPostsText: bodyText.includes('posts'),
          hasTopPostsText: bodyText.includes('top posts'),
          postLinksCount: postLinks.length,
          profileLinksCount: profileLinks.length,
          imagesCount: images.length,
          hasLoginPrompt,
          hasErrorMessage,
          firstFewWords: bodyText.substring(0, 200),
          url: window.location.href
        }
      })
      
      console.log(`🔍 [HASHTAG-DEBUG] #${hashtag} page analysis:`, {
        title: pageAnalysis.title,
        bodyLength: pageAnalysis.bodyLength,
        hasPostsText: pageAnalysis.hasPostsText,
        hasTopPostsText: pageAnalysis.hasTopPostsText,
        postLinksCount: pageAnalysis.postLinksCount,
        profileLinksCount: pageAnalysis.profileLinksCount,
        imagesCount: pageAnalysis.imagesCount,
        hasLoginPrompt: pageAnalysis.hasLoginPrompt,
        hasErrorMessage: pageAnalysis.hasErrorMessage,
        currentUrl: pageAnalysis.url
      })
      
      console.log(`📝 [HASHTAG-DEBUG] #${hashtag} first few words: "${pageAnalysis.firstFewWords}"`)
      
      // Rozšířená kontrola zda hashtag page má obsah
      const pageHasContent = pageAnalysis.hasPostsText || 
                            pageAnalysis.hasTopPostsText || 
                            pageAnalysis.postLinksCount > 0 ||
                            pageAnalysis.imagesCount > 5 // Instagram má obvykle hodně obrázků
      
      if (!pageHasContent) {
        console.log(`⚠️ [HASHTAG-SEARCH] #${hashtag}: No posts found, skipping...`)
        
        // Pokud je login prompt, možná potřebujeme přihlášení
        if (pageAnalysis.hasLoginPrompt) {
          console.log(`🔐 [HASHTAG-SEARCH] #${hashtag}: Login required - Instagram may be blocking anonymous access`)
        }
        
        // Pokud je error, Instagram možná zablokoval přístup
        if (pageAnalysis.hasErrorMessage) {
          console.log(`❌ [HASHTAG-SEARCH] #${hashtag}: Error message detected - possible blocking`)
        }
        
        return []
      }
      
      // Extract usernames from hashtag page
      const usernames = await page.evaluate((limit) => {
        const usernameSet = new Set<string>()
        
        // Method 1: Look for profile links in posts
        const profileLinks = document.querySelectorAll('a[href*="/p/"]')
        profileLinks.forEach(link => {
          const href = link.getAttribute('href')
          if (href) {
            // Extract username from post URL structure
            const match = href.match(/^\/p\/[^\/]+\//)
            if (match) {
              // Look for username in nearby elements or data attributes
              const parentElements = [link.parentElement, link.parentElement?.parentElement]
              parentElements.forEach(parent => {
                if (parent) {
                  const usernameLinks = parent.querySelectorAll('a[href^="/"][href*="/"]')
                  usernameLinks.forEach(userLink => {
                    const userHref = userLink.getAttribute('href')
                    if (userHref && userHref.match(/^\/[a-zA-Z0-9._]+\/?$/)) {
                      const username = userHref.replace(/^\/|\/$/g, '')
                      if (username && username.length > 0 && !username.includes('/')) {
                        usernameSet.add(username)
                      }
                    }
                  })
                }
              })
            }
          }
        })
        
        // Method 2: Look for direct profile links
        const directProfileLinks = document.querySelectorAll('a[href^="/"][href$="/"]')
        directProfileLinks.forEach(link => {
          const href = link.getAttribute('href')
          if (href && href.match(/^\/[a-zA-Z0-9._]+\/?$/)) {
            const username = href.replace(/^\/|\/$/g, '')
            if (username && !username.includes('/') && username.length > 0) {
              usernameSet.add(username)
            }
          }
        })
        
        // Convert to array and limit
        return Array.from(usernameSet).slice(0, limit)
      }, limit)
      
      await page.close()
      
      console.log(`📱 [HASHTAG-SEARCH] Found ${usernames.length} usernames from #${hashtag}`)
      return usernames
      
    } catch (error) {
      console.error(`❌ [HASHTAG-SEARCH] Error searching hashtag #${hashtag}:`, error)
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
  
  // NOVÁ METODA: Rychlá validace stránky (2-3 sekundy místo 30)
  private async quickPageValidation(page: Page, username: string): Promise<{isValid: boolean, reason: string}> {
    try {
      console.log(`🚀 [QUICK-CHECK] Validating page for ${username}...`)
      
      const validation = await page.evaluate(() => {
        const bodyText = document.body.innerText.toLowerCase()
        const pageTitle = document.title.toLowerCase()
        
        // Kontrola 1: Error stránky
        const errorIndicators = [
          'sorry, this page isn\'t available',
          'page not found', 
          '404',
          'user not found',
          'account suspended',
          'account disabled',
          'this account has been deactivated',
          'content unavailable'
        ]
        
        const hasError = errorIndicators.some(error => 
          bodyText.includes(error) || pageTitle.includes(error)
        )
        
        if (hasError) {
          return { isValid: false, reason: 'Account not found or suspended' }
        }
        
        // Kontrola 2: Instagram základní struktura
        const hasInstagramStructure = 
          document.querySelector('meta[property="og:site_name"][content*="Instagram"]') ||
          bodyText.includes('instagram') ||
          pageTitle.includes('instagram')
        
        if (!hasInstagramStructure) {
          return { isValid: false, reason: 'Not a valid Instagram page' }
        }
        
        // Kontrola 3: Alespoň nějaký obsah existuje
        const hasBasicContent = 
          bodyText.length > 100 || // Alespoň nějaký text
          document.querySelectorAll('img').length > 0 || // Alespoň nějaké obrázky
          document.querySelectorAll('a').length > 5 // Alespoň nějaké linky
        
        if (!hasBasicContent) {
          return { isValid: false, reason: 'Page appears to be empty or loading failed' }
        }
        
        // Kontrola 4: Rate limit check
        const rateLimitIndicators = [
          'try again later',
          'temporarily blocked',
          'rate limit',
          'too many requests'
        ]
        
        const hasRateLimit = rateLimitIndicators.some(indicator => 
          bodyText.includes(indicator)
        )
        
        if (hasRateLimit) {
          return { isValid: false, reason: 'Rate limited - try again later' }
        }
        
        return { isValid: true, reason: 'Page validation passed' }
      })
      
      console.log(`🚀 [QUICK-CHECK] ${username}: ${validation.reason}`)
      return validation
      
    } catch (error) {
      console.error(`❌ [QUICK-CHECK] Error validating ${username}:`, error)
      return { isValid: false, reason: 'Validation error occurred' }
    }
  }

  // NOVÁ METODA: Rychlá kontrola zda je účet private
  async isAccountPrivate(username: string): Promise<boolean> {
    let page: Page | null = null
    
    try {
      page = await this.browser!.newPage()
      await this.setupPage(page)
      
      const url = `https://www.instagram.com/${username}/`
      console.log(`🔒 [PRIVATE-CHECK] Checking if ${username} is private...`)
      
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded', // Rychlejší 
        timeout: 10000 // Kratší timeout
      })
      
      if (!response || !response.ok()) {
        console.log(`🔒 [PRIVATE-CHECK] ${username}: Failed to load page`)
        return true // Safer to assume private if can't check
      }
      
      // Kratší čekání na načtení
      await this.randomDelay(500, 1000)
      
      // Zkontrolovat zda je profil private
      const isPrivate = await page.evaluate(() => {
        // Method 1: Look for "This Account is Private" text
        const privateTexts = [
          'This Account is Private',
          'This account is private',
          'Tento účet je soukromý',
          'účet je soukromý'
        ]
        
        const bodyText = document.body.innerText.toLowerCase()
        const hasPrivateText = privateTexts.some(text => bodyText.includes(text.toLowerCase()))
        
        // Method 2: Look for private account indicators in HTML
        const privateSelectors = [
          '[data-testid="private-account"]',
          '.private-account',
          'svg[aria-label*="Private"]',
          'svg[aria-label*="private"]'
        ]
        
        const hasPrivateElement = privateSelectors.some(selector => 
          document.querySelector(selector) !== null
        )
        
        // Method 3: Check if posts grid is missing (common for private accounts)
        const postsGrid = document.querySelector('[role="tablist"]') || document.querySelector('article')
        const hasLimitedContent = !postsGrid
        
        return hasPrivateText || hasPrivateElement || hasLimitedContent
      })
      
      await page.close()
      
      console.log(`🔒 [PRIVATE-CHECK] ${username}: ${isPrivate ? 'PRIVATE' : 'PUBLIC'}`)
      return isPrivate
      
    } catch (error) {
      console.error(`❌ [PRIVATE-CHECK] Error checking ${username}:`, error)
      if (page) {
        try {
          await page.close()
        } catch (e) {
          console.error('Error closing page:', e)
        }
      }
      return true // Safer to assume private if error occurs
    }
  }

  // NOVÁ METODA: Vyhledávání podle specifických hashtags
  async searchByHashtags(hashtags: string[], limit: number = 20): Promise<string[]> {
    console.log(`🏷️ [HASHTAG-SEARCH] Searching by hashtags: ${hashtags.join(', ')}, limit: ${limit}`)
    
    const foundUsernames: string[] = []
    
    try {
      // Projít všechny hashtags a získat usernames
      for (const hashtag of hashtags) {
        if (foundUsernames.length >= limit) break
        
        console.log(`🔍 [HASHTAG-SEARCH] Processing hashtag: #${hashtag}`)
        const usernamesFromHashtag = await this.searchHashtag(hashtag, Math.ceil(limit / hashtags.length))
        
        // Přidat nové usernames (avoid duplicates)
        for (const username of usernamesFromHashtag) {
          if (!foundUsernames.includes(username) && foundUsernames.length < limit) {
            foundUsernames.push(username)
          }
        }
        
        // Delay mezi hashtag searches
        await this.randomDelay(2000, 4000)
      }
      
      console.log(`✅ [HASHTAG-SEARCH] Found ${foundUsernames.length} usernames from hashtags`)
      return foundUsernames
      
    } catch (error) {
      console.error(`❌ [HASHTAG-SEARCH] Error searching by hashtags:`, error)
      
      // Žádný fallback - vrátit prázdný seznam, aby viděli skutečnou chybu
      return []
    }
  }

  // METODA ODSTRANĚNA - žádné fallback fake profily!

  // 🔥 NOVÉ POKROČILÉ METODY PRO RANDOM DISCOVERY 🔥
  
  // 1️⃣ SCRAPING FOLLOWERS populárních influencerů
  async scrapeFollowers(username: string, limit: number = 10000): Promise<string[]> {
    let page: Page | null = null
    
    try {
      console.log(`👥 [FOLLOWERS-SEARCH] Scraping followers of @${username}...`)
      
      page = await this.browser!.newPage()
      await this.setupPage(page)
      
      // Jít na profil influencera
      const profileUrl = `https://www.instagram.com/${username}/`
      const response = await page.goto(profileUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      })
      
      if (!response || !response.ok()) {
        throw new Error(`Failed to load profile: ${response?.status()}`)
      }
      
      await this.randomDelay(2000, 3000)
      
      // Kliknout na "followers" link
      const followersClicked = await page.evaluate(() => {
        // Hledat různé selektory pro followers link
        const followersSelectors = [
          'a[href*="/followers/"]',
          'a[href$="/followers/"]',
          '[data-testid="UserProfileInfoSection"] a:nth-child(2)',
          'a:has-text("followers")',
          'a:has-text("sledující")'
        ]
        
        for (const selector of followersSelectors) {
          try {
            const element = document.querySelector(selector)
            if (element) {
              (element as HTMLElement).click()
              return true
            }
          } catch (e) {
            // Pokračovat s dalším selektorem
          }
        }
        return false
      })
      
      if (!followersClicked) {
        console.log(`❌ [FOLLOWERS-SEARCH] Could not find followers link for @${username}`)
        return []
      }
      
      // Počkat na otevření modal s followers
      await this.randomDelay(3000, 5000)
      
      // Scrape usernames z followers modal
      const followers = await page.evaluate((limit) => {
        const usernameSet = new Set<string>()
        
        // Metody pro získání usernames z modal
        const usernameSelectors = [
          '[role="dialog"] a[href^="/"]',
          '.followers-modal a[href^="/"]',
          '[data-testid="UserCard"] a[href^="/"]',
          'a[href^="/"][href*="/"]'
        ]
        
        usernameSelectors.forEach(selector => {
          const links = document.querySelectorAll(selector)
          links.forEach(link => {
            const href = link.getAttribute('href')
            if (href && href.match(/^\/[a-zA-Z0-9._]+\/?$/)) {
              const username = href.replace(/^\/|\/$/g, '')
              if (username && !username.includes('/') && username.length > 2) {
                usernameSet.add(username)
              }
            }
          })
        })
        
        return Array.from(usernameSet).slice(0, limit)
      }, limit)
      
      await page.close()
      
      console.log(`✅ [FOLLOWERS-SEARCH] Found ${followers.length} followers from @${username}`)
      return followers
      
    } catch (error) {
      console.error(`❌ [FOLLOWERS-SEARCH] Error scraping followers:`, error)
      if (page) {
        try {
          await page.close()
        } catch (e) {}
      }
      return []
    }
  }
  
  // 2️⃣ EXPLORE PAGE SCRAPING - random účty z explore
  async scrapeExplorePage(limit: number = 5000): Promise<string[]> {
    let page: Page | null = null
    
    try {
      console.log(`🔍 [EXPLORE-SEARCH] Scraping Instagram explore page...`)
      
      page = await this.browser!.newPage()
      await this.setupPage(page)
      
      // Jít na explore page
      const response = await page.goto('https://www.instagram.com/explore/', { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      })
      
      if (!response || !response.ok()) {
        throw new Error(`Failed to load explore page: ${response?.status()}`)
      }
      
      await this.randomDelay(3000, 5000)
      
      // Scroll down pro načtení více obsahu
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      
      await this.randomDelay(2000, 3000)
      
      // Extract usernames z explore page
      const usernames = await page.evaluate((limit) => {
        const usernameSet = new Set<string>()
        
        // Hledat všechny profile links
        const links = document.querySelectorAll('a[href^="/"]')
        links.forEach(link => {
          const href = link.getAttribute('href')
          if (href && href.match(/^\/[a-zA-Z0-9._]+\/?$/) && !href.includes('/p/')) {
            const username = href.replace(/^\/|\/$/g, '')
            if (username && username.length > 2 && !username.includes('/')) {
              usernameSet.add(username)
            }
          }
        })
        
        return Array.from(usernameSet).slice(0, limit)
      }, limit)
      
      await page.close()
      
      console.log(`✅ [EXPLORE-SEARCH] Found ${usernames.length} accounts from explore page`)
      return usernames
      
    } catch (error) {
      console.error(`❌ [EXPLORE-SEARCH] Error scraping explore page:`, error)
      if (page) {
        try {
          await page.close()
        } catch (e) {}
      }
      return []
    }
  }
  
  // 3️⃣ LOCATION-BASED DISCOVERY - real location pages
  async scrapeLocationPages(location: string, limit: number = 5000): Promise<string[]> {
    let page: Page | null = null
    
    try {
      console.log(`📍 [LOCATION-SEARCH] Searching location: ${location}`)
      
      page = await this.browser!.newPage()
      await this.setupPage(page)
      
      // Hledat location přes explore
      const searchUrl = `https://www.instagram.com/explore/locations/`
      const response = await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      })
      
      if (!response || !response.ok()) {
        throw new Error(`Failed to load locations page: ${response?.status()}`)
      }
      
      await this.randomDelay(2000, 3000)
      
      // Zkusit search box pro location
      const searchSuccess = await page.evaluate((location) => {
        const searchInputs = [
          'input[placeholder*="Search"]',
          'input[placeholder*="search"]',
          'input[type="text"]',
          '[data-testid="search-input"]'
        ]
        
        for (const selector of searchInputs) {
          const input = document.querySelector(selector)
          if (input) {
            (input as HTMLInputElement).value = location;
            (input as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
            return true
          }
        }
        return false
      }, location)
      
      if (searchSuccess) {
        await this.randomDelay(3000, 5000)
      }
      
      // Extract usernames z location results
      const usernames = await page.evaluate((limit) => {
        const usernameSet = new Set<string>()
        
        // Hledat profile links
        const links = document.querySelectorAll('a[href^="/"]')
        links.forEach(link => {
          const href = link.getAttribute('href')
          if (href && href.match(/^\/[a-zA-Z0-9._]+\/?$/) && !href.includes('/p/')) {
            const username = href.replace(/^\/|\/$/g, '')
            if (username && username.length > 2) {
              usernameSet.add(username)
            }
          }
        })
        
        return Array.from(usernameSet).slice(0, limit)
      }, limit)
      
      await page.close()
      
      console.log(`✅ [LOCATION-SEARCH] Found ${usernames.length} accounts from location: ${location}`)
      return usernames
      
    } catch (error) {
      console.error(`❌ [LOCATION-SEARCH] Error scraping location:`, error)
      if (page) {
        try {
          await page.close()
        } catch (e) {}
      }
      return []
    }
  }
  
  // 4️⃣ KOMBINOVANÁ ADVANCED DISCOVERY METODA - MASIVNÍ VERZE
  async advancedRandomDiscovery(country: string, limit: number = 50000): Promise<string[]> {
    console.log(`🚀 [MASSIVE-DISCOVERY] Starting MASSIVE discovery for ${country}, target: ${limit} accounts`)
    
    const allUsernames: string[] = []
    const seenUsernames = new Set<string>()
    
    try {
      // PHASE 1: Deep hashtag mining (cíl: 60% účtů)
      console.log(`📊 [MASSIVE-DISCOVERY] PHASE 1: Deep hashtag mining...`)
      const locationHashtags = this.getLocationSearchTerms(country).searchTerms
      const hashtagTarget = Math.floor(limit * 0.6) // 60% z limit
      
      for (const hashtag of locationHashtags) {
        if (allUsernames.length >= hashtagTarget) break
        
        console.log(`🏷️ [MASSIVE-DISCOVERY] Deep scraping #${hashtag}...`)
        const accountsPerHashtag = Math.min(10000, Math.floor(hashtagTarget / locationHashtags.length))
        const hashtagUsers = await this.deepHashtagScraping(hashtag, accountsPerHashtag)
        
        hashtagUsers.forEach(username => {
          if (!seenUsernames.has(username) && allUsernames.length < hashtagTarget) {
            seenUsernames.add(username)
            allUsernames.push(username)
          }
        })
        
        console.log(`📊 [MASSIVE-DISCOVERY] Progress: ${allUsernames.length}/${hashtagTarget} from hashtags`)
        await this.randomDelay(8000, 12000) // Longer delays for deep scraping
      }
      
      // PHASE 2: Chain discovery z nejlepších účtů (cíl: 25% účtů)
      console.log(`🔗 [MASSIVE-DISCOVERY] PHASE 2: Chain discovery...`)
      const chainTarget = Math.floor(limit * 0.25) // 25% z limit
              const seedAccounts = allUsernames.slice(0, 20) // Top 20 discovered accounts
      
      for (const seedAccount of seedAccounts) {
        if (allUsernames.length >= (hashtagTarget + chainTarget)) break
        
        console.log(`🔗 [MASSIVE-DISCOVERY] Chain discovery from @${seedAccount}...`)
        const chainUsers = await this.chainDiscovery(seedAccount, 3, 2000) // depth=3, limit=2000
        
        chainUsers.forEach(username => {
          if (!seenUsernames.has(username) && allUsernames.length < (hashtagTarget + chainTarget)) {
            seenUsernames.add(username)
            allUsernames.push(username)
          }
        })
        
        console.log(`📊 [MASSIVE-DISCOVERY] Progress: ${allUsernames.length}/${hashtagTarget + chainTarget} after chain discovery`)
      }
      
      // PHASE 3: Massive location scraping (cíl: zbývající účty)
      console.log(`📍 [MASSIVE-DISCOVERY] PHASE 3: Massive location scraping...`)
      if (allUsernames.length < limit) {
        const remainingTarget = limit - allUsernames.length
        const czechLocations = ['prague', 'brno', 'ostrava', 'plzen', 'liberec']
        
        const locationUsers = await this.massiveLocationScraping(czechLocations, Math.floor(remainingTarget / czechLocations.length))
        
        locationUsers.forEach(username => {
          if (!seenUsernames.has(username) && allUsernames.length < limit) {
            seenUsernames.add(username)
            allUsernames.push(username)
          }
        })
      }
      
      // PHASE 4: Explore page jako finální doplnění
      console.log(`🔍 [MASSIVE-DISCOVERY] PHASE 4: Final explore page scraping...`)
      if (allUsernames.length < limit) {
        const exploreUsers = await this.scrapeExplorePage(5000) // Více účtů z explore
        exploreUsers.forEach(username => {
          if (!seenUsernames.has(username) && allUsernames.length < limit) {
            seenUsernames.add(username)
            allUsernames.push(username)
          }
        })
      }
      
      console.log(`🎉 [MASSIVE-DISCOVERY] COMPLETED! Found ${allUsernames.length}/${limit} unique accounts`)
      console.log(`📊 [MASSIVE-DISCOVERY] Success rate: ${Math.round((allUsernames.length / limit) * 100)}%`)
      
      return allUsernames
      
    } catch (error) {
      console.error(`❌ [MASSIVE-DISCOVERY] Error in massive discovery:`, error)
      
      // Fallback - return what we have or use backup
      if (allUsernames.length > 0) {
        return allUsernames
      } else {
        return await this.searchByLocation(country, Math.min(limit, 100))
      }
    }
  }

  // 🔥 MASIVNÍ HASHTAG SCRAPING PRO TISÍCE ÚČTŮ
  async deepHashtagScraping(hashtag: string, targetCount: number = 10000): Promise<string[]> {
    let page: Page | null = null
    const allUsernames: string[] = []
    const seenUsernames = new Set<string>()
    
    try {
      console.log(`🏷️ [DEEP-HASHTAG] Starting deep scraping of #${hashtag}, target: ${targetCount} accounts`)
      
      page = await this.browser!.newPage()
      await this.setupPage(page)
      
      const url = `https://www.instagram.com/explore/tags/${hashtag}/`
      console.log(`🌐 [DEEP-HASHTAG] Navigating to ${url}`)
      
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 20000 
      })
      
      if (!response || !response.ok()) {
        throw new Error(`Failed to load hashtag page: ${response?.status()}`)
      }
      
      await this.randomDelay(2000, 4000)
      
      // FÁZE 1: Scrape "Top Posts" section
      console.log(`📌 [DEEP-HASHTAG] Phase 1: Scraping top posts...`)
      const topPostsUsernames = await page.evaluate(() => {
        const usernames = new Set<string>()
        
        // Hledat "Top Posts" sekci
        const topPostsSection = document.querySelector('[role="tabpanel"]') || 
                               document.querySelector('.top-posts') ||
                               document.querySelector('[data-testid="top-posts"]')
        
        if (topPostsSection) {
          const links = topPostsSection.querySelectorAll('a[href^="/"]')
          links.forEach(link => {
            const href = link.getAttribute('href')
            if (href && href.match(/^\/[a-zA-Z0-9._]+\/?$/)) {
              const username = href.replace(/^\/|\/$/g, '')
              if (username && username.length > 2 && !username.includes('/')) {
                usernames.add(username)
              }
            }
          })
        }
        
        return Array.from(usernames)
      })
      
      topPostsUsernames.forEach(username => {
        if (!seenUsernames.has(username)) {
          seenUsernames.add(username)
          allUsernames.push(username)
        }
      })
      
      console.log(`📌 [DEEP-HASHTAG] Found ${topPostsUsernames.length} accounts from top posts`)
      
      // FÁZE 2: Infinite scroll pro "Recent Posts"
      console.log(`🔄 [DEEP-HASHTAG] Phase 2: Infinite scrolling recent posts...`)
      
      let scrollAttempts = 0
      const maxScrolls = Math.ceil(targetCount / 10) // ~10 accounts per scroll, více scrollů
      
      while (allUsernames.length < targetCount && scrollAttempts < maxScrolls) {
        console.log(`🔄 [DEEP-HASHTAG] Scroll attempt ${scrollAttempts + 1}/${maxScrolls}, found: ${allUsernames.length}/${targetCount}`)
        
        // Scroll down to load more posts
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight)
        })
        
        // Wait for new content to load
        await this.randomDelay(3000, 5000)
        
        // Extract new usernames from recently loaded posts
        const newUsernames = await page.evaluate(() => {
          const usernames = new Set<string>()
          
          // Find all profile links on the page
          const allLinks = document.querySelectorAll('a[href^="/"]')
          allLinks.forEach(link => {
            const href = link.getAttribute('href')
            
            // Filter for direct profile links (not posts)
            if (href && href.match(/^\/[a-zA-Z0-9._]+\/?$/) && !href.includes('/p/')) {
              const username = href.replace(/^\/|\/$/g, '')
              if (username && username.length > 2 && username !== 'explore') {
                usernames.add(username)
              }
            }
            
            // Also extract from post URLs (get poster username)
            if (href && href.match(/^\/p\/[^\/]+\//)) {
              // Look for username in post context
              const postElement = link.closest('article') || link.closest('[role="button"]')
              if (postElement) {
                const usernameLinks = postElement.querySelectorAll('a[href^="/"][href*="/"]')
                usernameLinks.forEach(userLink => {
                  const userHref = userLink.getAttribute('href')
                  if (userHref && userHref.match(/^\/[a-zA-Z0-9._]+\/?$/)) {
                    const username = userHref.replace(/^\/|\/$/g, '')
                    if (username && username.length > 2) {
                      usernames.add(username)
                    }
                  }
                })
              }
            }
          })
          
          return Array.from(usernames)
        })
        
        // Add new unique usernames
        let newCount = 0
        newUsernames.forEach(username => {
          if (!seenUsernames.has(username)) {
            seenUsernames.add(username)
            allUsernames.push(username)
            newCount++
          }
        })
        
        console.log(`🔄 [DEEP-HASHTAG] Scroll ${scrollAttempts + 1}: found ${newCount} new accounts`)
        
        // Break if no new accounts found in last 2 scrolls
        if (newCount === 0) {
          console.log(`⚠️ [DEEP-HASHTAG] No new accounts found, stopping scrolling`)
          break
        }
        
        scrollAttempts++
        
        // Progressive delay to avoid rate limiting
        await this.randomDelay(2000 + (scrollAttempts * 1000), 4000 + (scrollAttempts * 1000))
      }
      
      await page.close()
      
      console.log(`✅ [DEEP-HASHTAG] Deep scraping completed for #${hashtag}`)
      console.log(`📊 [DEEP-HASHTAG] Total accounts found: ${allUsernames.length}`)
      console.log(`📊 [DEEP-HASHTAG] Unique accounts: ${seenUsernames.size}`)
      
      return allUsernames
      
    } catch (error) {
      console.error(`❌ [DEEP-HASHTAG] Error in deep hashtag scraping:`, error)
      if (page) {
        try {
          await page.close()
        } catch (e) {}
      }
      return allUsernames // Return what we found so far
    }
  }
  
  // 🔗 CHAIN DISCOVERY - Followers of followers with depth
  async chainDiscovery(seedUsername: string, depth: number = 2, limit: number = 1000): Promise<string[]> {
    console.log(`🔗 [CHAIN-DISCOVERY] Starting chain discovery from @${seedUsername}, depth: ${depth}, limit: ${limit}`)
    
    const allUsernames: string[] = []
    const seenUsernames = new Set<string>()
    const processed = new Set<string>()
    
    // Queue for BFS traversal: [username, currentDepth]
    const queue: [string, number][] = [[seedUsername, 0]]
    
    try {
      while (queue.length > 0 && allUsernames.length < limit) {
        const [currentUsername, currentDepth] = queue.shift()!
        
        if (processed.has(currentUsername) || currentDepth >= depth) {
          continue
        }
        
        processed.add(currentUsername)
        console.log(`🔗 [CHAIN-DISCOVERY] Processing @${currentUsername} at depth ${currentDepth}`)
        
        // Get followers of current user
        const followers = await this.scrapeFollowers(currentUsername, 50)
        
        for (const follower of followers) {
          if (!seenUsernames.has(follower) && allUsernames.length < limit) {
            seenUsernames.add(follower)
            allUsernames.push(follower)
            
            // Add to queue for next level if within depth limit
            if (currentDepth + 1 < depth) {
              queue.push([follower, currentDepth + 1])
            }
          }
        }
        
        // Rate limiting - longer delay for chain discovery
        await this.randomDelay(8000, 12000)
        
        console.log(`🔗 [CHAIN-DISCOVERY] Progress: ${allUsernames.length}/${limit} accounts, queue size: ${queue.length}`)
      }
      
      console.log(`✅ [CHAIN-DISCOVERY] Chain discovery completed: ${allUsernames.length} accounts from @${seedUsername}`)
      return allUsernames
      
    } catch (error) {
      console.error(`❌ [CHAIN-DISCOVERY] Error in chain discovery:`, error)
      return allUsernames
    }
  }
  
  // 🏢 MASIVNÍ LOCATION SCRAPING
  async massiveLocationScraping(locations: string[], accountsPerLocation: number = 200): Promise<string[]> {
    console.log(`📍 [MASSIVE-LOCATION] Starting massive location scraping for ${locations.length} locations`)
    
    const allUsernames: string[] = []
    const seenUsernames = new Set<string>()
    
    for (const location of locations) {
      console.log(`📍 [MASSIVE-LOCATION] Processing location: ${location}`)
      
      try {
        // Method 1: Direct location hashtags
        const locationHashtagAccounts = await this.deepHashtagScraping(location, accountsPerLocation / 2)
        
        // Method 2: Location pages (if available)
        const locationPageAccounts = await this.scrapeLocationPages(location, accountsPerLocation / 2)
        
        // Combine and deduplicate
        const combinedAccounts = [...locationHashtagAccounts, ...locationPageAccounts]
        
        combinedAccounts.forEach(username => {
          if (!seenUsernames.has(username) && allUsernames.length < locations.length * accountsPerLocation) {
            seenUsernames.add(username)
            allUsernames.push(username)
          }
        })
        
        console.log(`📍 [MASSIVE-LOCATION] Found ${combinedAccounts.length} accounts for ${location}`)
        
        // Rate limiting between locations
        await this.randomDelay(10000, 15000)
        
      } catch (error) {
        console.error(`❌ [MASSIVE-LOCATION] Error processing location ${location}:`, error)
      }
    }
    
    console.log(`✅ [MASSIVE-LOCATION] Massive location scraping completed: ${allUsernames.length} total accounts`)
    return allUsernames
  }

  // BACKUP SYSTÉM ÚPLNĚ ODSTRANĚN - POUZE SKUTEČNÝ SCRAPING
}