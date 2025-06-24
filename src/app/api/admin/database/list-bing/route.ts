import { NextRequest, NextResponse } from 'next/server'
import { BingSearchScraper } from '../../../../../lib/scraping/bing-search-scraper'
import { prisma } from '../../../../../lib/prisma'

interface RequestBody {
  hashtags: string   // např. "fashion, beauty"
  country?: string   // např. "CZ", volitelné
  maxResultsPerQuery?: number // deprecated - nahrazeno maxProfilesTotal
  maxPagesPerHashtag?: number // počet stránek pro každý hashtag (default 20)
  maxProfilesTotal?: number   // celkový limit profilů (0 = bez omezení)
}

export async function POST(request: NextRequest) {
  // Vytvoř záznam o běhu nejdříve
  let scrapingRun: any = null
  let config: any = null
  
  try {
    const { 
      hashtags, 
      country = 'CZ', 
      maxResultsPerQuery = 0, // deprecated
      maxPagesPerHashtag = 20,
      maxProfilesTotal = 0 // 0 = bez omezení
    } = await request.json() as RequestBody

    // 🚀 DEBUG: Zobrazit přijaté parametry
    console.log(`🔧 [BING-API-DEBUG] Received parameters:`)
    console.log(`📋 [BING-API-DEBUG] hashtags: "${hashtags}"`)
    console.log(`🌍 [BING-API-DEBUG] country: "${country}"`)
    console.log(`📄 [BING-API-DEBUG] maxPagesPerHashtag: ${maxPagesPerHashtag} (type: ${typeof maxPagesPerHashtag})`)
    console.log(`👥 [BING-API-DEBUG] maxProfilesTotal: ${maxProfilesTotal} (type: ${typeof maxProfilesTotal})`)

    if (!hashtags || typeof hashtags !== 'string') {
      return NextResponse.json({ success: false, message: 'Field "hashtags" is required' }, { status: 400 })
    }

    // Rozdělit vstup na jednotlivé tagy/klíčová slova
    const searchTerms = hashtags.split(',').map(t => t.trim()).filter(Boolean)
    if (searchTerms.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid search terms provided' }, { status: 400 })
    }

    // 💾 NOVÉ: Vytvoř config a scraping run pro sledování
    config = await prisma.scrapingConfig.create({
      data: {
        name: `Bing Search - ${country} - ${new Date().toISOString()}`,
        countries: JSON.stringify([country]),
        hashtags: JSON.stringify(searchTerms),
        platforms: JSON.stringify(['instagram']),
        minFollowers: 1000,
        maxFollowers: 1000000,
        targetCount: maxProfilesTotal || (maxPagesPerHashtag * searchTerms.length * 20),
        isActive: true
      }
    })

    scrapingRun = await prisma.scrapingRun.create({
      data: {
        configId: config.id,
        type: 'bing_search',
        status: 'running',
        sourceFilter: JSON.stringify({
          searchTerms,
          country,
          maxPagesPerHashtag,
          maxProfilesTotal
        })
      }
    })

    console.log(`🔍 [BING-API] Starting search with config:`)
    console.log(`📋 [BING-API] Search terms: ${searchTerms.join(', ')}`)
    console.log(`🌍 [BING-API] Country: ${country}`)
    console.log(`📄 [BING-API] Max pages per hashtag: ${maxPagesPerHashtag}`)
    console.log(`👥 [BING-API] Max total profiles: ${maxProfilesTotal || 'unlimited'}`)
    console.log(`🆔 [BING-API] Run ID: ${scrapingRun.id}`)

    const bingScraper = new BingSearchScraper()
    await bingScraper.initialize()
    
    // Předat konfigurační parametry do scraperu
    const searchOptions = {
      maxPagesPerHashtag: maxPagesPerHashtag,
      maxProfilesTotal: maxProfilesTotal
    }
    
    console.log(`🔧 [BING-API-DEBUG] Sending to scraper:`, searchOptions)
    
    const allUsernames = await bingScraper.searchInstagramProfiles(searchTerms, country, searchOptions)

    // Odstranit duplicity a převést na plné URL
    const uniqueUsernames = [...new Set(allUsernames)]
    const profileUrls = uniqueUsernames.map(u => `https://www.instagram.com/${u}/`)

    // Uklidit browser (pokud byl vytvořen)
    await bingScraper.close()

    // 💾 NOVÉ: Aktualizuj run s výsledky
    await prisma.scrapingRun.update({
      where: { id: scrapingRun.id },
      data: {
        status: 'completed',
        totalFound: profileUrls.length,
        totalProcessed: profileUrls.length,
        completedAt: new Date()
      }
    })

    console.log(`✅ [BING-API] Search completed: ${profileUrls.length} unique profiles found (Run: ${scrapingRun.id})`)

    return NextResponse.json({
      success: true,
      foundProfiles: profileUrls.length,
      profiles: profileUrls,
      searchTerms,
      searchEngine: 'bing',
      runId: scrapingRun.id,
      configuration: {
        maxPagesPerHashtag,
        maxProfilesTotal: maxProfilesTotal || 'unlimited',
        country
      }
    })
  } catch (error: any) {
    console.error('❌ [BING-LIST-BUILD] Fatal error:', error)
    
    // 💾 NOVÉ: Označ run jako failed
    if (scrapingRun) {
      try {
        await prisma.scrapingRun.update({
          where: { id: scrapingRun.id },
          data: {
            status: 'failed',
            errors: JSON.stringify([error.message || String(error)]),
            completedAt: new Date()
          }
        })
      } catch (dbError) {
        console.error('❌ [BING-API] Failed to update run status:', dbError)
      }
    }
    
    return NextResponse.json({ success: false, message: 'Internal error', error: String(error.message || error) }, { status: 500 })
  }
} 