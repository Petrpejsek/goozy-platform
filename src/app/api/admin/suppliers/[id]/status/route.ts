import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive musí být boolean hodnota' },
        { status: 400 }
      )
    }

    // Ověř, že dodavatel existuje
    const existingSupplier = await prisma.suppliers.findUnique({
      where: { id: params.id }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Dodavatel nenalezen' },
        { status: 404 }
      )
    }

    // Aktualizace stavu
    const updatedSupplier = await prisma.suppliers.update({
      where: { id: params.id },
      data: {
        isActive: isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Dodavatel ${isActive ? 'aktivován' : 'deaktivován'}`,
      supplier: {
        id: updatedSupplier.id,
        isActive: updatedSupplier.isActive
      }
    })

  } catch (error) {
    console.error('Error updating supplier status:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci stavu dodavatele' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 