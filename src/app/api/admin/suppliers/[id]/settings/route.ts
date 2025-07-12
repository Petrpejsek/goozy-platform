import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const body = await request.json()

    // Validace vstupních dat
    const {
      has_shipping_api,
      shipping_api_endpoint,
      shipping_api_key,
      shipping_flat_rate,
      shipping_free_threshold,
      shipping_regions,
      return_policy_days,
      return_policy_conditions,
      return_policy_cost,
      return_address,
      return_instructions,
      currency,
      vat_included
    } = body

    // Ověř, že dodavatel existuje
    const existingSupplier = await prisma.suppliers.findUnique({
      where: { id: id }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Dodavatel nenalezen' },
        { status: 404 }
      )
    }

    // Validace dat
    if (has_shipping_api && !shipping_api_endpoint) {
      return NextResponse.json(
        { error: 'API endpoint je povinný když je zapnuté API' },
        { status: 400 }
      )
    }

    if (return_policy_days && (return_policy_days < 0 || return_policy_days > 365)) {
      return NextResponse.json(
        { error: 'Počet dní na vrácení musí být mezi 0 a 365' },
        { status: 400 }
      )
    }

    if (return_policy_cost && !['customer', 'supplier', 'shared'].includes(return_policy_cost)) {
      return NextResponse.json(
        { error: 'Neplatná hodnota pro return_policy_cost' },
        { status: 400 }
      )
    }

    // Aktualizace dodavatele
    const updatedSupplier = await prisma.suppliers.update({
      where: { id: id },
      data: {
        // Shipping API settings
        has_shipping_api: Boolean(has_shipping_api),
        shipping_api_endpoint: has_shipping_api ? shipping_api_endpoint : null,
        shipping_api_key: has_shipping_api ? shipping_api_key : null,
        
        // Manual shipping settings
        shipping_flat_rate: shipping_flat_rate ? parseFloat(shipping_flat_rate) : null,
        shipping_free_threshold: shipping_free_threshold ? parseFloat(shipping_free_threshold) : null,
        shipping_regions: shipping_regions || null,
        
        // Return policy
        return_policy_days: return_policy_days ? parseInt(return_policy_days) : 14,
        return_policy_conditions: return_policy_conditions || null,
        return_policy_cost: return_policy_cost || 'customer',
        return_address: return_address || null,
        return_instructions: return_instructions || null,
        
        // Other settings
        currency: currency || 'EUR',
        vat_included: vat_included !== false,
        
        updatedAt: new Date()
      },
      include: {
        brands: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Nastavení úspěšně aktualizováno',
      supplier: updatedSupplier
    })

  } catch (error) {
    console.error('Error updating supplier settings:', error)
    
    if (error instanceof Error) {
      // Prisma validation errors
      if (error.message.includes('Invalid JSON')) {
        return NextResponse.json(
          { error: 'Neplatný JSON formát v shipping regions' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Chyba při aktualizaci nastavení' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 