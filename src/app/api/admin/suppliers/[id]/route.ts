import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            name: true
          }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Dodavatel nenalezen' },
        { status: 404 }
      )
    }

    const supplierData = {
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      website: supplier.website,
      isActive: supplier.isActive,
      brandId: supplier.brandId,
      brand: {
        name: supplier.brand.name
      },
      // Shipping settings
      shipping_api_endpoint: supplier.shipping_api_endpoint,
      shipping_api_key: supplier.shipping_api_key,
      has_shipping_api: supplier.has_shipping_api,
      shipping_flat_rate: supplier.shipping_flat_rate,
      shipping_free_threshold: supplier.shipping_free_threshold,
      shipping_regions: supplier.shipping_regions,
      shipping_rules: supplier.shipping_rules,
      // Return policy
      return_policy_days: supplier.return_policy_days,
      return_policy_conditions: supplier.return_policy_conditions,
      return_policy_cost: supplier.return_policy_cost,
      return_address: supplier.return_address,
      return_instructions: supplier.return_instructions,
      // Other
      currency: supplier.currency,
      vat_included: supplier.vat_included,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    }

    return NextResponse.json(supplierData)
  } catch (error) {
    console.error('Error loading supplier:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání dodavatele' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 