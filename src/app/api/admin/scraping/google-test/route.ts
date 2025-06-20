import { NextRequest, NextResponse } from 'next/server'
import { GoogleSearchScraper } from '@/lib/scraping/google-search-scraper'

export async function POST(request: NextRequest) {
  try {
    const { country = 'CZ', category, limit = 10000 } = await request.json()
    
    console.log(`🔍 [GOOGLE-TEST] Starting Google Search test for ${country} ${category || 'all categories'}`)
    
    const googleScraper = new GoogleSearchScraper()
    
    try {
      await googleScraper.initialize()
      
      const results = await googleScraper.searchInstagramProfiles(country, category, limit)
      
      console.log(`✅ [GOOGLE-TEST] Found ${results.length} Instagram profiles`)
      
      // Filtrovat výsledky pro demo
      const filteredResults = googleScraper.filterResults(results, {
        minTitleLength: 5,
        maxResults: limit
      })
      
      return NextResponse.json({
        success: true,
        results: filteredResults,
        stats: {
          total: results.length,
          filtered: filteredResults.length,
          country,
          category: category || 'all',
          limit
        }
      })
      
    } finally {
      await googleScraper.close()
    }
    
  } catch (error) {
    console.error('❌ [GOOGLE-TEST] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
} 