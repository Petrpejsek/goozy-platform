import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Debug campaigns and their slugs
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Analyzing campaign slugs...')
    
    // Get all campaigns
    const campaigns = await prisma.campaigns.findMany({
      include: {
        brands: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Debug: Found ${campaigns.length} total campaigns`)

    // Analyze slug status
    const analysisData = campaigns.map(campaign => ({
      id: campaign.id,
      slug: campaign.slug || 'MISSING',
      hasSlug: !!campaign.slug,
      name: campaign.name,
      status: campaign.status,
      brand: campaign.brands.name,
      influencerIds: campaign.influencerIds,
      createdAt: campaign.createdAt.toISOString(),
      // Generate what the new slug would be
      suggestedSlug: campaign.slug || `legacy-${campaign.id.slice(-8)}`
    }))

    const stats = {
      total: campaigns.length,
      withSlug: analysisData.filter(c => c.hasSlug).length,
      withoutSlug: analysisData.filter(c => !c.hasSlug).length,
      duplicateSlugs: findDuplicateSlugs(analysisData),
      slugFormats: analyzeSlugFormats(analysisData)
    }

    console.log('📊 Debug stats:', stats)

    return NextResponse.json({
      success: true,
      stats,
      campaigns: analysisData,
      recommendations: generateRecommendations(stats, analysisData)
    })

  } catch (error) {
    console.error('❌ Error debugging campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to debug campaigns' },
      { status: 500 }
    )
  }
}

function findDuplicateSlugs(campaigns: any[]): any[] {
  const slugCounts: Record<string, any[]> = {}
  
  campaigns.forEach(campaign => {
    if (campaign.slug && campaign.slug !== 'MISSING') {
      if (!slugCounts[campaign.slug]) {
        slugCounts[campaign.slug] = []
      }
      slugCounts[campaign.slug].push(campaign)
    }
  })
  
  return Object.entries(slugCounts)
    .filter(([slug, campaigns]) => campaigns.length > 1)
    .map(([slug, campaigns]) => ({ slug, campaigns }))
}

function analyzeSlugFormats(campaigns: any[]): any {
  const formats = {
    withTimestamp: 0,
    withRandom: 0,
    legacy: 0,
    missing: 0,
    custom: 0
  }
  
  campaigns.forEach(campaign => {
    if (!campaign.hasSlug) {
      formats.missing++
    } else if (campaign.slug === 'MISSING') {
      formats.missing++
    } else if (campaign.slug.startsWith('legacy-')) {
      formats.legacy++
    } else if (/\d{10}/.test(campaign.slug)) { // Unix timestamp
      formats.withTimestamp++
    } else if (/[a-f0-9]{6}/.test(campaign.slug)) { // Random hex
      formats.withRandom++
    } else {
      formats.custom++
    }
  })
  
  return formats
}

function generateRecommendations(stats: any, campaigns: any[]): string[] {
  const recommendations = []
  
  if (stats.withoutSlug > 0) {
    recommendations.push(`⚠️ ${stats.withoutSlug} campaigns are missing slugs and need migration`)
  }
  
  if (stats.duplicateSlugs.length > 0) {
    recommendations.push(`🚨 ${stats.duplicateSlugs.length} duplicate slugs found - CRITICAL ISSUE`)
  }
  
  if (stats.total === 0) {
    recommendations.push('ℹ️ No campaigns found - database appears empty')
  } else {
    recommendations.push(`✅ ${stats.withSlug} campaigns have proper slugs`)
  }
  
  return recommendations
} 