import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [FIX-PASSWORDS] Opravuji hesla pro existující influencery...')
    
    // Najdi všechny influencery bez hesla
    const influencersWithoutPassword = await prisma.influencers.findMany({
      where: {
        password: null
      }
    })

    console.log(`🔍 Nalezeno ${influencersWithoutPassword.length} influencerů bez hesla`)

    if (influencersWithoutPassword.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Všichni influenceři mají hesla',
        fixed: 0
      })
    }

    const fixedInfluencers = []

    for (const influencer of influencersWithoutPassword) {
      try {
        // Najdi původní aplikaci podle emailu
        const originalApplication = await prisma.influencerApplication.findFirst({
          where: {
            email: influencer.email,
            status: 'converted'
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        if (!originalApplication) {
          console.log(`⚠️  Nenalezena původní aplikace pro ${influencer.email}`)
          continue
        }

        if (!originalApplication.password) {
          console.log(`⚠️  Původní aplikace pro ${influencer.email} nemá heslo`)
          continue
        }

        // Aktualizuj influencer s heslem z aplikace
        await prisma.influencers.update({
          where: { id: influencer.id },
          data: { password: originalApplication.password }
        })

        fixedInfluencers.push({
          id: influencer.id,
          name: influencer.name,
          email: influencer.email
        })

        console.log(`✅ Opraveno heslo pro: ${influencer.name} (${influencer.email})`)

      } catch (error) {
        console.error(`❌ Chyba při opravě hesla pro ${influencer.email}:`, error)
      }
    }

    console.log(`🎉 Opraveno heslo pro ${fixedInfluencers.length} influencerů`)

    return NextResponse.json({
      success: true,
      message: `Úspěšně opraveno heslo pro ${fixedInfluencers.length} influencerů`,
      fixed: fixedInfluencers.length,
      influencers: fixedInfluencers
    })
    
  } catch (error) {
    console.error('❌ [FIX-PASSWORDS] Chyba:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 