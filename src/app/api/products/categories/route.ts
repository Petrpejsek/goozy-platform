import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all unique categories from available products
    const categories = await prisma.product.findMany({
      where: {
        isAvailable: true
        stockQuantity: {
          gt: 0
        }
      }
      select: {
        category: true
      }
      distinct: ['category']
    })

    // Count products in each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.product.count({
          where: {
            category: cat.category
            isAvailable: true
            stockQuantity: {
              gt: 0
            }
          }
        })
        
        return {
          name: cat.category
          count
        }
      })
    )

    // Sort by product count
    categoriesWithCount.sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesWithCount
      }
    })

  } catch (error) {
    console.error('Error loading categories:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load categories' 
      }
      { status:  500 }
    )
  }
} 