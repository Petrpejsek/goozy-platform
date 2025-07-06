import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { GoogleSearchScraper } from '../../../../../lib/scraping/google-search-scraper'
import { InstagramScraper } from '../../../../../lib/scraping/instagram-scraper'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { hashtags, country, targetCount } = await request.json()

    console.log('🎯 [DATABASE-BUILD] Starting real scraping (NO BACKUP/FALLBACK)')
    console.log('🎯 [DATABASE-BUILD] Search terms:', hashtags)
    console.log('🎯 [DATABASE-BUILD] Country:', country)
    console.log('🎯 [DATABASE-BUILD] Target count:', targetCount)

    // Parsuj search terms
    const searchTerms = hashtags.split(',').map((term: string) => term.trim()).filter(Boolean)
    
    if (searchTerms.length === 0) {
      return NextResponse.json({ 
        error: 'No search terms provided' 
      }, { status: 400 })
    }

    // Inicializuj Google Search scraper
    const googleScraper = new GoogleSearchScraper()
    const instagramScraper = new InstagramScraper()
    
    console.log('🔧 [DATABASE-BUILD] Initializing Instagram scraper...')
    await instagramScraper.initialize()

    let allUsernames: string[] = []

    // Krok 1: Najdi Instagram profily přes Google Search
    console.log('🔍 [DATABASE-BUILD] Phase 1: Google Search for Instagram profiles')
    for (const term of searchTerms) {
      console.log(`🔍 [DATABASE-BUILD] Searching Google for: "${term}"`)
      
      try {
        const searchQuery = `site:instagram.com ${term} ${country === 'CZ' ? 'czech praha brno' : country}`
        const foundProfiles = await googleScraper.searchInstagramProfiles(searchQuery, 10)
        
        console.log(`✅ [DATABASE-BUILD] Found ${foundProfiles.length} profiles for "${term}"`)
        allUsernames.push(...foundProfiles)
      } catch (error) {
        console.error(`❌ [DATABASE-BUILD] Error searching for "${term}":`, error)
      }
    }

    // Odstranění duplicitů
    const uniqueUsernames = [...new Set(allUsernames)]
    console.log(`📊 [DATABASE-BUILD] Total unique profiles found: ${uniqueUsernames.length}`)

    if (uniqueUsernames.length === 0) {
      console.log('❌ [DATABASE-BUILD] No profiles found via Google Search')
      return NextResponse.json({
        success: false,
        message: 'No Instagram profiles found via Google Search',
        totalFound: 0,
        saved: 0
      })
    }

    // Krok 2: Scrapuj detaily z Instagram
    console.log('📱 [DATABASE-BUILD] Phase 2: Scraping Instagram profile details')
    let successCount = 0
    const maxProfiles = Math.min(uniqueUsernames.length, targetCount || 50)

    for (let i = 0; i < maxProfiles; i++) {
      const username = uniqueUsernames[i]
      console.log(`📱 [DATABASE-BUILD] Scraping profile: @${username} (${i + 1}/${maxProfiles})`)

      try {
        const profileData = await instagramScraper.scrapeProfile(username)
        
        if (profileData && profileData.totalFollowers > 1000) {
          // Ulož do databáze
          await prisma.influencer_database.create({
            data: {
              username: profileData.username,
              name: profileData.name || profileData.username,
              bio: profileData.bio || '',
              totalFollowers: profileData.totalFollowers,
              engagementRate: profileData.engagementRate || 0,
              country: country,
              profilePicture: profileData.profilePicture || '',
              isVerified: profileData.isVerified || false,
              postsCount: profileData.postsCount || 0,
              followingCount: profileData.followingCount || 0,
              isActive: true,
              location: profileData.location || null,
              categories: profileData.categories || [],
              lastUpdated: new Date()
            }
          })
          
          successCount++
          console.log(`✅ [DATABASE-BUILD] Saved @${username} (${profileData.totalFollowers} followers)`)
        } else {
          console.log(`⚠️ [DATABASE-BUILD] Skipped @${username} (insufficient data or followers)`)
        }
        
        // Delay mezi požadavky
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
        
      } catch (error) {
        console.error(`❌ [DATABASE-BUILD] Failed to scrape @${username}:`, error)
      }
    }

    // Ukončení
    console.log('🔚 [DATABASE-BUILD] Closing browser...')
    await instagramScraper.cleanup()

    const message = `Scraping completed! Found: ${uniqueUsernames.length}, Processed: ${maxProfiles}, Saved: ${successCount}`
    console.log(`🎉 [DATABASE-BUILD] ${message}`)

    return NextResponse.json({
      success: true,
      message,
      totalFound: uniqueUsernames.length,
      processed: maxProfiles,
      saved: successCount,
      searchTerms
    })

  } catch (error) {
    console.error('❌ [DATABASE-BUILD] Fatal error:', error)
    return NextResponse.json(
      { error: 'Failed to build database', details: error.message },
      { status: 500 }
    )
  }
} 