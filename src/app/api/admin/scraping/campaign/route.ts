import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { minFollowers, maxFollowers, keywords, excludeKeywords, targetCount } = await request.json()

    // Parsuj keywords
    const keywordsList = keywords ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : []
    const excludeKeywordsList = excludeKeywords ? excludeKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : []

    // Vyfiltruj influencery z InfluencerDatabase podle kritérií
    const filteredInfluencers = await prisma.influencerDatabase.findMany({
      where: {
        totalFollowers: {
          gte: minFollowers,
          lte: maxFollowers
        },
        isActive: true,
        // Pokud máme keywords, filtruj podle bio
        ...(keywordsList.length > 0 && {
          bio: {
            contains: keywordsList[0], // Zjednodušení - v reálné aplikaci by to bylo komplexnější
            mode: 'insensitive'
          }
        })
      },
      take: targetCount
    })

    // Vytvoř fake config pro campaign
    const fakeConfig = await prisma.scrapingConfig.create({
      data: {
        name: `Campaign ${new Date().toISOString()}`,
        countries: JSON.stringify(['CZ']),
        minFollowers: minFollowers,
        maxFollowers: maxFollowers,
        platforms: JSON.stringify(['instagram']),
        targetCount: targetCount,
        keywords: keywordsList.length > 0 ? JSON.stringify(keywordsList) : null,
        excludeKeywords: excludeKeywordsList.length > 0 ? JSON.stringify(excludeKeywordsList) : null
      }
    })

    // Vytvoř nový scraping run
    const scrapingRun = await prisma.scrapingRun.create({
      data: {
        configId: fakeConfig.id,
        status: 'running',
        totalFound: filteredInfluencers.length,
        totalProcessed: 0
      }
    })

    // Vytvoř prospects z filtrovaných influencerů
    let processedCount = 0
    
    for (const influencer of filteredInfluencers) {
      try {
        // Check if prospect already exists
        const existingProspect = await prisma.influencerProspect.findFirst({
          where: {
            OR: [
              { instagramUsername: influencer.instagramUsername },
              { instagramUrl: influencer.instagramUrl }
            ]
          }
        })

        if (!existingProspect) {
          await prisma.influencerProspect.create({
            data: {
              scrapingRunId: scrapingRun.id,
              name: influencer.name,
              bio: influencer.bio,
              avatar: influencer.avatar,
              country: influencer.country,
              instagramUsername: influencer.instagramUsername,
              instagramUrl: influencer.instagramUrl,
              instagramData: influencer.instagramData,
              totalFollowers: influencer.totalFollowers,
              status: 'pending'
            }
          })
          processedCount++
        }
      } catch (error) {
        console.error('Error creating prospect:', error)
      }
    }

    // Update scraping run
    await prisma.scrapingRun.update({
      where: { id: scrapingRun.id },
      data: {
        status: 'completed',
        totalProcessed: processedCount,
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Campaign scraping completed`,
      totalFiltered: filteredInfluencers.length,
      totalProcessed: processedCount,
      runId: scrapingRun.id,
      criteria: {
        minFollowers,
        maxFollowers,
        keywords: keywordsList,
        excludeKeywords: excludeKeywordsList
      }
    })

  } catch (error) {
    console.error('Error in campaign scraping:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to start campaign scraping' },
      { status: 500 }
    )
  }
} 