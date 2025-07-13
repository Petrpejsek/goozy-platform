import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        brand: {
          select: {
            name: true
          }
        }
      }
      orderBy: {
        name: 'asc'
      }
    })

    // Transformace dat pro frontend
    const suppliersData = suppliers.map(supplier => ({
      id: supplier.id
      name: supplier.name
      email: supplier.email
      phone: supplier.phone
      website: supplier.website
      isActive: supplier.isActive
      brandId: supplier.brandId
      brand: {
        name: supplier.brand.name
      }
      // Shipping settings
      has_shipping_api: supplier.has_shipping_api
      shipping_free_threshold: supplier.shipping_free_threshold
      shipping_flat_rate: supplier.shipping_flat_rate
      shipping_regions: supplier.shipping_regions
      // Return policy
      return_policy_days: supplier.return_policy_days
      return_policy_cost: supplier.return_policy_cost
      return_policy_conditions: supplier.return_policy_conditions
      return_address: supplier.return_address
      return_instructions: supplier.return_instructions
      // Other
      currency: supplier.currency
      vat_included: supplier.vat_included
    }))

    return NextResponse.json(suppliersData)
  } catch (error) {
    console.error('Error loading suppliers:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání dodavatelů' }
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 