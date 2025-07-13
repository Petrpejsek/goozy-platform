import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

// GET - get selected products for influencer
export async function GET(request: NextRequest) {
  try {
    // Get authentication from Authorization header first, then cookies as fallback
    let token: string | undefined
    
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else {
      // Fallback to cookies
      token = request.cookies.get('influencer-auth')?.value
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let influencerId: string

    try {
      // Try to decode JWT token first
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any
      influencerId = decoded.userId || decoded.influencerId || decoded.id
      
      // Verify influencer exists in influencers table
      const influencer = await prisma.influencer.findUnique({
        where: { id: influencerId },
        select: { id: true, name: true }
      })
      
      if (!influencer) {
        throw new Error('Influencer not found')
      }
      
      console.log('✅ [PRODUCTS-GET] Token authentication successful for:', influencer.name)
    } catch (jwtError) {
      // Fallback: try to find influencer by email (base64 encoded in cookie)
      try {
        const email = Buffer.from(token, 'base64').toString('utf-8')
        const influencerData = await prisma.influencer.findUnique({
          where: { email },
          select: { id: true, name: true }
        })
        if (!influencerData?.id) {
          throw new Error('Influencer not found by email')
        }
        influencerId = influencerData.id
        console.log('✅ [PRODUCTS-GET] Fallback authentication successful for:', email)
      } catch (fallbackError) {
        return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
      }
    }

    // Get selected products
    const selectedProducts = await prisma.influencer_products.findMany({
      where: {
        influencerId: influencerId,
        isActive: true
      },
      include: {
        products: {
          include: {
            brands: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        }
      },
      orderBy: {
        addedAt: 'desc'
      }
    })

    // Transform data for frontend
    const products = selectedProducts.map(sp => ({
      ...sp.products,
      images: JSON.parse(sp.products.images || '[]'),
      sizes: JSON.parse(sp.products.sizes || '[]'),
      colors: JSON.parse(sp.products.colors || '[]'),
      brand: sp.products.brands,
      addedAt: sp.addedAt
    }))

    return NextResponse.json({
      products,
      count: products.length
    })

  } catch (error) {
    console.error('Error loading selected products:', error)
    return NextResponse.json({ error: 'Failed to load selected products' }, { status: 500 })
  }
}

// POST - add/remove products from selection
export async function POST(request: NextRequest) {
  try {
    // Get authentication from Authorization header first, then cookies as fallback
    let token: string | undefined
    
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else {
      // Fallback to cookies
      token = request.cookies.get('influencer-auth')?.value
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let influencerId: string

    try {
      // Try to decode JWT token first
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any
      influencerId = decoded.userId || decoded.influencerId || decoded.id
      
      // Verify influencer exists in influencers table
      const influencer = await prisma.influencer.findUnique({
        where: { id: influencerId },
        select: { id: true, name: true }
      })
      
      if (!influencer) {
        throw new Error('Influencer not found')
      }
      
      console.log('✅ [PRODUCTS-POST] Token authentication successful for:', influencer.name)
    } catch (jwtError) {
      // Fallback: try to find influencer by email (base64 encoded in cookie)
      try {
        const email = Buffer.from(token, 'base64').toString('utf-8')
        const influencerData = await prisma.influencer.findUnique({
          where: { email },
          select: { id: true, name: true }
        })
        if (!influencerData?.id) {
          throw new Error('Influencer not found by email')
        }
        influencerId = influencerData.id
        console.log('✅ [PRODUCTS-POST] Fallback authentication successful for:', email)
      } catch (fallbackError) {
        return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
      }
    }

    const requestBody = await request.json()
    console.log('📋 [PRODUCTS-POST] Request body:', requestBody)
    
    const { productIds, action } = requestBody

    console.log('📋 [PRODUCTS-POST] Extracted data:', { productIds, action, productIdsType: typeof productIds, isArray: Array.isArray(productIds) })

    if (!Array.isArray(productIds) || !action) {
      console.log('❌ [PRODUCTS-POST] Invalid data validation failed:', { productIds, action })
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    if (action === 'add') {
      // Add products to selection (or reactivate)
      for (const productId of productIds) {
        // First try to find existing record
        const existing = await prisma.influencer_products.findFirst({
          where: {
            influencerId: influencerId,
            productId: productId
          }
        })

        if (existing) {
          // Update existing
          await prisma.influencer_products.update({
            where: { id: existing.id },
            data: {
              isActive: true,
              addedAt: new Date()
            }
                      })
        } else {
          // Create new
          await prisma.influencer_products.create({
            data: {
              id: randomUUID(),
              influencerId: influencerId,
              productId: productId,
              isActive: true
            }
          })
        }
      }

      return NextResponse.json({ 
        message: `${productIds.length} products added to selection`,
        action: 'add',
        count: productIds.length
      })

    } else if (action === 'remove') {
      // Remove products from selection (deactivate)
      await prisma.influencer_products.updateMany({
        where: {
          influencerId: influencerId,
          productId: {
            in: productIds
          }
        },
        data: {
          isActive: false
        }
      })

      return NextResponse.json({ 
        message: `${productIds.length} products removed from selection`,
        action: 'remove',
        count: productIds.length
      })

    } else if (action === 'set') {
      // Set complete selection (overwrite current selection)
      
      // 1. Deactivate all current selections
      await prisma.influencer_products.updateMany({
        where: {
          influencerId: influencerId,
          isActive: true
        },
        data: {
          isActive: false
        }
      })

      // 2. Activate new products
      for (const productId of productIds) {
        // First try to find existing record
        const existing = await prisma.influencer_products.findFirst({
          where: {
            influencerId: influencerId,
            productId: productId
          }
        })

        if (existing) {
          // Update existing
          await prisma.influencer_products.update({
            where: { id: existing.id },
            data: {
              isActive: true,
              addedAt: new Date()
            }
                      })
        } else {
          // Create new
          await prisma.influencer_products.create({
            data: {
              id: randomUUID(),
              influencerId: influencerId,
              productId: productId,
              isActive: true
            }
          })
        }
      }

      return NextResponse.json({ 
        message: `Selection updated - ${productIds.length} products`,
        action: 'set',
        count: productIds.length
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ [PRODUCTS-POST] Error updating product selection:', error)
    console.error('❌ [PRODUCTS-POST] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    })
    return NextResponse.json({ error: 'Failed to update product selection' }, { status: 500 })
  }
}

// DELETE - delete all selected products
export async function DELETE(request: NextRequest) {
  try {
    // Get authentication from Authorization header first, then cookies as fallback
    let token: string | undefined
    
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else {
      // Fallback to cookies
      token = request.cookies.get('influencer-auth')?.value
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let influencerId: string

    try {
      // Try to decode JWT token first
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any
      influencerId = decoded.userId || decoded.influencerId || decoded.id
      
      // Verify influencer exists in influencers table
      const influencer = await prisma.influencer.findUnique({
        where: { id: influencerId },
        select: { id: true, name: true }
      })
      
      if (!influencer) {
        throw new Error('Influencer not found')
      }
      
      console.log('✅ [PRODUCTS-DELETE] Token authentication successful for:', influencer.name)
    } catch (jwtError) {
      // Fallback: try to find influencer by email (base64 encoded in cookie)
      try {
        const email = Buffer.from(token, 'base64').toString('utf-8')
        const influencerData = await prisma.influencer.findUnique({
          where: { email },
          select: { id: true, name: true }
        })
        if (!influencerData?.id) {
          throw new Error('Influencer not found by email')
        }
        influencerId = influencerData.id
        console.log('✅ [PRODUCTS-DELETE] Fallback authentication successful for:', email)
      } catch (fallbackError) {
        return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
      }
    }

    // Deactivate all selected products
    const result = await prisma.influencer_products.updateMany({
      where: {
        influencerId: influencerId,
        isActive: true
      },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({ 
      message: `All products removed from selection`,
      count: result.count
    })

  } catch (error) {
    console.error('Error deleting product selection:', error)
    return NextResponse.json({ error: 'Failed to delete product selection' }, { status: 500 })
  }
}