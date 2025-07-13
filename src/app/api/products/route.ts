import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where condition
    const where: any = {
      isAvailable: true
      stockQuantity: {
        gt: 0
      }
    }

    if (category) {
      where.category = category
    }

    // Load products with brand information
    const products = await prisma.product.findMany({
      where
      include: {
        brand: {
          select: {
            id: true
            name: true
            logo: true
          }
        }
      }
      orderBy: {
        createdAt: 'desc'
      }
      take: limit
      skip: offset
    })

    // Count total products
    const totalCount = await prisma.product.count({ where })

    // Transform data for frontend
    const transformedProducts = products.map(product => ({
      id: product.id
      name: product.name
      description: product.description
      price: product.price
      currency: product.currency
      images: JSON.parse(product.images || '[]')
      category: product.category
      sizes: product.sizes ? (product.sizes.startsWith('[') ? JSON.parse(product.sizes) : product.sizes.split(',').map(s => s.trim())) : []
      colors: product.colors ? (product.colors.startsWith('[') ? JSON.parse(product.colors) : product.colors.split(',').map(s => s.trim())) : []
      sku: product.sku
      stockQuantity: product.stockQuantity
      brand: product.brands
      createdAt: product.createdAt
    }))

    return NextResponse.json({
      success: true
      data: {
        product: transformedProducts
        pagination: {
          total: totalCount
          limit
          offset
          hasMore: offset + limit < totalCount
        }
      }
    })

  } catch (error) {
    console.error('Error loading product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load products' 
      }
      { status: 500 }
    )
  }
} 