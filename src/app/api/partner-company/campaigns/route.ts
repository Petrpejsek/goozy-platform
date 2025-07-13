import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBrandAuth } from '@/lib/auth'

// GET - Načíst kampaně pro partner company
export async function GET() {
  try {
    console.log('📊 [PARTNER-CAMPAIGNS] Loading campaigns for partner company...')
    
    const user = await verifyBrandAuth()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Najít brand application - to je náš zdroj pravdy
    const brandApplication = await prisma.brandApplication.findUnique({
      where: { id: user.brandId }
    })

    if (!brandApplication) {
      return NextResponse.json({ error: 'Partner company not found' }, { status: 404 })
    }

    // Najít asociovaný brand v brands tabulce
    let brand = await prisma.brands.findFirst({
      where: { email: brandApplication.email }
    })

    // Pokud brand v brands tabulce neexistuje, vytvořme jeho záznam
    if (!brand) {
      brand = await prisma.brands.create({
        data: {
          id: `brand-${brandApplication.id}`,
          name: brandApplication.brandName,
          email: brandApplication.email,
          phone: brandApplication.phone,
          description: brandApplication.description,
          website: brandApplication.website,
          isApproved: true,
          isActive: true,
          targetCountries: '[]',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`✅ [CAMPAIGNS] Created new brand record for: ${brand.name}`)
    }

    // Načíst kampaně pro tento brand
    const campaigns = await prisma.campaigns.findMany({
      where: {
        brandId: brand.id,
        isActive: true
      },
      include: {
        brands: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 [CAMPAIGNS] Found ${campaigns.length} campaigns for brand: ${brand.name}`)

    // Připravit kampaně s dodatečnými daty
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        // Najít influencera pro tuto kampaň
        let influencer = null
        if (campaign.influencerIds) {
          influencer = await prisma.influencers.findFirst({
            where: { id: campaign.influencerIds },
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              slug: true,
              commissionRate: true
            }
          })
        }

        // Počet produktů v kampani (zatím přes všechny produkty brandu)
        const productCount = await prisma.products.count({
          where: {
            brandId: brand.id,
            isAvailable: true
          }
        })

        // Statistiky objednávek (zatím mock data - až budeme mít Order systém)
        const totalOrders = 0
        const totalRevenue = 0
        const conversionRate = 0

        // Parsovat target countries
        let targetCountries: string[] = []
        try {
          targetCountries = campaign.targetCountries ? JSON.parse(campaign.targetCountries) : []
        } catch (error) {
          targetCountries = []
        }

        return {
          id: campaign.id,
          slug: campaign.slug,
          name: campaign.name,
          description: campaign.description,
          startDate: campaign.startDate.toISOString(),
          endDate: campaign.endDate.toISOString(),
          status: campaign.status,
          expectedReach: campaign.expectedReach || 0,
          budgetAllocated: campaign.budgetAllocated || 0,
          currency: campaign.currency,
          targetCountries: targetCountries,
          createdAt: campaign.createdAt.toISOString(),
          influencer: influencer,
          stats: {
            productCount,
            totalOrders,
            totalRevenue,
            conversionRate
          }
        }
      })
    )

    // Spočítat celkové statistiky
    const totalActiveCampaigns = campaigns.filter(c => c.status === 'active').length
    const totalReach = campaigns.reduce((sum, c) => sum + (c.expectedReach || 0), 0)
    // Commission paid = pouze z skutečných prodejů (zatím 0, protože nejsou žádné objednávky)
    const totalCommissionPaid = 0

    const stats = {
      totalCampaigns: campaigns.length,
      activeCampaigns: totalActiveCampaigns,
      totalReach,
      totalCommissionPaid
    }

    console.log(`✅ [CAMPAIGNS] Loaded campaigns for: ${brand.name}`)
    
    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats,
      stats,
      brand: {
        id: brand.id,
        name: brand.name,
        email: brand.email
      }
    })

  } catch (error) {
    console.error('❌ [CAMPAIGNS] Error loading campaigns:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 