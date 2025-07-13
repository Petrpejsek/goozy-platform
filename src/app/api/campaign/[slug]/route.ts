import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateCampaignSlug } from '@/lib/campaign-utils'

// GET - Fetch campaign by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    console.log('🔍 Fetching campaign with slug:', slug)
    
    // Validate slug format
    if (!validateCampaignSlug(slug)) {
      console.log('❌ Invalid slug format:', slug)
      return NextResponse.json(
        { success: false, error: 'Invalid campaign slug format' },
        { status: 400 }
      )
    }
    
    // Find campaign by slug
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      include: {
        brand: true
      }
    })
    
    if (!campaign) {
      console.log('❌ Campaign not found for slug:', slug)
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get influencer data from influencerIds
    let influencer = null
    if (campaign.influencerIds && campaign.influencerIds.length > 0) {
      // Extract first influencer ID (campaigns usually have one influencer)
      const influencerId = Array.isArray(campaign.influencerIds) 
        ? campaign.influencerIds[0] 
        : campaign.influencerIds
      
      console.log('🔍 Looking for influencer with ID:', influencerId)
      
      const influencerData = await prisma.influencer.findUnique({
        where: { id: influencerId }
      })
      
      if (influencerData) {
        influencer = {
          id: influencerData.id,
          name: influencerData.name,
          email: influencerData.email,
          avatar: influencerData.avatar || '/avatars/prague_fashionista_1750324937394.jpg',
          bio: influencerData.bio, // Bez mock fallback - použij jen skutečná data
          followers: '125K',
          instagram: null,
          tiktok: null,
          youtube: null,
          slug: influencerData.slug
        }
        console.log('✅ Found influencer:', influencerData.name)
      } else {
        console.log('❌ Influencer not found for ID:', influencerId)
      }
    }
    
    // Get products that the influencer has actually selected
    let products = []
    let productRecommendations = {} // Mapa productId -> recommendation
    
    if (influencer) {
      // First try to get influencer's selected products
      const influencerProducts = await prisma.influencerproducts.findMany({
        where: {
          influencerId: influencer.id,
          isActive: true
        },
        include: {
          products: true
        }
      })
      
      if (influencerProducts.length > 0) {
        console.log('✅ Found influencer selected products:', influencerProducts.length)
        
        // Extract products and build recommendations map
        products = influencerProducts
          .map(ip => ip.products)
          .filter(p => p !== null && p.isAvailable === true)
          
        // Build recommendations map
        influencerProducts.forEach(ip => {
          if (ip.products && ip.recommendation) {
            (productRecommendations as any)[ip.product.id] = ip.recommendation
          }
        })
        
        console.log('📝 Found recommendations for products:', Object.keys(productRecommendations).length)
      } else {
        console.log('⚠️ No selected products found, falling back to brand products')
        // Fallback to brand products if influencer hasn't selected any
        products = await prisma.product.findMany({
          where: {
            brandId: campaign.brandId,
            isAvailable: true
          },
          take: 10
        })
      }
    } else {
      // No influencer, get brand products
      products = await prisma.product.findMany({
        where: {
          brandId: campaign.brandId,
          isAvailable: true
        },
        take: 10
      })
    }
    
    // Helper function to parse sizes/colors safely
    const parseArrayField = (field: string | null) => {
      if (!field) return []
      
      try {
        // If it's already an array, return it
        if (Array.isArray(field)) return field
        
        // Try to parse as JSON first
        return JSON.parse(field)
      } catch {
        // If JSON parsing fails, treat as comma-separated string
        return field.split(',').map(item => item.trim()).filter(item => item.length > 0)
      }
    }

    console.log('✅ Campaign found:', campaign.id)
    console.log('✅ Found products:', products.length)
    console.log('✅ Influencer data:', influencer ? influencer.name : 'None')
    
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        slug: campaign.slug,
        name: campaign.name,
        description: campaign.description,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        status: campaign.status,
        isActive: campaign.isActive,
        brand: campaign.brand,
        expectedReach: campaign.expectedReach,
        budgetAllocated: campaign.budgetAllocated,
        currency: campaign.currency,
        influencerIds: campaign.influencerIds,
        targetCountries: campaign.targetCountries,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
        influencer: influencer,
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          discountedPrice: product.price * 0.8, // 20% discount
          images: parseArrayField(product.images),
          brand: product.brand_name || campaign.brand.name,
          category: product.category,
          sizes: parseArrayField(product.sizes),
          colors: parseArrayField(product.colors),
          recommendation: (productRecommendations as any)[product.id] || null // Přidáno recommendation
        }))
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching campaign by slug:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
} 