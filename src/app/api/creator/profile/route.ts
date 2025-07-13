import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 [PROFILE-UPDATE] Starting profile update...')
    
    // Ověřit autentifikaci
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [PROFILE-UPDATE] No valid auth header')
      return NextResponse.json({ error:  'No valid authentication token' }, { status:  401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')
      console.log('✅ [PROFILE-UPDATE] Token verified for:', decoded.email)
    } catch (error) {
      console.log('❌ [PROFILE-UPDATE] Invalid token:', error)
      return NextResponse.json({ error:  'Invalid token' }, { status:  401 })
    }

    if (!decoded.id || decoded.type !== 'influencer') {
      console.log('❌ [PROFILE-UPDATE] Invalid token type')
      return NextResponse.json({ error:  'Invalid token type' }, { status:  401 })
    }

    const body = await request.json()
    console.log('📋 [PROFILE-UPDATE] Received data:', JSON.stringify(body, null, 2))
    
    const { 
      name, 
      phone, 
      bio, 
      avatar
      profile, 
      socialNetworks, 
      contentCategories 
    } = body

    const influencerId = decoded.id

    // Aktualizovat základní údaje influencera
    console.log('🔄 [PROFILE-UPDATE] Updating basic influencer data...')
    const updatedInfluencer = await prisma.influencer.update({
      where: { id: influencerId }
      data: {
        name: name || undefined
        phone: phone || undefined
        bio: bio || undefined
        avatar: avatar || undefined
      }
    })
    console.log('✅ [PROFILE-UPDATE] Basic data updated')

    // Aktualizovat nebo vytvořit profil
    if (profile && (profile.age || profile.gender || profile.location)) {
      console.log('🔄 [PROFILE-UPDATE] Updating profile data...')
      await prisma.influencerProfile.upsert({
        where: { influencerId }
        update: {
          age: profile.age || null
          gender: profile.gender || null
          location: profile.location || null
        }
        create: {
          id: randomUUID()
          influencerId
          age: profile.age || null
          gender: profile.gender || null
          location: profile.location || null
          updatedAt: new Date()
        }
      })
      console.log('✅ [PROFILE-UPDATE] Profile data updated')
    }

    // Aktualizovat sociální sítě
    if (socialNetworks && Array.isArray(socialNetworks)) {
      console.log('🔄 [PROFILE-UPDATE] Updating social networks...')
      // Smazat existující sociální sítě
      await prisma.influencerSocial.deleteMany({
        where: { influencerId }
      })

      // Přidat nové sociální sítě
      if (socialNetworks.length > 0) {
        const generateSocialUrl = (platform: string, username: string) => {
          switch (platform) {
            case 'instagram':
              return `https://instagram.com/${username}`
            case 'tiktok':
              return `https://tiktok.com/@${username}`
            case 'youtube':
              return `https://youtube.com/@${username}`
            case 'linkedin':
              return `https://linkedin.com/in/${username}`
            case 'facebook':
              return `https://facebook.com/${username}`
            case 'twitter':
            case 'x':
              return `https://x.com/${username}`
            default:
              return `https://${platform}.com/${username}`
          }
        }

        await prisma.influencerSocial.createMany({
          data: socialNetworks.map(social => ({
            id: randomUUID()
            influencerId
            platform: social.platform
            username: social.username
            url: social.url || generateSocialUrl(social.platform, social.username)
            followers: social.followers || 0 // Default hodnota
          }))
        })
      }
      console.log('✅ [PROFILE-UPDATE] Social networks updated')
    }

    // Aktualizovat kategorie obsahu
    if (contentCategories && Array.isArray(contentCategories)) {
      console.log('🔄 [PROFILE-UPDATE] Updating content categories...')
      // Smazat existující kategorie
      await prisma.influencerCategory.deleteMany({
        where: { influencerId }
      })

      // Přidat nové kategorie
      if (contentCategories.length > 0) {
        await prisma.influencerCategory.createMany({
          data: contentCategories.map(category => ({
            id: randomUUID()
            influencerId
            category
          }))
        })
      }
      console.log('✅ [PROFILE-UPDATE] Content categories updated')
    }

    console.log(`✅ [PROFILE-UPDATE] Profile updated successfully for: ${updatedInfluencer.name}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    })

  } catch (error) {
    console.error('❌ [PROFILE-UPDATE] Error:', error)
    console.error('❌ [PROFILE-UPDATE] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error:  'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' }
      { status:  500 }
    )
  }
} 