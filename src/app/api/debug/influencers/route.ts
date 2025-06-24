import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG-INFLUENCERS] Načítám všechny influencery...')
    
    const influencers = await prisma.influencer.findMany({
      include: {
        socialNetworks: true,
        contentCategories: true,
        profile: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 [DEBUG-INFLUENCERS] Nalezeno ${influencers.length} influencerů`)
    
    influencers.forEach((influencer, index) => {
      console.log(`👤 [${index + 1}] ${influencer.name} (${influencer.email})`)
      console.log(`   - ID: ${influencer.id}`)
      console.log(`   - isActive: ${influencer.isActive}`)
      console.log(`   - isApproved: ${influencer.isApproved}`)
      console.log(`   - onboardingStatus: ${influencer.onboardingStatus}`)
      console.log(`   - commissionRate: ${influencer.commissionRate}`)
      console.log(`   - avatar: ${influencer.avatar || 'null'}`)
      console.log(`   - socialNetworks: ${influencer.socialNetworks.length}`)
      console.log(`   - contentCategories: ${influencer.contentCategories.length}`)
      console.log(`   - createdAt: ${influencer.createdAt}`)
      console.log('   ---')
    })

    // Ověřím také aplikace
    const applications = await prisma.influencerApplication.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📋 [DEBUG-APPLICATIONS] Nalezeno ${applications.length} aplikací`)
    
    applications.forEach((app, index) => {
      console.log(`📝 [${index + 1}] ${app.fullName} (${app.email})`)
      console.log(`   - ID: ${app.id}`)
      console.log(`   - status: ${app.status}`)
      console.log(`   - createdAt: ${app.createdAt}`)
      console.log('   ---')
    })

    return NextResponse.json({
      success: true,
      influencers: influencers.length,
      applications: applications.length,
      data: {
        influencers: influencers.map(inf => ({
          id: inf.id,
          name: inf.name,
          email: inf.email,
          isActive: inf.isActive,
          isApproved: inf.isApproved,
          onboardingStatus: inf.onboardingStatus,
          socialNetworks: inf.socialNetworks.length,
          contentCategories: inf.contentCategories.length,
          createdAt: inf.createdAt
        })),
        applications: applications.map(app => ({
          id: app.id,
          fullName: app.fullName,
          email: app.email,
          status: app.status,
          createdAt: app.createdAt
        }))
      }
    })
    
  } catch (error) {
    console.error('❌ [DEBUG-INFLUENCERS] Chyba:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 