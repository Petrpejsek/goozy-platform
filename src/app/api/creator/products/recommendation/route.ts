import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { influencerId, productId, recommendation } = await request.json()

    // Validace vstupních dat
    if (!influencerId || !productId) {
      return NextResponse.json(
        { success: false, error: 'Missing influencerId or productId' },
        { status: 400 }
      )
    }

    // Validace délky doporučení
    if (recommendation && recommendation.length > 300) {
      return NextResponse.json(
        { success: false, error: 'Recommendation must be 300 characters or less' },
        { status: 400 }
      )
    }

    // Najdi nebo vytvoř záznam InfluencerProduct
    const influencerProduct = await prisma.influencerProduct.upsert({
      where: {
        influencerId_productId: {
          influencerId,
          productId
        }
      },
      update: {
        recommendation: recommendation || null
      },
      create: {
        id: randomUUID(),
        influencerId,
        productId,
        recommendation: recommendation || null,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: influencerProduct
    })

  } catch (error) {
    console.error('Error saving recommendation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save recommendation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get('influencerId')
    const productId = searchParams.get('productId')

    if (!influencerId || !productId) {
      return NextResponse.json(
        { success: false, error: 'Missing influencerId or productId' },
        { status: 400 }
      )
    }

    const influencerProduct = await prisma.influencerproducts.findUnique({
      where: {
        influencerId_productId: {
          influencerId,
          productId
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        recommendation: influencerProduct?.recommendation || null
      }
    })

  } catch (error) {
    console.error('Error fetching recommendation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendation' },
      { status: 500 }
    )
  }
} 