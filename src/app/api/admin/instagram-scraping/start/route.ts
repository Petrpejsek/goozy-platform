import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface BatchConfig {
  country: string
  batchSize: number
  delayBetween: number
  maxRetries: number
  timeout: number
  onlyMissingData: boolean
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [DEBUG] POST /api/admin/instagram-scraping/start called')
    
    const batchConfig: BatchConfig = await request.json()
    console.log('🚀 [DEBUG] Batch config:', JSON.stringify(batchConfig, null, 2))

    // Validate batch config
    if (!batchConfig.country && batchConfig.country !== '') {
      return NextResponse.json({ error: 'Country filter is required' }, { status: 400 })
    }

    if (batchConfig.batchSize < 1 || batchConfig.batchSize > 100) {
      return NextResponse.json({ error: 'Batch size must be between 1 and 100' }, { status: 400 })
    }

    // Build filter for profiles to scrape
    const profileFilter: any = {
      isActive: true,
      instagramUsername: {
        not: null
      }
    }

    // Add country filter if specified
    if (batchConfig.country) {
      profileFilter.country = batchConfig.country
    }

    // Add missing data filter if requested
    if (batchConfig.onlyMissingData) {
      profileFilter.instagramData = null
    }

    console.log('🔍 [DEBUG] Profile filter:', JSON.stringify(profileFilter, null, 2))

    // Get profiles to scrape
    const profilesToScrape = await prisma.influencerDatabase.findMany({
      where: profileFilter,
      take: batchConfig.batchSize,
      select: {
        id: true,
        instagramUsername: true,
        country: true,
        name: true
      }
    })

    console.log(`📋 [DEBUG] Found ${profilesToScrape.length} profiles to scrape`)

    if (profilesToScrape.length === 0) {
      return NextResponse.json({ 
        error: 'No profiles found matching the criteria' 
      }, { status: 400 })
    }

    // Create a temporary config for this Instagram scraping run
    const config = await prisma.scrapingConfig.create({
      data: {
        name: `Instagram Scraping - ${batchConfig.country || 'All'} - ${new Date().toISOString()}`,
        countries: JSON.stringify(batchConfig.country ? [batchConfig.country] : []),
        platforms: JSON.stringify(['instagram']),
        minFollowers: 0, // No follower restrictions for existing profiles
        maxFollowers: 10000000,
        targetCount: profilesToScrape.length,
        isActive: true
      }
    })

    console.log('💾 [DEBUG] Created scraping config:', config.id)

    // Create scraping run
    const scrapingRun = await prisma.scrapingRun.create({
      data: {
        configId: config.id,
        type: 'instagram_scraping',
        sourceFilter: JSON.stringify({
          ...batchConfig,
          profileIds: profilesToScrape.map(p => p.id)
        }),
        status: 'running'
      }
    })

    console.log('💾 [DEBUG] Created scraping run:', scrapingRun.id)

    // Update config lastRunAt
    await prisma.scrapingConfig.update({
      where: { id: config.id },
      data: { lastRunAt: new Date() }
    })

    // Start the Instagram scraping process in background
    startInstagramScrapingProcess(scrapingRun.id, batchConfig, profilesToScrape)

    console.log('🎉 [DEBUG] Instagram scraping started successfully')

    return NextResponse.json({
      success: true,
      run: {
        id: scrapingRun.id,
        status: scrapingRun.status,
        totalProfiles: profilesToScrape.length
      },
      message: 'Instagram scraping started successfully'
    })

  } catch (error) {
    console.error('❌ [ERROR] Error starting Instagram scraping:', error)
    return NextResponse.json({ error: 'Failed to start Instagram scraping' }, { status: 500 })
  }
}

// Background Instagram scraping process
async function startInstagramScrapingProcess(
  runId: string, 
  batchConfig: BatchConfig, 
  profiles: Array<{id: string, instagramUsername: string | null, country: string | null, name: string}>
) {
  console.log(`🎬 [DEBUG] Starting Instagram scraping process for run ${runId}`)

  // Maximum runtime protection (30 minut)
  const maxRuntime = 30 * 60 * 1000 // 30 minut v milisekundách
  const startTime = Date.now()

  try {
    // Import Instagram scraper
    const { InstagramScraper } = await import('@/lib/scraping/instagram-scraper')
    
    const scraper = new InstagramScraper()
    await scraper.initialize()

    let successCount = 0
    let errorCount = 0
    let skippedCount = 0

    console.log(`🔧 [DEBUG] Processing ${profiles.length} profiles...`)

    for (let i = 0; i < profiles.length; i++) {
      // Check if maximum runtime exceeded
      if (Date.now() - startTime > maxRuntime) {
        console.log(`⏰ [WARNING] Maximum runtime (30 min) exceeded, stopping scraping...`)
        await scraper.close()
        
        // Mark run as partially completed
        await prisma.scrapingRun.update({
          where: { id: runId },
          data: {
            status: 'completed',
            totalFound: successCount,
            totalProcessed: i,
            completedAt: new Date(),
            errors: JSON.stringify([`Stopped after 30 minutes: processed ${i}/${profiles.length} profiles`])
          }
        })
        return
      }

      const profile = profiles[i]
      const username = profile.instagramUsername

      if (!username) {
        console.log(`⏭️ [DEBUG] Skipping profile ${profile.id}: no Instagram username`)
        skippedCount++
        continue
      }

      console.log(`👤 [DEBUG] Processing ${i + 1}/${profiles.length}: @${username}`)

      const attemptStartTime = Date.now()
      let attemptStatus = 'failed'
      let attemptError: string | undefined
      let scrapedData: string | undefined

      try {
        // Timeout pro jednotlivý profil (2 minuty)
        const profileTimeout = 2 * 60 * 1000 // 2 minuty
        
        const scrapePromise = scraper.scrapeProfile(username)
        const timeoutPromise = new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error('Profile scraping timeout (2 min)')), profileTimeout)
        })

        // Race between scraping and timeout
        const instagramProfile = await Promise.race([scrapePromise, timeoutPromise])

        if (instagramProfile) {
          attemptStatus = 'success'
          scrapedData = JSON.stringify(instagramProfile)
          successCount++

          // Update InfluencerDatabase with scraped data
          await prisma.influencerDatabase.update({
            where: { id: profile.id },
            data: {
              instagramData: scrapedData,
              totalFollowers: instagramProfile.followers,
              bio: instagramProfile.bio || undefined,
              lastScrapedAt: new Date()
            }
          })

          console.log(`✅ [DEBUG] Successfully scraped @${username}: ${instagramProfile.followers} followers`)
        } else {
          attemptStatus = 'not_found'
          attemptError = 'Profile data could not be retrieved'
          errorCount++
          
          console.log(`❌ [DEBUG] Failed to scrape @${username}: no data returned`)
        }

      } catch (error) {
        attemptStatus = 'failed'
        attemptError = error instanceof Error ? error.message : String(error)
        errorCount++
        
        console.error(`❌ [DEBUG] Error scraping @${username}:`, error)
        
        // Pokud je příliš mnoho chyb za sebou, restartuj browser
        if (errorCount % 5 === 0 && errorCount > 0) {
          console.log(`🔄 [DEBUG] Too many errors (${errorCount}), restarting browser...`)
          try {
            await scraper.close()
            await scraper.initialize()
            console.log(`✅ [DEBUG] Browser restarted successfully`)
          } catch (restartError) {
            console.error(`❌ [ERROR] Failed to restart browser:`, restartError)
          }
        }
      }

      // Save the scraping attempt
      await saveScrapingAttempt(runId, profile, attemptStatus, attemptError, scrapedData, Date.now() - attemptStartTime)

      // Update progress
      await updateProgress(runId, i + 1, profiles.length, successCount, errorCount, skippedCount)

      // Delay before next profile (except for last one)
      if (i < profiles.length - 1) {
        console.log(`⏰ [DEBUG] Waiting ${batchConfig.delayBetween}ms before next profile...`)
        await delay(batchConfig.delayBetween)
      }
    }

    // Close scraper
    await scraper.close()

    // Mark run as completed
    await prisma.scrapingRun.update({
      where: { id: runId },
      data: {
        status: 'completed',
        totalFound: successCount,
        totalProcessed: profiles.length,
        completedAt: new Date()
      }
    })

    console.log(`🎉 [DEBUG] Instagram scraping completed for run ${runId}`)
    console.log(`📊 [DEBUG] Results: ${successCount} success, ${errorCount} errors, ${skippedCount} skipped`)

  } catch (error) {
    console.error(`❌ [ERROR] Error in Instagram scraping process ${runId}:`, error)

    // Mark run as failed
    await prisma.scrapingRun.update({
      where: { id: runId },
      data: {
        status: 'failed',
        errors: JSON.stringify([error instanceof Error ? error.message : String(error)]),
        completedAt: new Date()
      }
    })
  }
}

// Helper functions
async function saveScrapingAttempt(
  runId: string,
  profile: {id: string, instagramUsername: string | null, country: string | null, name: string},
  status: string,
  errorMessage: string | undefined,
  scrapedData: string | undefined,
  duration: number
) {
  await prisma.scrapingAttempt.create({
    data: {
      scrapingRunId: runId,
      targetProfileId: profile.id,
      platform: 'instagram',
      username: profile.instagramUsername || '',
      profileUrl: profile.instagramUsername ? `https://www.instagram.com/${profile.instagramUsername}/` : undefined,
      country: profile.country,
      status,
      errorMessage,
      scrapedData,
      duration
    }
  })
}

async function updateProgress(
  runId: string,
  processed: number,
  total: number,
  successCount: number,
  errorCount: number,
  skippedCount: number
) {
  await prisma.scrapingRun.update({
    where: { id: runId },
    data: {
      totalProcessed: processed,
      totalFound: successCount
    }
  })
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
} 