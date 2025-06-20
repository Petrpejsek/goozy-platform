import { prisma } from '@/lib/prisma'
import { InstagramScraper, type InstagramProfile } from './instagram-scraper'
import { GoogleSearchScraper, type GoogleSearchResult } from './google-search-scraper'
import fs from 'fs'
import path from 'path'
import https from 'https'

export interface ScrapingConfig {
  countries: string[]
  minFollowers: number
  maxFollowers: number
  targetCount: number
  platforms: string[]
  // NOVÉ: Hashtag/keyword targeting
  hashtags?: string[]        // Specifické hashtags k vyhledání (např. ["fashion", "beauty", "lifestyle"])
  keywords?: string[]        // Keywords pro bio/name filtering (např. ["blogger", "influencer", "model"])
  excludeKeywords?: string[] // Keywords k vyloučení (např. ["business", "shop", "store"])
}

export interface FoundProspect {
  name: string
  email?: string
  bio?: string
  avatar?: string
  country?: string
  totalFollowers: number
  engagementRate?: number
  avgLikes?: number
  avgComments?: number
  
  // Unikátní identifikátory pro detekci duplikátů
  instagramUsername?: string
  instagramUrl?: string
  tiktokUsername?: string
  tiktokUrl?: string
  youtubeChannel?: string
  youtubeUrl?: string
  
  instagramData?: any
  tiktokData?: any
  youtubeData?: any
}

export class ScrapingOrchestrator {
  private instagramScraper: InstagramScraper | null = null
  private googleSearchScraper: GoogleSearchScraper | null = null
  private currentRunId: string | null = null

  async initializeScrapers(platforms: string[]) {
    console.log('🔧 [DEBUG] Initializing scrapers for platforms:', platforms)
    
    if (platforms.includes('instagram')) {
      this.instagramScraper = new InstagramScraper()
      await this.instagramScraper.initialize() // DŮLEŽITÉ: Inicializovat browser
      console.log('✅ [DEBUG] Instagram scraper created and initialized')
    }

    // Vždy inicializovat Google Search scraper pro discovery
    this.googleSearchScraper = new GoogleSearchScraper()
    console.log('✅ [DEBUG] Google Search scraper created')
    
    // TODO: Inicializace TikTok a YouTube scraperů
  }

  async closeScrapers() {
    console.log('🧹 [DEBUG] Closing scrapers...')
    
    if (this.instagramScraper) {
      await this.instagramScraper.close()
      this.instagramScraper = null
      console.log('🔚 [DEBUG] Instagram scraper closed')
    }

    if (this.googleSearchScraper) {
      await this.googleSearchScraper.close()
      this.googleSearchScraper = null
      console.log('🔚 [DEBUG] Google Search scraper closed')
    }
    
    console.log('🧹 [DEBUG] All scrapers closed')
  }

  async runScraping(runId: string, config: ScrapingConfig): Promise<FoundProspect[]> {
    console.log('🚀 [DEBUG] Starting runScraping with config:', JSON.stringify(config, null, 2))
    console.log('🚀 [DEBUG] RunId:', runId)
    
    this.currentRunId = runId
    
    const uniqueProspects: FoundProspect[] = []
    const seenIdentifiers = new Set<string>()
    
    try {
      console.log('🔧 [DEBUG] Initializing scrapers...')
      await this.initializeScrapers(config.platforms)
      console.log('✅ [DEBUG] Scrapers initialized successfully')
      
      let profilesProcessed = 0
      const maxProfilesToProcess = config.targetCount
      
      console.log(`🎯 [DEBUG] Target: Process exactly ${maxProfilesToProcess} profiles (regardless of success)`)
      
      // Procházet země dokud nezpracujeme požadovaný počet profilů
      for (const country of config.countries) {
        if (profilesProcessed >= maxProfilesToProcess) {
          console.log('🎯 [DEBUG] Target number of profiles processed, breaking from country loop')
          break
        }
        
        console.log(`🌍 [DEBUG] Scraping country: ${country}`)
        
        if (config.platforms.includes('instagram') && this.instagramScraper) {
          console.log('📱 [DEBUG] Starting Instagram scraping...')
          const remainingProfiles = maxProfilesToProcess - profilesProcessed
          const result = await this.scrapeInstagram(country, config, remainingProfiles)
          console.log(`📱 [DEBUG] Instagram scraping returned ${result.prospects.length} prospects, attempted ${result.profilesAttempted} profiles`)
          
          // Aktualizovat počet zpracovaných profilů
          profilesProcessed += result.profilesAttempted
          
          // Filtrovat duplicity v reálném čase
          for (const prospect of result.prospects) {
            console.log(`🔍 [DEBUG] Checking prospect: ${prospect.name}`)
            const isDuplicate = await this.isDuplicateProspect(prospect, seenIdentifiers)
            
            if (!isDuplicate) {
              // Přidat unikátní identifikátory do setu
              this.addIdentifiersToSet(prospect, seenIdentifiers)
              uniqueProspects.push(prospect)
              
              console.log(`💾 [DEBUG] Saving prospect to database...`)
              // Uložit ihned do databáze jako pending
              await this.saveProspectToDatabase(runId, prospect)
              console.log(`💾 [DEBUG] Prospect saved successfully`)
              
              console.log(`✅ Added unique prospect: ${prospect.name} (@${prospect.instagramUsername || 'unknown'})`)
            } else {
              console.log(`⏭️ Skipped duplicate: ${prospect.name}`)
            }
          }
          
          console.log(`📊 [DEBUG] Updating progress in database...`)
          // Aktualizovat progress
          await this.updateProgress(runId, profilesProcessed, uniqueProspects.length)
          console.log(`📊 [DEBUG] Progress updated: ${profilesProcessed} processed, ${uniqueProspects.length} found`)
        } else {
          console.log(`❌ [DEBUG] Instagram scraper not available or not requested`)
        }
        
        // TODO: TikTok a YouTube scraping
      }
      
      console.log(`🎉 Scraping completed! Processed ${profilesProcessed} profiles, found ${uniqueProspects.length} unique prospects`)
      
      // Po dokončení scraping běhu spustit automatickou extrakci emailů
      try {
        console.log(`📧 [DEBUG] Running automatic email extraction from bio fields...`)
        const { autoExtractEmailsFromBio } = await import('./email-extractor')
        const emailResult = await autoExtractEmailsFromBio()
        
        if (emailResult.updated > 0) {
          console.log(`✅ [EMAIL-EXTRACTOR] Successfully extracted ${emailResult.updated} emails from bio fields`)
          console.log(`📋 [EMAIL-EXTRACTOR] Extracted emails:`, emailResult.extracted)
        } else {
          console.log(`ℹ️  [EMAIL-EXTRACTOR] No emails found in bio fields to extract`)
        }
      } catch (error) {
        console.error(`❌ [EMAIL-EXTRACTOR] Error during automatic email extraction:`, error)
        // Nekritická chyba - pokračujeme dál
      }
      
      return uniqueProspects
      
    } catch (error) {
      console.error('❌ [ERROR] Error in scraping orchestrator:', error)
      throw error
    } finally {
      console.log('🧹 [DEBUG] Closing scrapers...')
      await this.closeScrapers()
      console.log('🧹 [DEBUG] Scrapers closed')
    }
  }

  private async scrapeInstagram(country: string, config: ScrapingConfig, maxProfiles: number): Promise<{prospects: FoundProspect[], profilesAttempted: number}> {
    console.log(`📱 [DEBUG] scrapeInstagram called for country: ${country}, maxProfiles: ${maxProfiles}`)
    
    if (!this.instagramScraper) {
      console.log(`❌ [DEBUG] Instagram scraper not available`)
      return { prospects: [], profilesAttempted: 0 }
    }
    
    const prospects: FoundProspect[] = []
    let profilesProcessed = 0
    
    try {
      console.log(`🔍 [DEBUG] Searching usernames for location: ${country}`)
      
      let locationUsernames: string[] = []
      
      if (config.hashtags && config.hashtags.length > 0) {
        // Použít specifické hashtags z konfigurace
        console.log(`🏷️ [HASHTAG-TARGET] Using configured hashtags: ${config.hashtags.join(', ')}`)
        locationUsernames = await this.instagramScraper.searchByHashtags(config.hashtags, maxProfiles * 2)
      } else {
        // 🔍 NOVÉ: Použít Google Search pro discovery!
        console.log(`🔍 [GOOGLE-DISCOVERY] No hashtags specified - using Google Search discovery for: ${country}`)
        
        if (this.googleSearchScraper) {
          try {
            // Určit kategorii na základě keywords
            const category = this.detectCategoryFromKeywords(config.keywords)
            console.log(`📂 [GOOGLE-DISCOVERY] Detected category: ${category || 'all categories'}`)
            
            const googleResults = await this.googleSearchScraper.searchInstagramProfiles(country, category, maxProfiles * 2)
            console.log(`🔍 [GOOGLE-DISCOVERY] Found ${googleResults.length} profiles from Google Search`)
            
            // Filtrovat výsledky podle konfigurace
            const filteredResults = this.googleSearchScraper.filterResults(googleResults, {
              requiresKeywords: config.keywords,
              excludeKeywords: config.excludeKeywords,
              minTitleLength: 5,
              maxResults: maxProfiles * 2
            })
            
            console.log(`🔍 [GOOGLE-DISCOVERY] After filtering: ${filteredResults.length} profiles`)
            
            // Extrahovat usernames
            locationUsernames = filteredResults.map(result => result.username)
            
          } catch (error) {
            console.error(`❌ [GOOGLE-DISCOVERY] Error during Google Search:`, error)
            // Fallback na advanced discovery pouze pokud Google selže
            console.log(`⚠️ [FALLBACK] Google Search failed, trying advanced discovery...`)
            locationUsernames = await this.instagramScraper.advancedRandomDiscovery(country, maxProfiles * 2)
          }
        } else {
          console.log(`❌ [GOOGLE-DISCOVERY] Google Search scraper not available, using advanced discovery`)
          locationUsernames = await this.instagramScraper.advancedRandomDiscovery(country, maxProfiles * 2)
        }
      }
      
      console.log(`🔍 [DEBUG] Found ${locationUsernames.length} usernames for location ${country}:`, locationUsernames)
      
      // OPTIMALIZACE: Předfiltrovat usernames před scrapingem
      console.log(`🔍 [OPTIMIZATION] Pre-filtering usernames to remove known duplicates...`)
      const filteredUsernames = await this.preFilterUsernames(locationUsernames)
      
      console.log(`📊 [OPTIMIZATION] After pre-filtering: ${locationUsernames.length} -> ${filteredUsernames.length} usernames`)
      
      // Zpracovat pouze maxProfiles profilů z filtrovaných
      const usernamesToProcess = filteredUsernames.slice(0, maxProfiles)
      
      for (const username of usernamesToProcess) {
        console.log(`👤 [DEBUG] Processing profile: ${username}`)
        
        const attemptStartTime = Date.now()
        let attemptStatus = 'failed'
        let attemptError = null
        let scrapedData = null
        let prospectId = null
        
        try {
          // Inicializace scraperu pokud není
          if (!this.instagramScraper.isInitialized()) {
            console.log(`🔧 [DEBUG] Initializing Instagram scraper...`)
            await this.instagramScraper.initialize()
          }
          
          // OPTIMALIZACE: Rychlá kontrola private accountu PŘED scrapingem
          console.log(`🔒 [OPTIMIZATION] Pre-checking if ${username} is private...`)
          const isPrivate = await this.instagramScraper.isAccountPrivate(username)
          
          if (isPrivate) {
            const attemptDuration = Date.now() - attemptStartTime
            attemptStatus = 'skipped_private'
            attemptError = 'Account is private - skipped to save time'
            
            console.log(`⏭️  [OPTIMIZATION] Skipped ${username}: private account`)
            
            // Uložit skipped pokus do databáze
            await this.saveScrapingAttempt({
              scrapingRunId: this.currentRunId!,
              platform: 'instagram',
              username: username,
              profileUrl: `https://www.instagram.com/${username}/`,
              country: country,
              status: attemptStatus,
              errorMessage: attemptError,
              scrapedData: null,
              prospectId: null,
              duration: attemptDuration
            })
            
            profilesProcessed++
            continue
          }
          
          console.log(`✅ [OPTIMIZATION] ${username} is public, proceeding with scraping...`)
          
          const profile = await this.instagramScraper.scrapeProfile(username)
          console.log(`👤 [DEBUG] Profile scraped for ${username}:`, profile ? 'SUCCESS' : 'FAILED')
          
          const attemptDuration = Date.now() - attemptStartTime
          
          if (profile) {
            attemptStatus = 'success'
            scrapedData = JSON.stringify(profile)
            
            console.log(`🔍 [DEBUG] Validating prospect ${username} with ${profile.followers} followers`)
            const isValid = this.isValidProspect(profile, config)
            console.log(`🔍 [DEBUG] Prospect ${username} validation result: ${isValid}`)
            
            if (isValid) {
              console.log(`✅ [DEBUG] Converting profile to prospect: ${username}`)
              const prospect = await this.convertInstagramProfileToProspect(profile)
              console.log(`✅ [DEBUG] Prospect created for ${username}`)
              
              // Stažení a uložení avataru
              if (profile.profilePicUrl) {
                console.log(`🖼️ [DEBUG] Downloading avatar for ${username}`)
                prospect.avatar = await this.downloadAvatar(profile.profilePicUrl, username)
                console.log(`🖼️ [DEBUG] Avatar downloaded: ${prospect.avatar}`)
              }
              
              prospects.push(prospect)
              console.log(`✅ Added Instagram prospect: ${profile.name} (@${username})`)
            } else {
              console.log(`❌ [DEBUG] Prospect ${username} did not pass validation (followers: ${profile.followers})`)
            }
          } else {
            attemptStatus = 'not_found'
            attemptError = 'Profile data is null - profile may be private or unavailable'
            console.log(`❌ [DEBUG] Profile data is null for ${username} - profile may be private or unavailable`)
          }
          
          // Uložit pokus do databáze
          await this.saveScrapingAttempt({
            scrapingRunId: this.currentRunId!,
            platform: 'instagram',
            username: username,
            profileUrl: `https://www.instagram.com/${username}/`,
            country: country,
            status: attemptStatus,
            errorMessage: attemptError,
            scrapedData: scrapedData,
            prospectId: prospectId,
            duration: attemptDuration
          })
          
          profilesProcessed++
          
          // Delší pauza mezi požadavky pro simulaci lidského chování
          const delayTime = Math.floor(Math.random() * 8000) + 5000 // 5-13 sekund
          console.log(`⏰ [DEBUG] Waiting ${delayTime/1000} seconds before next profile...`)
          await this.delay(delayTime)
          
        } catch (error) {
          const attemptDuration = Date.now() - attemptStartTime
          attemptStatus = 'failed'
          attemptError = error instanceof Error ? error.message : String(error)
          
          console.error(`❌ [ERROR] Error scraping Instagram profile ${username}:`, error)
          
          // Uložit neúspěšný pokus do databáze
          await this.saveScrapingAttempt({
            scrapingRunId: this.currentRunId!,
            platform: 'instagram',
            username: username,
            profileUrl: `https://www.instagram.com/${username}/`,
            country: country,
            status: attemptStatus,
            errorMessage: attemptError,
            scrapedData: null,
            prospectId: null,
            duration: attemptDuration
          })
          
          profilesProcessed++
          console.log(`➡️ [DEBUG] Continuing to next profile...`)
        }
      }
      
      console.log(`📱 [DEBUG] Instagram scraping completed for ${country}. Processed ${profilesProcessed} profiles, found ${prospects.length} valid prospects`)
      
    } catch (error) {
      console.error(`❌ [ERROR] Error scraping Instagram for country ${country}:`, error)
    }
    
    return { prospects, profilesAttempted: profilesProcessed }
  }

  private isValidProspect(profile: InstagramProfile, config: ScrapingConfig): boolean {
    // Kontrola počtu sledujících
    if (profile.followers < config.minFollowers || profile.followers > config.maxFollowers) {
      console.log(`❌ [VALIDATION] ${profile.name} rejected: followers ${profile.followers} outside range ${config.minFollowers}-${config.maxFollowers}`)
      return false
    }
    
    // Základní validace profilu
    if (!profile.name || profile.name.length < 2) {
      console.log(`❌ [VALIDATION] ${profile.name} rejected: invalid name`)
      return false
    }
    
    // Profil nesmí být soukromý
    if (profile.isPrivate) {
      console.log(`❌ [VALIDATION] ${profile.name} rejected: private profile`)
      return false
    }
    
    // NOVÁ VALIDACE: Keyword filtering
    if (config.keywords && config.keywords.length > 0) {
      const textToCheck = `${profile.name} ${profile.bio || ''}`.toLowerCase()
      const hasRequiredKeyword = config.keywords.some(keyword => 
        textToCheck.includes(keyword.toLowerCase())
      )
      
      if (!hasRequiredKeyword) {
        console.log(`❌ [VALIDATION] ${profile.name} rejected: missing required keywords [${config.keywords.join(', ')}]`)
        return false
      }
    }
    
    // NOVÁ VALIDACE: Exclude keywords
    if (config.excludeKeywords && config.excludeKeywords.length > 0) {
      const textToCheck = `${profile.name} ${profile.bio || ''}`.toLowerCase()
      const hasExcludedKeyword = config.excludeKeywords.some(keyword => 
        textToCheck.includes(keyword.toLowerCase())
      )
      
      if (hasExcludedKeyword) {
        console.log(`❌ [VALIDATION] ${profile.name} rejected: contains excluded keywords [${config.excludeKeywords.join(', ')}]`)
        return false
      }
    }
    
    console.log(`✅ [VALIDATION] ${profile.name} passed all validation checks`)
    return true
  }

  private async convertInstagramProfileToProspect(profile: InstagramProfile): Promise<FoundProspect> {
    // Odhadnout engagement rate na základě počtu followerů (průměrné hodnoty)
    const estimatedEngagementRate = profile.followers > 1000000 ? 0.015 : 
                                  profile.followers > 100000 ? 0.025 : 
                                  profile.followers > 10000 ? 0.035 : 0.045
                                  
    const estimatedAvgLikes = Math.round(profile.followers * estimatedEngagementRate)
    const estimatedAvgComments = Math.round(estimatedAvgLikes * 0.1)

    // Pokusit se extrahovat email z bio během scraping
    let extractedEmail: string | undefined = undefined
    if (profile.bio) {
      try {
        const { extractEmailFromScrapedBio } = await import('./email-extractor')
        extractedEmail = extractEmailFromScrapedBio(profile.bio) || undefined
        if (extractedEmail) {
          console.log(`📧 [EMAIL-EXTRACTOR] Email extracted during scraping for ${profile.name}: ${extractedEmail}`)
        }
      } catch (error) {
        console.error(`❌ [EMAIL-EXTRACTOR] Error extracting email during scraping:`, error)
      }
    }

    return {
      name: profile.name,
      email: extractedEmail, // Extrahovaný email z bio
      bio: profile.bio,
      country: "CZ", // Předpokládáme CZ protože hledáme české influencery
      totalFollowers: profile.followers,
      engagementRate: estimatedEngagementRate,
      avgLikes: estimatedAvgLikes,
      avgComments: estimatedAvgComments,
      
      // Unikátní identifikátory
      instagramUsername: profile.username,
      instagramUrl: `https://www.instagram.com/${profile.username}/`,
      
      instagramData: {
        username: profile.username,
        followers: profile.followers,
        following: profile.following,
        posts: profile.posts,
        verified: profile.isVerified,
        isPrivate: profile.isPrivate,
        profilePicUrl: profile.profilePicUrl
      }
    }
  }

  private async downloadAvatar(url: string, username: string): Promise<string> {
    try {
      const avatarsDir = path.join(process.cwd(), 'public', 'avatars')
      
      // Vytvořit složku pokud neexistuje
      if (!fs.existsSync(avatarsDir)) {
        fs.mkdirSync(avatarsDir, { recursive: true })
      }
      
      const fileName = `${username}_${Date.now()}.jpg`
      const filePath = path.join(avatarsDir, fileName)
      
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath)
        
        https.get(url, (response) => {
          response.pipe(file)
          
          file.on('finish', () => {
            file.close()
            resolve(`/avatars/${fileName}`)
          })
          
          file.on('error', (error) => {
            fs.unlink(filePath, () => {}) // Smazat neúplný soubor
            reject(error)
          })
        }).on('error', reject)
      })
      
    } catch (error) {
      console.error('Error downloading avatar:', error)
      return undefined
    }
  }

  // Kontrola zda je prospect duplicitní proti databázi a aktuálnímu setu
  private async isDuplicateProspect(prospect: FoundProspect, seenIdentifiers: Set<string>): Promise<boolean> {
    // Sestavit identifikátory pro kontrolu
    const identifiers = []
    
    if (prospect.instagramUsername) {
      identifiers.push(`instagram:${prospect.instagramUsername.toLowerCase()}`)
    }
    if (prospect.instagramUrl) {
      identifiers.push(`url:${prospect.instagramUrl.toLowerCase()}`)
    }
    if (prospect.email) {
      identifiers.push(`email:${prospect.email.toLowerCase()}`)
    }
    if (prospect.tiktokUsername) {
      identifiers.push(`tiktok:${prospect.tiktokUsername.toLowerCase()}`)
    }
    if (prospect.youtubeChannel) {
      identifiers.push(`youtube:${prospect.youtubeChannel.toLowerCase()}`)
    }
    
    // Kontrola proti aktuálnímu setu
    for (const identifier of identifiers) {
      if (seenIdentifiers.has(identifier)) {
        console.log(`Duplicate found in current session: ${identifier}`)
        return true
      }
    }
    
    // Kontrola proti databázi (všech existujících prospektů)
    try {
      const existingProspects = await prisma.influencerProspect.findMany({
        where: {
          OR: [
            prospect.instagramUsername ? { instagramUsername: prospect.instagramUsername } : {},
            prospect.instagramUrl ? { instagramUrl: prospect.instagramUrl } : {},
            prospect.email ? { email: prospect.email } : {},
            prospect.tiktokUsername ? { tiktokUsername: prospect.tiktokUsername } : {},
            prospect.youtubeChannel ? { youtubeChannel: prospect.youtubeChannel } : {}
          ].filter(condition => Object.keys(condition).length > 0)
        }
      })
      
      if (existingProspects.length > 0) {
        console.log(`Duplicate found in database: ${prospect.name}`)
        return true
      }
    } catch (error) {
      console.error('Error checking duplicates in database:', error)
      // V případě chyby pokračujeme (raději duplikát než ztratit prospect)
    }
    
    return false
  }
  
  // Přidat identifikátory do setu pro tracking v aktuální session
  private addIdentifiersToSet(prospect: FoundProspect, seenIdentifiers: Set<string>): void {
    if (prospect.instagramUsername) {
      seenIdentifiers.add(`instagram:${prospect.instagramUsername.toLowerCase()}`)
    }
    if (prospect.instagramUrl) {
      seenIdentifiers.add(`url:${prospect.instagramUrl.toLowerCase()}`)
    }
    if (prospect.email) {
      seenIdentifiers.add(`email:${prospect.email.toLowerCase()}`)
    }
    if (prospect.tiktokUsername) {
      seenIdentifiers.add(`tiktok:${prospect.tiktokUsername.toLowerCase()}`)
    }
    if (prospect.youtubeChannel) {
      seenIdentifiers.add(`youtube:${prospect.youtubeChannel.toLowerCase()}`)
    }
  }
  
  // Uložit jednotlivý prospect do databáze
  private async saveProspectToDatabase(runId: string, prospect: FoundProspect): Promise<void> {
    try {
      await prisma.influencerProspect.create({
        data: {
          scrapingRunId: runId,
          name: prospect.name,
          email: prospect.email,
          bio: prospect.bio,
          avatar: prospect.avatar,
          country: prospect.country,
          
          // Unikátní identifikátory
          instagramUsername: prospect.instagramUsername,
          instagramUrl: prospect.instagramUrl,
          tiktokUsername: prospect.tiktokUsername,
          tiktokUrl: prospect.tiktokUrl,
          youtubeChannel: prospect.youtubeChannel,
          youtubeUrl: prospect.youtubeUrl,
          
          // Platform data
          instagramData: prospect.instagramData ? JSON.stringify(prospect.instagramData) : null,
          tiktokData: prospect.tiktokData ? JSON.stringify(prospect.tiktokData) : null,
          youtubeData: prospect.youtubeData ? JSON.stringify(prospect.youtubeData) : null,
          
          // Stats
          totalFollowers: prospect.totalFollowers,
          engagementRate: prospect.engagementRate,
          avgLikes: prospect.avgLikes,
          avgComments: prospect.avgComments,
          
          status: 'pending'
        }
      })
    } catch (error) {
      console.error('Error saving prospect to database:', error)
      throw error
    }
  }

  private async deduplicateProspects(prospects: FoundProspect[]): Promise<FoundProspect[]> {
    const uniqueProspects: FoundProspect[] = []
    const seenEmails = new Set<string>()
    const seenNames = new Set<string>()
    
    for (const prospect of prospects) {
      let isDuplicate = false
      
      // Kontrola duplicity podle emailu (přesná shoda)
      if (prospect.email) {
        if (seenEmails.has(prospect.email.toLowerCase())) {
          isDuplicate = true
        } else {
          seenEmails.add(prospect.email.toLowerCase())
        }
      }
      
      // Kontrola duplicity podle jména (přesná shoda)
      const normalizedName = prospect.name.toLowerCase().trim()
      if (seenNames.has(normalizedName)) {
        isDuplicate = true
      } else {
        seenNames.add(normalizedName)
      }
      
      if (!isDuplicate) {
        uniqueProspects.push(prospect)
      } else {
        console.log(`Duplicate prospect detected: ${prospect.name} (${prospect.email || 'no email'})`)
      }
    }
    
    console.log(`Deduplication: ${prospects.length} -> ${uniqueProspects.length} prospects`)
    return uniqueProspects
  }

  private async saveProspectsToDatabase(runId: string, prospects: FoundProspect[]) {
    try {
      for (const prospect of prospects) {
        await prisma.influencerProspect.create({
          data: {
            scrapingRunId: runId,
            name: prospect.name,
            email: prospect.email,
            bio: prospect.bio,
            avatar: prospect.avatar,
            country: prospect.country,
            totalFollowers: prospect.totalFollowers,
            engagementRate: prospect.engagementRate,
            avgLikes: prospect.avgLikes,
            avgComments: prospect.avgComments,
            instagramData: prospect.instagramData ? JSON.stringify(prospect.instagramData) : null,
            tiktokData: prospect.tiktokData ? JSON.stringify(prospect.tiktokData) : null,
            youtubeData: prospect.youtubeData ? JSON.stringify(prospect.youtubeData) : null
          }
        })
      }
      
      console.log(`Saved ${prospects.length} prospects to database`)
    } catch (error) {
      console.error('Error saving prospects to database:', error)
      throw error
    }
  }

  // NOVÁ METODA: Předfiltrování usernames před scrapingem
  private async preFilterUsernames(usernames: string[]): Promise<string[]> {
    try {
      console.log(`🔍 [PRE-FILTER] Checking ${usernames.length} usernames against database...`)
      
      // Najít všechny existující Instagram usernames v databázi
      const existingProspects = await prisma.influencerProspect.findMany({
        where: {
          instagramUsername: {
            in: usernames
          }
        },
        select: {
          instagramUsername: true,
          status: true,
          name: true
        }
      })
      
      // Vytvořit set existujících usernames pro rychlé lookup
      const existingUsernames = new Set(
        existingProspects.map(p => p.instagramUsername?.toLowerCase()).filter(Boolean)
      )
      
      // Filtrovat pouze nové usernames
      const newUsernames = usernames.filter(username => 
        !existingUsernames.has(username.toLowerCase())
      )
      
      const skippedCount = usernames.length - newUsernames.length
      if (skippedCount > 0) {
        console.log(`⏭️  [PRE-FILTER] Skipped ${skippedCount} already known usernames:`)
        const skippedUsernames = usernames.filter(username => 
          existingUsernames.has(username.toLowerCase())
        )
        console.log(`⏭️  [PRE-FILTER] Skipped: ${skippedUsernames.join(', ')}`)
      }
      
      console.log(`✅ [PRE-FILTER] ${newUsernames.length} new usernames ready for scraping`)
      return newUsernames
      
    } catch (error) {
      console.error('❌ [PRE-FILTER] Error during pre-filtering, continuing with all usernames:', error)
      // V případě chyby vrátíme všechny usernames (safer fallback)
      return usernames
    }
  }

  private async updateProgress(runId: string, totalProcessed: number, totalFound: number) {
    try {
      await prisma.scrapingRun.update({
        where: { id: runId },
        data: {
          totalProcessed,
          totalFound
        }
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Helper metoda pro detekci kategorie z keywords
  private detectCategoryFromKeywords(keywords?: string[]): string | undefined {
    if (!keywords || keywords.length === 0) return undefined

    const categoryMapping: Record<string, string[]> = {
      'fashion': ['fashion', 'móda', 'style', 'styling', 'outfit', 'ootd'],
      'beauty': ['beauty', 'makeup', 'cosmetics', 'skincare', 'líčení', 'krása'],
      'lifestyle': ['lifestyle', 'blogger', 'blogerka', 'life', 'životní'],
      'fitness': ['fitness', 'gym', 'workout', 'sport', 'zdraví', 'health'],
      'food': ['food', 'recipe', 'cooking', 'jídlo', 'recepty', 'vaření'],
      'travel': ['travel', 'cestování', 'trip', 'vacation', 'dovolená'],
      'parenting': ['mama', 'mum', 'mom', 'baby', 'děti', 'rodina'],
      'photography': ['photography', 'foto', 'photographer', 'fotograf']
    }

    // Najít kategorii která má nejvíce matchů s keywords
    let bestCategory: string | undefined = undefined
    let maxMatches = 0

    for (const [category, terms] of Object.entries(categoryMapping)) {
      const matches = keywords.filter(keyword => 
        terms.some(term => keyword.toLowerCase().includes(term.toLowerCase()))
      ).length

      if (matches > maxMatches) {
        maxMatches = matches
        bestCategory = category
      }
    }

    return bestCategory
  }

  private async saveScrapingAttempt(attempt: {
    scrapingRunId: string
    platform: string
    username: string
    profileUrl?: string
    country?: string
    status: string
    errorMessage?: string
    scrapedData?: string
    prospectId?: string
    duration?: number
  }): Promise<void> {
    try {
      await prisma.scrapingAttempt.create({
        data: {
          scrapingRunId: attempt.scrapingRunId,
          platform: attempt.platform,
          username: attempt.username,
          profileUrl: attempt.profileUrl,
          country: attempt.country,
          status: attempt.status,
          errorMessage: attempt.errorMessage,
          scrapedData: attempt.scrapedData,
          prospectId: attempt.prospectId,
          duration: attempt.duration
        }
      })
    } catch (error) {
      console.error('❌ [ERROR] Failed to save scraping attempt:', error)
    }
  }
} 