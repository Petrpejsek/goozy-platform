import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Načteme všechny unikátní kategorie z dostupných produktů
    const categories = await prisma.product.findMany({
      where: {
        isAvailable: true,
        stockQuantity: {
          gt: 0
        }
      },
      select: {
        category: true
      },
      distinct: ['category']
    })

    // Spočítáme počet produktů v každé kategorii
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.product.count({
          where: {
            category: cat.category,
            isAvailable: true,
            stockQuantity: {
              gt: 0
            }
          }
        })
        
        return {
          name: cat.category,
          count
        }
      })
    )

    // Seřadíme podle počtu produktů
    categoriesWithCount.sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesWithCount
      }
    })

  } catch (error) {
    console.error('Chyba při načítání kategorií:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Nepodařilo se načíst kategorie' 
      },
      { status: 500 }
    )
  }
} 