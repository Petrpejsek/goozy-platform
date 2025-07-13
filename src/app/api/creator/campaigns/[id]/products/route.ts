import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

// GET - Get products for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    
    console.log('🔍 [DEBUG-JWT-GET] Token received:', token ? 'Present' : 'Missing')
    console.log('🔍 [DEBUG-JWT-GET] Secret being used:', secret ? 'Present' : 'Missing')
    
    let influencerId: string
    try {
      const decoded = jwt.verify(token, secret) as { id: string, influencerId?: string, userId?: string, type: string }
      console.log('🔍 [DEBUG-JWT-GET] Decoded token:', decoded)
      console.log('🔍 [DEBUG-JWT-GET] Available keys in decoded:', Object.keys(decoded))
      
      // Support multiple possible field names for backward compatibility
      influencerId = (decoded.id || decoded.influencerId || decoded.userId) as string
      console.log('🔍 [DEBUG-JWT-GET] Extracted influencerId:', influencerId)
      
      if (!influencerId || decoded.type !== 'influencer') {
        throw new Error('Invalid token structure')
      }
    } catch (error) {
      console.log('❌ [DEBUG-JWT-GET] JWT verification failed:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Find campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if influencer owns this campaign
    console.log('🔍 [DEBUG-PRODUCTS-GET] Checking campaign ownership:')
    console.log('  Campaign influencerIds:', campaign.influencerIds, typeof campaign.influencerIds)
    console.log('  Current influencerId:', influencerId, typeof influencerId)
    console.log('  Are they equal?:', campaign.influencerIds === influencerId)
    
    if (campaign.influencerIds !== influencerId) {
      console.log('❌ [DEBUG-PRODUCTS-GET] Ownership check failed!')
      return NextResponse.json(
        { success: false, error: 'Access denied - not your campaign' },
        { status: 403 }
      )
    }

    // Get products selected for this influencer
    const influencerProducts = await prisma.influencerProduct.findMany({
      where: {
        influencerId: influencerId,
        isActive: true
      },
      include: {
        product: {
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        }
      }
    })

    const products = influencerProducts.map(ip => ({
      id: ip.product.id,
      name: ip.product.name,
      description: ip.product.description,
      price: ip.product.price,
      currency: ip.product.currency,
      images: ip.product.images,
      category: ip.product.category,
      sizes: ip.product.sizes,
      colors: ip.product.colors,
      sku: ip.product.sku,
      stockQuantity: ip.product.stockQuantity,
      brand: ip.product.brand,
      recommendation: ip.recommendation
    }))

    console.log('✅ Campaign products retrieved:', id, products.length)

    return NextResponse.json({
      success: true,
      products: products
    })

  } catch (error) {
    console.error('❌ Error getting campaign products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get campaign products' },
      { status: 500 }
    )
  }
}

// POST - Update products for a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { productIds } = await request.json()
    
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    
    console.log('🔍 [DEBUG-JWT-POST] Token received:', token ? 'Present' : 'Missing')
    console.log('🔍 [DEBUG-JWT-POST] Secret being used:', secret ? 'Present' : 'Missing')
    
    let influencerId: string
    try {
      const decoded = jwt.verify(token, secret) as { id: string, influencerId?: string, userId?: string, type: string }
      console.log('🔍 [DEBUG-JWT-POST] Decoded token:', decoded)
      console.log('🔍 [DEBUG-JWT-POST] Available keys in decoded:', Object.keys(decoded))
      
      // Support multiple possible field names for backward compatibility
      influencerId = (decoded.id || decoded.influencerId || decoded.userId) as string
      console.log('🔍 [DEBUG-JWT-POST] Extracted influencerId:', influencerId)
      
      if (!influencerId || decoded.type !== 'influencer') {
        throw new Error('Invalid token structure')
      }
    } catch (error) {
      console.log('❌ [DEBUG-JWT-POST] JWT verification failed:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Validate input
    if (!Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, error: 'Product IDs must be an array' },
        { status: 400 }
      )
    }

    // Find campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if influencer owns this campaign
    console.log('🔍 [DEBUG-PRODUCTS-POST] Checking campaign ownership:')
    console.log('  Campaign influencerIds:', campaign.influencerIds, typeof campaign.influencerIds)
    console.log('  Current influencerId:', influencerId, typeof influencerId)
    console.log('  Are they equal?:', campaign.influencerIds === influencerId)
    
    if (campaign.influencerIds !== influencerId) {
      console.log('❌ [DEBUG-PRODUCTS-POST] Ownership check failed!')
      return NextResponse.json(
        { success: false, error: 'Access denied - not your campaign' },
        { status: 403 }
      )
    }

    // Note: We allow editing products even for active campaigns
    // This gives influencers flexibility to adjust their product selection during the campaign
    console.log('✅ [DEBUG-PRODUCTS-POST] Campaign ownership verified, proceeding with update')

    console.log('🔄 Updating campaign products:', id, productIds.length)

    // Remove all current selections for this influencer
    await prisma.influencerProduct.deleteMany({
      where: {
        influencerId: influencerId
      }
    })

    // Add new selections
    if (productIds.length > 0) {
      const newSelections = productIds.map((productId: string) => ({
        id: randomUUID(),
        influencerId: influencerId,
        productId: productId,
        isActive: true,
        addedAt: new Date()
      }))

      await prisma.influencerProduct.createMany({
        data: newSelections
      })
    }

    console.log('✅ Campaign products updated successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Campaign products updated successfully',
      productCount: productIds.length
    })

  } catch (error) {
    console.error('❌ Error updating campaign products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign products' },
      { status: 500 }
    )
  }
} 