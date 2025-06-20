import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const prospectId = resolvedParams.id
    
    // Najít prospect
    const prospect = await prisma.influencerProspect.findUnique({
      where: { id: prospectId }
    })
    
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }
    
    if (prospect.status !== 'pending') {
      return NextResponse.json({ error: 'Prospect already processed' }, { status: 400 })
    }
    
    // Vytvořit nového influencera z prospectu
    const influencerData = {
      email: prospect.email || `${prospect.name.toLowerCase().replace(/\s+/g, '.')}@temp.com`,
      name: prospect.name,
      slug: generateSlug(prospect.name),
      bio: prospect.bio,
      avatar: prospect.avatar,
      commissionRate: 0.1 // 10% základní provize
    }
    
    // Zkontrolovat duplicity podle emailu nebo slugu
    const existingInfluencer = await prisma.influencer.findFirst({
      where: {
        OR: [
          { email: influencerData.email },
          { slug: influencerData.slug }
        ]
      }
    })
    
    if (existingInfluencer) {
      // Označit jako duplikát
      await prisma.influencerProspect.update({
        where: { id: prospectId },
        data: {
          status: 'duplicate',
          duplicateOf: existingInfluencer.id,
          notes: `Duplicate of existing influencer: ${existingInfluencer.name} (${existingInfluencer.email})`
        }
      })
      
      return NextResponse.json({ 
        error: 'Duplicate influencer found',
        existingInfluencer: {
          id: existingInfluencer.id,
          name: existingInfluencer.name,
          email: existingInfluencer.email
        }
      }, { status: 400 })
    }
    
    // Vytvořit nového influencera
    const newInfluencer = await prisma.influencer.create({
      data: influencerData
    })
    
    // Přidat sociální sítě na základě scrapovaných dat
    if (prospect.instagramData) {
      const instagramData = JSON.parse(prospect.instagramData)
      await prisma.influencerSocial.create({
        data: {
          influencerId: newInfluencer.id,
          platform: 'instagram',
          username: instagramData.username,
          followers: instagramData.followers,
          url: `https://instagram.com/${instagramData.username}`
        }
      })
    }
    
    if (prospect.tiktokData) {
      const tiktokData = JSON.parse(prospect.tiktokData)
      await prisma.influencerSocial.create({
        data: {
          influencerId: newInfluencer.id,
          platform: 'tiktok',
          username: tiktokData.username,
          followers: tiktokData.followers,
          url: `https://tiktok.com/@${tiktokData.username}`
        }
      })
    }
    
    if (prospect.youtubeData) {
      const youtubeData = JSON.parse(prospect.youtubeData)
      await prisma.influencerSocial.create({
        data: {
          influencerId: newInfluencer.id,
          platform: 'youtube',
          username: youtubeData.username,
          followers: youtubeData.subscribers,
          url: youtubeData.url
        }
      })
    }
    
    // Označit prospect jako schválený
    await prisma.influencerProspect.update({
      where: { id: prospectId },
      data: {
        status: 'approved',
        notes: `Converted to influencer: ${newInfluencer.id}`
      }
    })
    
    return NextResponse.json({ 
      success: true,
      influencer: newInfluencer,
      message: 'Prospect approved and converted to influencer'
    })
    
  } catch (error) {
    console.error('Error approving prospect:', error)
    return NextResponse.json({ error: 'Failed to approve prospect' }, { status: 500 })
  }
}

// Pomocná funkce pro generování slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Odstranit speciální znaky
    .replace(/\s+/g, '-') // Nahradit mezery pomlčkami
    .replace(/-+/g, '-') // Sloučit vícenásobné pomlčky
    .trim()
} 