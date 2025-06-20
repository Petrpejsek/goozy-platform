import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [DEBUG] POST /api/admin/scraping/start called')
    
    const body = await request.json()
    console.log('🚀 [DEBUG] Request body:', JSON.stringify(body, null, 2))
    
    const { country, hashtags, maxPagesPerHashtag, humanDelayMin, humanDelayMax, maxRunTime } = body
    
    if (!country || !hashtags || hashtags.length === 0) {
      console.log('❌ [DEBUG] Missing required parameters: country or hashtags')
      return NextResponse.json({ error: 'Country and hashtags are required' }, { status: 400 })
    }
    
    console.log(`💾 [DEBUG] Creating new scraping config...`)
    
    // Vytvořit novou konfiguraci pro tento run
    const config = await prisma.scrapingConfig.create({
      data: {
        name: `Hashtag Scraping - ${country} - ${new Date().toISOString()}`,
        countries: JSON.stringify([country]),
        hashtags: JSON.stringify(hashtags),
        platforms: JSON.stringify(['instagram']), // jen Instagram pro hashtag scraping
        minFollowers: 1000, // rozumné minimum
        maxFollowers: 1000000, // rozumné maximum
        targetCount: maxPagesPerHashtag * hashtags.length * 10, // odhad kolik můžeme najít
        isActive: true
      }
    })
    
    console.log('💾 [DEBUG] Scraping config created:', JSON.stringify(config, null, 2))
    
    console.log('💾 [DEBUG] Creating new scraping run...')
    
    // Vytvořit nový scraping run
    const scrapingRun = await prisma.scrapingRun.create({
      data: {
        configId: config.id,
        status: 'running'
      }
    })
    
    console.log('💾 [DEBUG] Scraping run created:', JSON.stringify(scrapingRun, null, 2))
    
    console.log('🔄 [DEBUG] Updating config lastRunAt...')
    
    // Aktualizovat lastRunAt v konfiguraci
    await prisma.scrapingConfig.update({
      where: { id: config.id },
      data: { lastRunAt: new Date() }
    })
    
    console.log('✅ [DEBUG] Config updated, starting scraping process...')
    
    // Spustit SKUTEČNÝ scraping proces na pozadí s novými parametry
    startRealScrapingProcess(scrapingRun.id, {
      ...config,
      hashtags: JSON.stringify(hashtags), // přidáme hashtags do konfigurace
      maxPagesPerHashtag,
      humanDelayMin,
      humanDelayMax,
      maxRunTime
    })
    
    console.log('🎉 [DEBUG] Scraping start process completed successfully')
    
    return NextResponse.json({ 
      success: true, 
      runId: scrapingRun.id,
      configId: config.id,
      message: 'Hashtag scraping started successfully' 
    })
  } catch (error) {
    console.error('❌ [ERROR] Error starting scraping:', error)
    return NextResponse.json({ error: 'Failed to start scraping' }, { status: 500 })
  }
}

// STARÝ simulační kód - SMAZÁN, nyní používáme skutečný ScrapingOrchestrator!

// SKUTEČNÝ scraping proces s hashtags
async function startRealScrapingProcess(runId: string, config: any) {
  console.log(`🎬 [DEBUG] startScrapingProcess called with runId: ${runId}`)
  
  try {
    console.log(`📦 [DEBUG] Attempting to import ScrapingOrchestrator...`)
    const { ScrapingOrchestrator } = await import('@/lib/scraping/scraping-orchestrator')
    console.log(`✅ [DEBUG] ScrapingOrchestrator import successful`)
    
    console.log(`🎬 [DEBUG] Starting real scraping for run ${runId} with config:`, JSON.stringify(config, null, 2))
    
    // Spustit scraping na pozadí
    setTimeout(async () => {
      console.log(`🕐 [DEBUG] Background process started for run ${runId}`)
      
      const orchestrator = new ScrapingOrchestrator()
      
      try {
        console.log(`🔧 [DEBUG] Parsing config data...`)
        
        const scrapingConfig = {
          countries: JSON.parse(config.countries),
          hashtags: JSON.parse(config.hashtags), // ✅ PŘIDÁNO: hashtags pro skutečný scraping
          minFollowers: config.minFollowers,
          maxFollowers: config.maxFollowers,
          targetCount: config.maxPagesPerHashtag * JSON.parse(config.hashtags).length * 10, // odhad počtu profilů
          platforms: JSON.parse(config.platforms)
        }
        
        console.log(`🔧 [DEBUG] Parsed scraping config:`, JSON.stringify(scrapingConfig, null, 2))
        
        console.log(`🚀 [DEBUG] Starting orchestrator.runScraping...`)
        const prospects = await orchestrator.runScraping(runId, scrapingConfig)
        console.log(`🚀 [DEBUG] orchestrator.runScraping completed, got ${prospects.length} prospects`)
        
        console.log(`💾 [DEBUG] Updating scraping run status to completed...`)
        
        // Označit run jako dokončený
        await prisma.scrapingRun.update({
          where: { id: runId },
          data: {
            status: 'completed',
            totalFound: prospects.length,
            totalProcessed: prospects.length,
            completedAt: new Date()
          }
        })
        
        console.log(`🎉 [DEBUG] Scraping run ${runId} completed successfully with ${prospects.length} prospects`)
        
      } catch (error) {
        console.error(`❌ [ERROR] Error in scraping run ${runId}:`, error)
        
        console.log(`💾 [DEBUG] Updating scraping run status to failed...`)
        
        // Označit run jako neúspěšný
        await prisma.scrapingRun.update({
          where: { id: runId },
          data: {
            status: 'failed',
            errors: JSON.stringify([error.message]),
            completedAt: new Date()
          }
        })
      }
    }, 1000) // 1 sekunda zpoždění
    
  } catch (importError) {
    console.error(`❌ [ERROR] Failed to import ScrapingOrchestrator:`, importError)
    
    // Označit run jako neúspěšný kvůli import chybě
    try {
      await prisma.scrapingRun.update({
        where: { id: runId },
        data: {
          status: 'failed',
          errors: JSON.stringify([`Import error: ${importError.message}`]),
          completedAt: new Date()
        }
      })
    } catch (dbError) {
      console.error('❌ [ERROR] Failed to update run status after import error:', dbError)
    }
  }
} 