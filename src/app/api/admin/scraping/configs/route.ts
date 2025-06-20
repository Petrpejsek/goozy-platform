import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - získat všechny konfigurace
export async function GET() {
  try {
    const configs = await prisma.scrapingConfig.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Parsování JSON polí
    const formattedConfigs = configs.map(config => ({
      ...config,
      countries: JSON.parse(config.countries),
      platforms: JSON.parse(config.platforms),
      hashtags: config.hashtags ? JSON.parse(config.hashtags) : [],
      keywords: config.keywords ? JSON.parse(config.keywords) : [],
      excludeKeywords: config.excludeKeywords ? JSON.parse(config.excludeKeywords) : []
    }))
    
    return NextResponse.json(formattedConfigs)
  } catch (error) {
    console.error('Error fetching configs:', error)
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 })
  }
}

// POST - vytvořit novou konfiguraci
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, countries, minFollowers, maxFollowers, targetCount, platforms, hashtags = [], keywords = [], excludeKeywords = [] } = body
    
    // Validace
    if (!name || !countries || !platforms || countries.length === 0 || platforms.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (targetCount && (targetCount < 2 || targetCount > 1000)) {
      return NextResponse.json({ error: 'Target count must be between 2 and 1000' }, { status: 400 })
    }
    
    const config = await prisma.scrapingConfig.create({
      data: {
        name,
        countries: JSON.stringify(countries),
        minFollowers,
        maxFollowers,
        targetCount: targetCount || 2,
        platforms: JSON.stringify(platforms),
        hashtags: JSON.stringify(hashtags),
        keywords: JSON.stringify(keywords),
        excludeKeywords: JSON.stringify(excludeKeywords)
      }
    })
    
    return NextResponse.json({
      ...config,
      countries: JSON.parse(config.countries),
      platforms: JSON.parse(config.platforms),
      hashtags: JSON.parse(config.hashtags),
      keywords: JSON.parse(config.keywords),
      excludeKeywords: JSON.parse(config.excludeKeywords)
    })
  } catch (error) {
    console.error('Error creating config:', error)
    return NextResponse.json({ error: 'Failed to create config' }, { status: 500 })
  }
}

// PUT - aktualizovat existující konfiguraci
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, countries, minFollowers, maxFollowers, targetCount, platforms, hashtags = [], keywords = [], excludeKeywords = [] } = body
    
    // Validace
    if (!id) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 })
    }
    
    if (!name || !countries || !platforms || countries.length === 0 || platforms.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (targetCount && (targetCount < 2 || targetCount > 1000)) {
      return NextResponse.json({ error: 'Target count must be between 2 and 1000' }, { status: 400 })
    }
    
    // Zkontrolujeme, zda konfigurace existuje
    const existingConfig = await prisma.scrapingConfig.findUnique({
      where: { id }
    })
    
    if (!existingConfig) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }
    
    const updatedConfig = await prisma.scrapingConfig.update({
      where: { id },
      data: {
        name,
        countries: JSON.stringify(countries),
        minFollowers,
        maxFollowers,
        targetCount: targetCount || 2,
        platforms: JSON.stringify(platforms),
        hashtags: JSON.stringify(hashtags),
        keywords: JSON.stringify(keywords),
        excludeKeywords: JSON.stringify(excludeKeywords)
      }
    })
    
    return NextResponse.json({
      ...updatedConfig,
      countries: JSON.parse(updatedConfig.countries),
      platforms: JSON.parse(updatedConfig.platforms),
      hashtags: JSON.parse(updatedConfig.hashtags),
      keywords: JSON.parse(updatedConfig.keywords),
      excludeKeywords: JSON.parse(updatedConfig.excludeKeywords)
    })
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const configId = searchParams.get('id')
    
    if (!configId) {
      return new Response('Configuration ID is required', { status: 400 })
    }

    // Zkontrolujeme, zda konfigurace existuje
    const config = await prisma.scrapingConfig.findUnique({
      where: { id: configId }
    })

    if (!config) {
      return new Response('Configuration not found', { status: 404 })
    }

    // Smažeme konfiguraci
    await prisma.scrapingConfig.delete({
      where: { id: configId }
    })

    return new Response('Configuration deleted successfully', { status: 200 })
  } catch (error) {
    console.error('Error deleting config:', error)
    return new Response('Internal server error', { status: 500 })
  }
} 