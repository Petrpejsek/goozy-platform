import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - získání vybraných produktů influencera
export async function GET(request: NextRequest) {
  try {
    // Ověření autentizace
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Neplatná autentizace' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const applicationId = decoded.id // ID z influencer_applications

    // Získání vybraných produktů
    const selectedProducts = await prisma.influencerProduct.findMany({
      where: {
        influencerId: applicationId,
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
      },
      orderBy: {
        addedAt: 'desc'
      }
    })

    // Transformace dat pro frontend
    const products = selectedProducts.map(sp => ({
      ...sp.product,
      images: JSON.parse(sp.product.images),
      sizes: JSON.parse(sp.product.sizes),
      colors: JSON.parse(sp.product.colors),
      addedAt: sp.addedAt
    }))

    return NextResponse.json({
      products,
      count: products.length
    })

  } catch (error) {
    console.error('Chyba při načítání vybraných produktů:', error)
    return NextResponse.json({ error: 'Nepodařilo se načíst vybrané produkty' }, { status: 500 })
  }
}

// POST - přidání/odebrání produktů z výběru
export async function POST(request: NextRequest) {
  try {
    // Ověření autentizace
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Neplatná autentizace' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const applicationId = decoded.id // ID z influencer_applications

    const { productIds, action } = await request.json()

    if (!Array.isArray(productIds) || !action) {
      return NextResponse.json({ error: 'Neplatná data' }, { status: 400 })
    }

    if (action === 'add') {
      // Přidání produktů do výběru (nebo reaktivace)
      for (const productId of productIds) {
        await prisma.influencerProduct.upsert({
          where: {
            influencerId_productId: {
              influencerId: applicationId,
              productId: productId
            }
          },
          update: {
            isActive: true,
            addedAt: new Date()
          },
          create: {
            influencerId: applicationId,
            productId: productId,
            isActive: true
          }
        })
      }

      return NextResponse.json({ 
        message: `${productIds.length} produktů přidáno do výběru`,
        action: 'add',
        count: productIds.length
      })

    } else if (action === 'remove') {
      // Odebrání produktů z výběru (deaktivace)
      await prisma.influencerProduct.updateMany({
        where: {
          influencerId: applicationId,
          productId: {
            in: productIds
          }
        },
        data: {
          isActive: false
        }
      })

      return NextResponse.json({ 
        message: `${productIds.length} produktů odebráno z výběru`,
        action: 'remove',
        count: productIds.length
      })

    } else if (action === 'set') {
      // Nastavení celého výběru (přepíše současný výběr)
      
      // 1. Deaktivace všech současných výběrů
      await prisma.influencerProduct.updateMany({
        where: {
          influencerId: applicationId,
          isActive: true
        },
        data: {
          isActive: false
        }
      })

      // 2. Aktivace nových produktů
      for (const productId of productIds) {
        await prisma.influencerProduct.upsert({
          where: {
            influencerId_productId: {
              influencerId: applicationId,
              productId: productId
            }
          },
          update: {
            isActive: true,
            addedAt: new Date()
          },
          create: {
            influencerId: applicationId,
            productId: productId,
            isActive: true
          }
        })
      }

      return NextResponse.json({ 
        message: `Výběr aktualizován - ${productIds.length} produktů`,
        action: 'set',
        count: productIds.length
      })

    } else {
      return NextResponse.json({ error: 'Neplatná akce' }, { status: 400 })
    }

  } catch (error) {
    console.error('Chyba při aktualizaci výběru produktů:', error)
    return NextResponse.json({ error: 'Nepodařilo se aktualizovat výběr produktů' }, { status: 500 })
  }
}

// DELETE - vymazání všech vybraných produktů
export async function DELETE(request: NextRequest) {
  try {
    // Ověření autentizace
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Neplatná autentizace' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const applicationId = decoded.id // ID z influencer_applications

    // Deaktivace všech vybraných produktů
    const result = await prisma.influencerProduct.updateMany({
      where: {
        influencerId: applicationId,
        isActive: true
      },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({ 
      message: `Všechny produkty odebrány z výběru`,
      count: result.count
    })

  } catch (error) {
    console.error('Chyba při mazání výběru produktů:', error)
    return NextResponse.json({ error: 'Nepodařilo se vymazat výběr produktů' }, { status: 500 })
  }
} 