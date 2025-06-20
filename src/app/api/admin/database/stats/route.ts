import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Získej statistiky z InfluencerDatabase
    const total = await prisma.influencerDatabase.count()
    const validated = await prisma.influencerDatabase.count({
      where: { isValidated: true }
    })
    const hasEmail = await prisma.influencerDatabase.count({
      where: { hasEmail: true }
    })

    // Získej posledních 20 influencerů
    const influencers = await prisma.influencerDatabase.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        username: true,
        country: true,
        totalFollowers: true,
        sourceHashtags: true,
        isValidated: true,
        hasEmail: true,
        createdAt: true
      }
    })

    const stats = { total, validated, hasEmail }

    return NextResponse.json({ 
      success: true, 
      stats,
      influencers: influencers.map(inf => ({
        ...inf,
        sourceHashtags: inf.sourceHashtags ? JSON.parse(inf.sourceHashtags) : []
      }))
    })

  } catch (error) {
    console.error('Error fetching database stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch database statistics' },
      { status: 500 }
    )
  }
} 