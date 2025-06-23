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
  // Nové pole pro engagement rate a statistiky
  engagementRate?: number
  avgLikes?: number
  avgComments?: number
  recentPosts?: Array<{
    likes: number
    comments: number
    type: string
  }>
}

export class InstagramScraper {
  private browser: Browser | null = null
  private maxRetries = 3
  private baseDelay = 3000

  constructor() {
    // Proxy funkcionalita úplně odstraněna
  }

  async initialize(): Promise<void> {
    console.log('🚀 [INSTAGRAM-SCRAPER] Initializing Instagram scraper...')
    
    try {
      console.log(`🌐 [INSTAGRAM-SCRAPER] Using direct connection`)
      
      this.browser = await puppeteer.launch({
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
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      })

      console.log('✅ [INSTAGRAM-SCRAPER] Browser initialized successfully')
    } catch (error) {
      console.error('❌ [INSTAGRAM-SCRAPER] Failed to initialize:', error)
      throw error
    }
  }

  // Jednoduché restartování browseru bez proxy logiky
  async rotateProxy(): Promise<void> {
    console.log('🔄 [INSTAGRAM-SCRAPER] Restarting browser...')
    
    await this.close()
    await this.initialize()
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
    // Základní nastavení stránky
    await page.setViewport({ width: 1920, height: 1080 })
    
    // Nastavit User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // Blokovat zbytečné zdroje pro rychlejší načítání
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      const resourceType = req.resourceType()
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort()
      } else {
        req.continue()
      }
    })
  }

  async scrapeProfile(username: string): Promise<InstagramProfile | null> {
    const startTime = Date.now()
    
    // 1) RYCHLÝ POKUS: zkusit veřejné JSON endpointy bez přihlášení
    const endpoints = [
      `https://r.jina.ai/http://www.instagram.com/${username}/?__a=1&__d=dis`,
      `https://r.jina.ai/http://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`
    ]

    for (const url of endpoints) {
      try {
        console.log(`🚀 [INSTAGRAM-SCRAPER] Trying API endpoint for @${username}`)
        const res = await fetch(url, { 
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(10000) // 10 sekund timeout
        })
        if (res.ok) {
          const json = await res.json()
          const data: any = json.graphql?.user || json.data?.user || null
          if (data) {
            const responseTime = Date.now() - startTime
            console.log(`✅ [INSTAGRAM-SCRAPER] Got data from API for @${username} (${responseTime}ms)`)
            
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
              // API endpointy nemají engagement data, takže je necháme undefined
            }
          }
        }
      } catch (e) {
        console.log(`⚠️ [INSTAGRAM-SCRAPER] API endpoint failed for @${username}:`, e instanceof Error ? e.message : String(e))
      }
    }

    console.log(`🎭 [INSTAGRAM-SCRAPER] API endpoints failed, using Puppeteer for @${username}`)

    if (!this.browser) {
      await this.initialize()
    }

    let page: Page | null = null
    let retryCount = 0

    while (retryCount < this.maxRetries) {
      try {
        console.log(`🔍 [INSTAGRAM-SCRAPER] Scraping Instagram profile: ${username} (attempt ${retryCount + 1}/${this.maxRetries})`)
        
        page = await this.browser!.newPage()
        await this.setupPage(page)
        
        // Random delay before navigation
        await this.randomDelay(1000, 3000)
        
        const url = `https://www.instagram.com/${username}/`
        console.log(`🌐 [INSTAGRAM-SCRAPER] Navigating to ${url}`)
        
        // Navigate with faster loading a timeout
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded', // Rychlejší než networkidle2
          timeout: 30000 // Delší timeout - 30 sekund
        })
        
        if (!response || !response.ok()) {
          throw new Error(`Failed to load page: ${response?.status()}`)
        }

        console.log('🌐 [INSTAGRAM-SCRAPER] Page loaded successfully')
        
        // VÝRAZNĚ delší čekání na načtení JavaScriptu - Instagram je velmi pomalý
        console.log('⏳ [INSTAGRAM-SCRAPER] Waiting 12 seconds for JavaScript to load...')
        await new Promise(resolve => setTimeout(resolve, 12000))
        
        const quickValidation = await this.quickPageValidation(page, username)
        if (!quickValidation.isValid) {
          throw new Error(quickValidation.reason)
        }
        
        console.log(`✅ [QUICK-CHECK] ${username}: Page has valid content, proceeding with scraping...`)
        
        // Další čekání pouze pokud je stránka validní
        await this.randomDelay(2000, 4000)
        
        // Extract profile data with multiple selectors a timeout
        const profileData = await Promise.race([
          page.evaluate(() => {
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

            // NOVÉ: Pokus o získání engagement rate a statistik z posledních příspěvků
            let recentPosts: Array<{likes: number, comments: number, type: string}> = []
            let avgLikes = 0
            let avgComments = 0
            let engagementRate = 0

            try {
              // Hledej odkazy na příspěvky
              const postLinks = document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')
              console.log(`📊 Found ${postLinks.length} potential post links`)
              
              // Pokus se získat statistiky z viditelných elementů
              const likeElements = document.querySelectorAll('[aria-label*="like"], [aria-label*="Like"]')
              const commentElements = document.querySelectorAll('[aria-label*="comment"], [aria-label*="Comment"]')
              
              // Pokus se parsovat čísla z aria-label atributů
              const likes: number[] = []
              const comments: number[] = []
              
              likeElements.forEach(el => {
                const ariaLabel = el.getAttribute('aria-label') || ''
                const match = ariaLabel.match(/(\d+[\.,]?\d*[kmb]?)\s*like/i)
                if (match) {
                  likes.push(parseCount(match[1]))
                }
              })
              
              commentElements.forEach(el => {
                const ariaLabel = el.getAttribute('aria-label') || ''
                const match = ariaLabel.match(/(\d+[\.,]?\d*[kmb]?)\s*comment/i)
                if (match) {
                  comments.push(parseCount(match[1]))
                }
              })
              
              // Pokus se najít čísla v textu stránky
              const textContent = document.body.innerText || ''
              const likeMatches = textContent.match(/(\d+[\.,]?\d*[kmb]?)\s*likes?/gi) || []
              const commentMatches = textContent.match(/(\d+[\.,]?\d*[kmb]?)\s*comments?/gi) || []
              
              likeMatches.forEach(match => {
                const num = parseCount(match.replace(/\s*likes?/i, ''))
                if (num > 0 && num < 10000000) { // Rozumné limity
                  likes.push(num)
                }
              })
              
              commentMatches.forEach(match => {
                const num = parseCount(match.replace(/\s*comments?/i, ''))
                if (num > 0 && num < 100000) { // Rozumné limity
                  comments.push(num)
                }
              })
              
              // Vytvoř pole příspěvků (páruj likes a comments)
              const maxPosts = Math.min(likes.length, comments.length, 12) // Max 12 příspěvků
              for (let i = 0; i < maxPosts; i++) {
                recentPosts.push({
                  likes: likes[i] || 0,
                  comments: comments[i] || 0,
                  type: 'post'
                })
              }
              
              // Vypočítej průměry
              if (recentPosts.length > 0) {
                avgLikes = Math.round(recentPosts.reduce((sum, post) => sum + post.likes, 0) / recentPosts.length)
                avgComments = Math.round(recentPosts.reduce((sum, post) => sum + post.comments, 0) / recentPosts.length)
                
                // Vypočítej engagement rate (průměrné interakce / followery * 100)
                if (followers > 0) {
                  const avgInteractions = avgLikes + avgComments
                  engagementRate = Math.round((avgInteractions / followers) * 10000) / 100 // 2 desetinná místa
                }
              }
              
              console.log(`📊 Engagement stats: ${recentPosts.length} posts, avg ${avgLikes} likes, ${avgComments} comments, ${engagementRate}% engagement`)
              
            } catch (e) {
              console.log('📊 Could not extract engagement data:', e)
            }

            return {
              name: name || 'Unknown',
              bio: bio || '',
              followers,
              following,
              posts,
              isVerified,
              profilePicUrl,
              isPrivate,
              // Nové údaje
              recentPosts: recentPosts.length > 0 ? recentPosts : undefined,
              avgLikes: avgLikes > 0 ? avgLikes : undefined,
              avgComments: avgComments > 0 ? avgComments : undefined,
              engagementRate: engagementRate > 0 ? engagementRate : undefined
            }
          }),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Timeout while waiting for profile data'))
            }, 40000) // Prodlouženo na 40 sekund
          })
        ]) as {
          name: string
          bio: string
          followers: number
          following: number
          posts: number
          isVerified: boolean
          profilePicUrl: string
          isPrivate: boolean
          recentPosts?: Array<{likes: number, comments: number, type: string}>
          avgLikes?: number
          avgComments?: number
          engagementRate?: number
        }

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
          isPrivate: profileData.isPrivate,
          // Nové údaje o engagement
          recentPosts: profileData.recentPosts,
          avgLikes: profileData.avgLikes,
          avgComments: profileData.avgComments,
          engagementRate: profileData.engagementRate
        }

        console.log(`👤 [INSTAGRAM-SCRAPER] Profile scraped for ${username}:`, {
          name: profile.name,
          followers: profile.followers,
          following: profile.following,
          posts: profile.posts,
          isPrivate: profile.isPrivate,
          engagementRate: profile.engagementRate ? `${profile.engagementRate}%` : 'N/A',
          avgLikes: profile.avgLikes || 'N/A',
          avgComments: profile.avgComments || 'N/A',
          recentPostsCount: profile.recentPosts?.length || 0
        })

        const responseTime = Date.now() - startTime
        console.log(`✅ [INSTAGRAM-SCRAPER] Successfully scraped @${username}: ${profile.followers} followers (${responseTime}ms)`)

        // Close page
        await page.close()
        
        // ZMÍRNĚNÁ PODMÍNKA: Přijmout i profily s méně daty
        if (profile.name !== 'Unknown' || profile.followers > 0 || profile.bio !== '' || profile.isPrivate) {
          return profile
        } else {
          throw new Error('No valid profile data found')
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`❌ [INSTAGRAM-SCRAPER] Error scraping profile ${username} (attempt ${retryCount + 1}):`, error)
        
        if (page) {
          try {
            await page.close()
          } catch (e) {
            console.error('Error closing page:', e)
          }
        }

        retryCount++
        
        // Pokud to není poslední pokus, počkej a zkus znovu
        if (retryCount < this.maxRetries) {
          const retryDelay = Math.random() * 5000 + 3000 // 3-8 sekund
          console.log(`⏰ [INSTAGRAM-SCRAPER] Retrying in ${retryDelay.toFixed(0)}ms...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }

    console.log(`❌ [INSTAGRAM-SCRAPER] Failed to scrape ${username} after ${this.maxRetries} attempts`)
    return null
  }

  private async quickPageValidation(page: Page, username: string): Promise<{isValid: boolean, reason: string}> {
    try {
      console.log(`🚀 [QUICK-CHECK] Validating page for ${username}...`)
      
      // EXTRÉMNĚ dlouhé čekání - Instagram je velmi pomalý
      await new Promise(resolve => setTimeout(resolve, 10000))
      
      const validation = await page.evaluate(() => {
        const bodyText = document.body.innerText || ''
        const pageTitle = document.title || ''
        const htmlContent = document.documentElement.outerHTML || ''
        
        // DEBUG: Vypsat základní informace o stránce
        console.log(`🔍 [DEBUG] Page title: "${pageTitle}"`)
        console.log(`🔍 [DEBUG] Body text length: ${bodyText.length}`)
        console.log(`🔍 [DEBUG] HTML content length: ${htmlContent.length}`)
        console.log(`🔍 [DEBUG] Body text sample: "${bodyText.substring(0, 200)}..."`)
        
        // POUZE 3 nejkritičtější chyby - vše ostatní VŽDY projde
        const absoluteCriticalErrors = [
          'account suspended',
          '404 not found', 
          'page not available'
        ]
        
        const lowerBodyText = bodyText.toLowerCase()
        const lowerTitle = pageTitle.toLowerCase()
        
        // Kontrola pouze na 3 nejkritičtější chyby
        for (const error of absoluteCriticalErrors) {
          if (lowerBodyText.includes(error) || lowerTitle.includes(error)) {
            return {
              isValid: false,
              reason: `Critical error detected: ${error}`,
              debug: { bodyLength: bodyText.length, title: pageTitle }
            }
          }
        }
        
        // ABSOLUTNĚ LIBERÁLNÍ validace - VŠECHNO projde
        // Pokud má stránka JAKÝKOLIV obsah (i 1 znak), projde
        return {
          isValid: true,
          reason: 'Page validation passed - proceeding with any content',
          debug: { bodyLength: bodyText.length, title: pageTitle }
        }
      })
      
      console.log(`🔍 [DEBUG] Validation result for ${username}:`, validation)
      
      if (validation.isValid) {
        console.log(`🚀 [QUICK-CHECK] ${username}: Page validation passed`)
      } else {
        console.log(`🚀 [QUICK-CHECK] ${username}: ${validation.reason}`)
      }
      
      return {
        isValid: validation.isValid,
        reason: validation.reason
      }
      
    } catch (error) {
      console.log(`⚠️ [QUICK-CHECK] Validation error for ${username}:`, error)
      // V případě chyby validace, VŽDY projde
      return {
        isValid: true,
        reason: 'Validation error - proceeding anyway'
      }
    }
  }
}

