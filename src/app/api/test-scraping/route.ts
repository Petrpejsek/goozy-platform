import { NextRequest, NextResponse } from 'next/server'
import { GoogleSearchScraper } from '../../../lib/scraping/google-search-scraper'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [TEST-SCRAPING] Starting simple test...')
    
    const { searchTerm } = await request.json()
    
    if (!searchTerm) {
      return NextResponse.json({ error: 'Search term required' }, { status: 400 })
    }

    console.log(`🔍 [TEST-SCRAPING] Searching for: "${searchTerm}"`)
    
    // Pouze Google Search - žádný Instagram scraping
    const googleScraper = new GoogleSearchScraper()
    await googleScraper.initialize()
    
    const searchQuery = `${searchTerm} site:instagram.com`
    console.log(`🔍 [TEST-SCRAPING] Google query: "${searchQuery}"`)
    
    const results = await googleScraper.searchInstagramProfiles(searchQuery, 'CZ', 5)
    
    await googleScraper.close()
    
    console.log(`✅ [TEST-SCRAPING] Found ${results.length} results`)
    
    return NextResponse.json({
      success: true,
      searchTerm,
      foundProfiles: results.length,
      profiles: results,
      message: `Found ${results.length} Instagram profiles via Google Search`
    })

  } catch (error: any) {
    console.error('❌ [TEST-SCRAPING] Error:', error.message)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Test scraping failed'
    }, { status: 500 })
  }
} 