import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Schema pro validaci requestu
const ShippingCalculationSchema = z.object({
  items: z.array(z.object({
    productId: z.string()
    quantity: z.number().int().min(1).max(99)
  }))
  country: z.string().length(2), // ISO country code
  campaignSlug: z.string().optional()
})

// Helper function to check if country is in EU
function isEUCountry(country: string): boolean {
  const EU_COUNTRIES = [
    'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 
    'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 
    'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
  ]
  return EU_COUNTRIES.includes(country)
}

async function calculateShippingCostBySupplier(items: any[], country: string): Promise<{
  totalShippingCost: number
  supplierBreakdown: any[]
  freeShippingInfo: any[]
}> {
  console.log(`🚚 [SHIPPING-API] Calculating shipping for ${items.length} items to ${country}`)
  
  // Group items by supplier/brand
  const itemsBySupplier = new Map()
  
  for (const item of items) {
    const product = item.product
    const brandId = product.brand.id
    
    if (!itemsBySupplier.has(brandId)) {
      itemsBySupplier.set(brandId, {
        items: []
        subtotal: 0
        supplierName: product.brand.name
      })
    }
    
    const supplierGroup = itemsBySupplier.get(brandId)
    supplierGroup.items.push(item)
    supplierGroup.subtotal += product.price * item.quantity
  }
  
  let totalShippingCost = 0
  const supplierBreakdown = []
  const freeShippingInfo = []
  
  // Calculate shipping for each supplier
  for (const [brandId, supplierData] of itemsBySupplier) {
    console.log(`📦 [SHIPPING-API] Processing supplier ${brandId} with subtotal €${supplierData.subtotal}`)
    
    // Get supplier shipping settings
    const supplier = await prisma.supplier.findFirst({
      where: { brandId: brandId }
    })
    
    let supplierShippingCost = 0
    let shippingMethod = 'default'
    let freeShippingThreshold = null
    let amountToFreeShipping = null
    
    if (!supplier) {
      console.log(`⚠️ [SHIPPING-API] No supplier found for brand ${brandId}, using default rates`)
      // Fallback to default shipping
      const baseShipping = 4.99
      const distantCountries = ['EE', 'LV', 'LT', 'BG', 'RO']
      const extraFee = distantCountries.includes(country) ? 2.00 : 0
      
      freeShippingThreshold = 50
      if (supplierData.subtotal >= 50) {
        supplierShippingCost = 0
        shippingMethod = 'free_shipping'
      } else {
        supplierShippingCost = baseShipping + extraFee
        amountToFreeShipping = 50 - supplierData.subtotal
      }
    } else {
      // Check if supplier has API for real-time shipping costs
      if (supplier.has_shipping_api && supplier.shipping_api_endpoint) {
        console.log(`🔗 [SHIPPING-API] Using supplier API for real-time shipping costs`)
        shippingMethod = 'api'
        
        try {
          const apiResponse = await fetch(supplier.shipping_api_endpoint, {
            method: 'POST'
            headers: {
              'Content-Type': 'application/json'
              'Authorization': supplier.shipping_api_key ? `Bearer ${supplier.shipping_api_key}` : ''
            }
            body: JSON.stringify({
              items: supplierData.items.map((item: any) => ({
                productId: item.productId
                quantity: item.quantity
                price: item.product.price
              }))
              destination: {
                country: country
              }
              subtotal: supplierData.subtotal
            })
          })
          
          if (apiResponse.ok) {
            const apiResult = await apiResponse.json()
            supplierShippingCost = apiResult.shippingCost || 0
            console.log(`✅ [SHIPPING-API] API returned shipping cost: €${supplierShippingCost}`)
          } else {
            throw new Error(`API responded with status ${apiResponse.status}`)
          }
        } catch (error) {
          console.error(`❌ [SHIPPING-API] API call failed for supplier ${brandId}:`, error)
          // Fallback to manual settings
          shippingMethod = 'manual_fallback'
        }
      }
      
      // If API failed or not available, use manual settings
      if ((supplierShippingCost === 0 && !supplier.has_shipping_api) || shippingMethod === 'manual_fallback') {
        console.log(`📝 [SHIPPING-API] Using manual shipping settings`)
        shippingMethod = 'manual'
        
        freeShippingThreshold = supplier.shipping_free_threshold
        
        // Check free shipping threshold
        if (supplier.shipping_free_threshold && supplierData.subtotal >= supplier.shipping_free_threshold) {
          console.log(`🆓 [SHIPPING-API] Free shipping (above €${supplier.shipping_free_threshold})`)
          supplierShippingCost = 0
          shippingMethod = 'free_shipping'
        } else {
          if (supplier.shipping_free_threshold) {
            amountToFreeShipping = supplier.shipping_free_threshold - supplierData.subtotal
          }
          
          // Check if supplier has region-specific pricing
          if (supplier.shipping_regions) {
            try {
              const regions = supplier.shipping_regions as any
              if (regions[country]) {
                supplierShippingCost = regions[country]
                console.log(`🌍 [SHIPPING-API] Region-specific rate for ${country}: €${supplierShippingCost}`)
              } else if (regions['EU'] && isEUCountry(country)) {
                supplierShippingCost = regions['EU']
                console.log(`🇪🇺 [SHIPPING-API] EU rate: €${supplierShippingCost}`)
              } else if (regions['WORLD']) {
                supplierShippingCost = regions['WORLD']
                console.log(`🌎 [SHIPPING-API] World rate: €${supplierShippingCost}`)
              }
            } catch (error) {
              console.error(`❌ [SHIPPING-API] Error parsing shipping regions:`, error)
            }
          }
          
          // If no region-specific rate found, use flat rate
          if (supplierShippingCost === 0 && supplier.shipping_flat_rate) {
            supplierShippingCost = supplier.shipping_flat_rate
            console.log(`💰 [SHIPPING-API] Flat rate: €${supplierShippingCost}`)
          }
          
          // Ultimate fallback
          if (supplierShippingCost === 0) {
            supplierShippingCost = 4.99
            console.log(`⚠️ [SHIPPING-API] Using fallback rate: €${supplierShippingCost}`)
          }
        }
      }
    }
    
    totalShippingCost += supplierShippingCost
    
    // Store breakdown info
    supplierBreakdown.push({
      supplierId: brandId
      supplierName: supplierData.supplierName
      subtotal: Number(supplierData.subtotal.toFixed(2))
      shippingCost: Number(supplierShippingCost.toFixed(2))
      shippingMethod
      currency: supplier?.currency || 'EUR'
    })
    
    // Store free shipping info if applicable
    if (freeShippingThreshold && amountToFreeShipping && amountToFreeShipping > 0) {
      freeShippingInfo.push({
        supplierId: brandId
        supplierName: supplierData.supplierName
        freeShippingThreshold
        amountToFreeShipping: Number(amountToFreeShipping.toFixed(2))
        currentSubtotal: Number(supplierData.subtotal.toFixed(2))
      })
    }
    
    console.log(`📋 [SHIPPING-API] Supplier ${brandId} shipping cost: €${supplierShippingCost}`)
  }
  
  console.log(`💰 [SHIPPING-API] Total shipping cost: €${totalShippingCost}`)
  
  return {
    totalShippingCost: Number(totalShippingCost.toFixed(2))
    supplierBreakdown
    freeShippingInfo
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚚 [SHIPPING-API] Starting shipping calculation...')
    
    const body = await request.json()
    const validatedData = ShippingCalculationSchema.parse(body)
    
    const { items, country } = validatedData
    
    if (items.length === 0) {
      return NextResponse.json({
        success: false
        error: 'No items provided'
      }, { status:  400 })
    }

    // Fetch products from database
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
        isAvailable: true
      }
      include: {
        brand: {
          select: {
            id: true
            name: true
            isActive: true,
          }
        }
      }
    })

    if (products.length !== items.length) {
      return NextResponse.json({
        success: false
        error: 'Some products are not available'
      }, { status:  400 })
    }

    // Build items with product data
    const enrichedItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)
      return {
        ...item
        product
      }
    })

    // Calculate shipping
    const result = await calculateShippingCostBySupplier(enrichedItems, country)
    
    return NextResponse.json({
      success: true,
      shipping: {
        totalCost: result.totalShippingCost
        currency: 'EUR'
        breakdown: result.supplierBreakdown
        freeShippingOffers: result.freeShippingInfo
      }
    })

  } catch (error) {
    console.error('❌ [SHIPPING-API] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false
        error: 'Invalid shipping calculation data'
        details: error.errors
      }, { status:  400 })
    }

    return NextResponse.json({
      success: false
      error: 'Internal server error during shipping calculation'
    }, { status:  500 })
  } finally {
    await prisma.$disconnect()
  }
} 