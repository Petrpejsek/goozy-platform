import { NextRequest, NextResponse } from 'next/server'
import { GoogleSearchScraper } from '../../../../../lib/scraping/google-search-scraper'

interface RequestBody {
  hashtags: string   // např. "fashion, beauty"
  country?: string   // např. "CZ", volitelné
  maxResultsPerQuery?: number // default 50000
}

export async function POST(request: NextRequest) {
  try {
    const { hashtags, country = 'CZ', maxResultsPerQuery = 50000 } = await request.json() as RequestBody

    if (!hashtags || typeof hashtags !== 'string') {
      return NextResponse.json({ success: false, message: 'Field "hashtags" is required' }, { status: 400 })
    }

    // Rozdělit vstup na jednotlivé tagy/klíčová slova
    const searchTerms = hashtags.split(',').map(t => t.trim()).filter(Boolean)
    if (searchTerms.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid search terms provided' }, { status: 400 })
    }

    const googleScraper = new GoogleSearchScraper()
    await googleScraper.initialize()
    
    // Sestavit search queries pro Instagram profily - optimalizováno pro španělskou IP
    const searchQueries = searchTerms.map(term => `site:instagram.com ${term} ${country}`.trim())
    const allUsernames = await googleScraper.searchInstagramProfiles(searchQueries, country || 'ES')

    // Odstranit duplicity a převést na plné URL
    const uniqueUsernames = [...new Set(allUsernames)]
    const profileUrls = uniqueUsernames.map(u => `https://www.instagram.com/${u}/`)

    // Uklidit browser (pokud byl vytvořen)
    await googleScraper.close()

    return NextResponse.json({
      success: true,
      foundProfiles: profileUrls.length,
      profiles: profileUrls,
      searchTerms
    })
  } catch (error: any) {
    console.error('❌ [LIST-BUILD] Fatal error:', error)
    return NextResponse.json({ success: false, message: 'Internal error', error: String(error.message || error) }, { status: 500 })
  }
} 