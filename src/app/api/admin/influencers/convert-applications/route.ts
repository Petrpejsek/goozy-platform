import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [CONVERT-APPLICATIONS] Převádím schválené aplikace na influencery...')
    
    // Najdi všechny schválené aplikace, které ještě nebyly převedeny
    const approvedApplications = await prisma.influencerApplication.findMany({
      where: {
        status: 'approved'
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`📋 Nalezeno ${approvedApplications.length} schválených aplikací`)

    if (approvedApplications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Žádné schválené aplikace k převodu',
        converted: 0
      })
    }

    const convertedInfluencers = []

    // Převeď každou aplikaci na influencer záznam
    for (const application of approvedApplications) {
      try {
        // Zkontroluj, jestli už influencer s tímto emailem neexistuje
        const existingInfluencer = await prisma.influencers.findUnique({
          where: { email: application.email }
        })

        if (existingInfluencer) {
          console.log(`⚠️  Influencer s emailem ${application.email} už existuje`)
          continue
        }

        console.log(`👤 Převádím aplikaci: ${application.name} (${application.email})`)

        // Vytvoř slug pro influencera
        const slug = application.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          + '-' + Math.random().toString(36).substring(2, 7)

        // Vytvoř nový influencer záznam
        const newInfluencer = await prisma.influencers.create({
          data: {
            id: Date.now().toString() + Math.random().toString(),
            name: application.name,
            email: application.email,
            password: application.password, // CRITICAL: Přenos hesla z aplikace!
            slug: slug,
            isActive: true,
            isApproved: true,
            onboardingStatus: 'completed',
            commissionRate: 0.1, // 10% základní komise
            avatar: null,
            bio: application.bio || null,
            updatedAt: new Date()
          }
        })

        // Vytvoř sociální sítě pro influencera  
        if (application.instagram) {
          await prisma.influencer_socials.create({
            data: {
              id: Date.now().toString() + Math.random().toString(),
              influencerId: newInfluencer.id,
              platform: 'instagram',
              username: application.instagram.replace('@', ''),
              url: `https://instagram.com/${application.instagram.replace('@', '')}`,
              followers: 10000, // Výchozí hodnota, bude aktualizována později
            }
          })
        }

        if (application.tiktok) {
          await prisma.influencer_socials.create({
            data: {
              id: Date.now().toString() + Math.random().toString(),
              influencerId: newInfluencer.id,
              platform: 'tiktok',
              username: application.tiktok.replace('@', ''),
              url: `https://tiktok.com/@${application.tiktok.replace('@', '')}`,
              followers: 10000, // Výchozí hodnota, bude aktualizována později
            }
          })
        }

        if (application.youtube) {
          await prisma.influencer_socials.create({
            data: {
              id: Date.now().toString() + Math.random().toString(),
              influencerId: newInfluencer.id,
              platform: 'youtube',
              username: application.youtube,
              url: application.youtube.includes('youtube.com') ? application.youtube : `https://youtube.com/${application.youtube}`,
              followers: 5000, // Výchozí hodnota, bude aktualizována později
            }
          })
        }

        if (application.facebook) {
          await prisma.influencer_socials.create({
            data: {
              id: Date.now().toString() + Math.random().toString(),
              influencerId: newInfluencer.id,
              platform: 'facebook',
              username: application.facebook,
              url: application.facebook.includes('facebook.com') ? application.facebook : `https://facebook.com/${application.facebook}`,
              followers: 5000, // Výchozí hodnota, bude aktualizována později
            }
          })
        }

        // Přidej content kategorie
        if (application.categories) {
          try {
            const categories = JSON.parse(application.categories)
            for (const category of categories) {
              await prisma.influencer_categories.create({
                data: {
                  id: Date.now().toString() + Math.random().toString(),
                  influencerId: newInfluencer.id,
                  category: category,
                }
              })
            }
          } catch (parseError) {
            console.log(`⚠️  Chyba při parsování kategorií pro ${application.email}:`, parseError)
            // Pokud parsing selže, přidáme alespoň jednu kategorii
            await prisma.influencer_categories.create({
              data: {
                id: Date.now().toString() + Math.random().toString(),
                influencerId: newInfluencer.id,
                category: 'lifestyle',
              }
            })
          }
        }

        // Změň status aplikace na 'converted'
        await prisma.influencerApplication.update({
          where: { id: application.id },
          data: { status: 'converted' }
        })

        convertedInfluencers.push({
          id: newInfluencer.id,
          name: newInfluencer.name,
          email: newInfluencer.email,
          originalApplicationId: application.id
        })

        console.log(`✅ Úspěšně převeden: ${newInfluencer.name}`)

      } catch (error) {
        console.error(`❌ Chyba při převodu aplikace ${application.email}:`, error)
      }
    }

    console.log(`🎉 Převedeno ${convertedInfluencers.length} influencerů`)

    return NextResponse.json({
      success: true,
      message: `Úspěšně převedeno ${convertedInfluencers.length} influencerů`,
      converted: convertedInfluencers.length,
      influencers: convertedInfluencers
    })
    
  } catch (error) {
    console.error('❌ [CONVERT-APPLICATIONS] Chyba:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 