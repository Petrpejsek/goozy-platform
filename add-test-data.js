const { PrismaClient } = require('./src/generated/prisma')

const prisma = new PrismaClient()

async function addTestData() {
  try {
    console.log('🚀 Přidávám testovací data do databáze...')

    // Přidáme testovací influencery do Czech Republic
    const testInfluencers = [
      {
        username: 'prague_fashionista',
        instagramUsername: 'prague_fashionista',
        name: 'Anna Nováková',
        bio: 'Fashion blogger from Prague 🇨🇿 ✨',
        location: 'Prague, Czech Republic',
        country: 'CZ',
        totalFollowers: 15420,
        engagementRate: 3.2,
        isActive: true,
        avatar: '/avatars/prague_fashionista_1750324937394.jpg',
        instagramUrl: 'https://instagram.com/prague_fashionista'
      },
      {
        username: 'brno_lifestyle',
        instagramUsername: 'brno_lifestyle',
        name: 'Tomáš Svoboda',
        bio: 'Lifestyle content creator from Brno',
        location: 'Brno, Czech Republic',
        country: 'CZ',
        totalFollowers: 8750,
        engagementRate: 4.1,
        isActive: true,
        instagramUrl: 'https://instagram.com/brno_lifestyle'
      },
      {
        username: 'czech_beauty_guru',
        instagramUsername: 'czech_beauty_guru',
        name: 'Klára Horáková',
        bio: 'Beauty & makeup tips 💄',
        location: 'Prague, Czech Republic',
        country: 'CZ',
        totalFollowers: 22100,
        engagementRate: 2.8,
        isActive: true,
        instagramUrl: 'https://instagram.com/czech_beauty_guru'
      },
      {
        username: 'ostrava_fitness',
        instagramUsername: 'ostrava_fitness',
        name: 'Jakub Dvořák',
        bio: 'Fitness trainer & nutrition coach 💪',
        location: 'Ostrava, Czech Republic',
        country: 'CZ',
        totalFollowers: 12300,
        engagementRate: 3.7,
        isActive: true,
        instagramUrl: 'https://instagram.com/ostrava_fitness'
      },
      {
        username: 'prague_foodie',
        instagramUsername: 'prague_foodie',
        name: 'Marie Procházková',
        bio: 'Food blogger exploring Prague restaurants 🍽️',
        location: 'Prague, Czech Republic',
        country: 'CZ',
        totalFollowers: 18900,
        engagementRate: 3.5,
        isActive: true,
        instagramUrl: 'https://instagram.com/prague_foodie'
      }
    ]

    for (const influencer of testInfluencers) {
      await prisma.influencerDatabase.upsert({
        where: { instagramUsername: influencer.instagramUsername },
        update: influencer,
        create: influencer
      })
      console.log(`✅ Přidán influencer: ${influencer.instagramUsername}`)
    }

    console.log('🎉 Testovací data byla úspěšně přidána!')
    
    // Zobrazíme počet záznamů
    const count = await prisma.influencerDatabase.count()
    console.log(`📊 Celkem influencerů v databázi: ${count}`)

  } catch (error) {
    console.error('❌ Chyba při přidávání testovacích dat:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestData() 