import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, CacheKeys } from '@/lib/cache'

interface RequestBody {
  urls: string[]
  country: string
  foundBy?: string // Volitelný parametr pro označení zdroje
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Import request body:', body)
    
    const { urls, country, foundBy = 'google-search' }: RequestBody = body

    if (!Array.isArray(urls) || urls.length === 0) {
      console.error('Invalid urls:', urls)
      return NextResponse.json({ error: 'urls array required' }, { status: 400 })
    }

    if (!country) {
      console.error('Missing country:', country)
      return NextResponse.json({ error: 'country required' }, { status: 400 })
    }

    // KROK 1: Extrakce a deduplikace usernames z URLs
    const processedUrls: Array<{ url: string; username: string }> = []
    const seenUsernames = new Set<string>()
    const duplicatesSkipped: string[] = []

    console.log(`Processing ${urls.length} URLs for deduplication...`)

    for (const url of urls) {
      const match = url.match(/instagram\.com\/([^\/\?]+)/)
      if (!match) {
        console.warn('Invalid Instagram URL:', url)
        continue
      }
      
      const username = match[1].toLowerCase() // Normalizace na lowercase
      
      // Přeskočit duplicity v rámci této dávky
      if (seenUsernames.has(username)) {
        duplicatesSkipped.push(username)
        console.log(`Skipping duplicate in batch: ${username}`)
        continue
      }
      
      seenUsernames.add(username)
      processedUrls.push({ url, username })
    }

    console.log(`After deduplication: ${processedUrls.length} unique profiles (skipped ${duplicatesSkipped.length} batch duplicates)`)

    // KROK 2: Zkontrolovat, které profily už existují v databázi
    const existingProfiles = await prisma.influencerDatabase.findMany({
      where: {
        instagramUsername: {
          in: Array.from(seenUsernames)
        }
      },
      select: {
        instagramUsername: true,
        country: true,
        id: true
      }
    })

    const existingUsernames = new Set(existingProfiles.map(p => p.instagramUsername.toLowerCase()))
    console.log(`Found ${existingProfiles.length} profiles already in database`)

    // KROK 3: Rozdělení na nové a existující profily
    const newProfiles: Array<{ url: string; username: string }> = []
    const existingToUpdate: Array<{ url: string; username: string; existingProfile: any }> = []

    for (const { url, username } of processedUrls) {
      const existingProfile = existingProfiles.find(p => p.instagramUsername.toLowerCase() === username)
      
      if (existingProfile) {
        // Profil existuje - rozhodnout zda aktualizovat
        if (existingProfile.country !== country) {
          console.log(`Updating country for ${username}: ${existingProfile.country} → ${country}`)
          existingToUpdate.push({ url, username, existingProfile })
        } else {
          console.log(`Skipping existing profile with same country: ${username}`)
        }
      } else {
        // Nový profil
        newProfiles.push({ url, username })
      }
    }

    console.log(`New profiles to create: ${newProfiles.length}`)
    console.log(`Existing profiles to update: ${existingToUpdate.length}`)

    // KROK 4: Bulk operace pro lepší výkon
    const inserted: string[] = []
    const updated: string[] = []

    // Vytvořit nové profily
    if (newProfiles.length > 0) {
      const createData = newProfiles.map(({ url, username }) => ({
        name: username,
        username: username,
        instagramUsername: username,
        instagramUrl: url,
        country,
        foundBy: foundBy,
        isActive: true,
        totalFollowers: 0
      }))

      try {
        await prisma.influencerDatabase.createMany({
          data: createData,
          skipDuplicates: true // Extra pojistka proti duplicitám
        })
        inserted.push(...newProfiles.map(p => p.username))
        console.log(`Successfully created ${newProfiles.length} new profiles`)
      } catch (error) {
        console.error('Error creating profiles:', error)
        // Fallback na individuální vkládání při chybě
        for (const { url, username } of newProfiles) {
          try {
            await prisma.influencerDatabase.create({
              data: {
                name: username,
                username: username,
                instagramUsername: username,
                instagramUrl: url,
                country,
                foundBy: foundBy,
                isActive: true,
                totalFollowers: 0
              }
            })
            inserted.push(username)
          } catch (individualError) {
            console.error(`Failed to create profile ${username}:`, individualError)
          }
        }
      }
    }

    // Aktualizovat existující profily
    for (const { username, existingProfile } of existingToUpdate) {
      try {
        await prisma.influencerDatabase.update({
          where: { id: existingProfile.id },
          data: {
            country,
            updatedAt: new Date()
          }
        })
        updated.push(username)
      } catch (error) {
        console.error(`Failed to update profile ${username}:`, error)
      }
    }

    // KROK 5: Invalidace cache po úspěšném importu
    if (inserted.length > 0 || updated.length > 0) {
      // Vymazat cache pro tuto zemi, aby se nová data načetla
      console.log('Invalidating cache for country:', country)
      cache.delete(CacheKeys.countryProfiles(country))
      cache.delete(CacheKeys.lastUpdate(country))
      cache.delete(CacheKeys.countryMeta(country))
    }

    console.log(`Successfully processed ${urls.length} URLs:`)
    console.log(`- Batch duplicates skipped: ${duplicatesSkipped.length}`)
    console.log(`- New profiles created: ${inserted.length}`)
    console.log(`- Existing profiles updated: ${updated.length}`)
    console.log(`- Database duplicates skipped: ${processedUrls.length - inserted.length - updated.length}`)

    return NextResponse.json({ 
      success: true, 
      processedUrls: urls.length,
      batchDuplicatesSkipped: duplicatesSkipped.length,
      newProfilesCreated: inserted.length,
      existingProfilesUpdated: updated.length,
      databaseDuplicatesSkipped: processedUrls.length - inserted.length - updated.length,
      insertedUsernames: inserted,
      updatedUsernames: updated,
      duplicatesSkipped: duplicatesSkipped
    })
  } catch (err) {
    console.error('Import error', err)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
} 