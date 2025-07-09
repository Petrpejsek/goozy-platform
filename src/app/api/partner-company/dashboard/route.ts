import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBrandAuth } from '@/lib/auth'

// GET - Načíst dashboard metrics pro partner company
export async function GET() {
  try {
    console.log('📊 [DASHBOARD] Loading partner company dashboard metrics...')
    
    const user = await verifyBrandAuth()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Najít brand application - to je náš zdroj pravdy
    const brandApplication = await prisma.brand_applications.findUnique({
      where: { id: user.brandId }
    })

    if (!brandApplication) {
      return NextResponse.json({ error: 'Partner company not found' }, { status: 404 })
    }

    // Najít asociovaný brand v brands tabulce (pokud existuje)
    let brand = await prisma.brands.findFirst({
      where: { email: brandApplication.email },
      include: {
        campaigns: {
          where: { isActive: true }
        },
        products: true,
        _count: {
          select: {
            campaigns: true,
            products: true
          }
        }
      }
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
          targetCountries: '[]', // Zatím prázdné, nastavit se dá v settings
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          campaigns: {
            where: { isActive: true }
          },
          products: true,
          _count: {
            select: {
              campaigns: true,
              products: true
            }
          }
        }
      })
      console.log(`✅ [DASHBOARD] Created new brand record for: ${brand.name}`)
    }

    // Parsovat target countries z JSON stringu
    let activeCountries: string[] = []
    try {
      activeCountries = brand.targetCountries ? JSON.parse(brand.targetCountries) : []
    } catch (error) {
      console.log('❌ [DASHBOARD] Error parsing target countries:', error)
      activeCountries = []
    }

    // Vypočítat metriky
    const activeCampaigns = brand.campaigns.filter(c => c.status === 'active').length
    const upcomingCampaigns = brand.campaigns.filter(c => {
      const startDate = new Date(c.startDate)
      const now = new Date()
      return c.status === 'draft' && startDate > now
    }).length

    // TODO: Až budeme mít Order systém, nahradíme tyto mock hodnoty
    const todaysRevenue = 0
    const totalOrders = 0

    const metrics = {
      activeCampaigns,
      upcomingCampaigns,
      todaysRevenue,
      totalOrders,
      activeCountries
    }

    // Zatím prázdná data pro charts - až budeme mít Order systém
    const salesData: Array<{date: string, sales: number, orders: number}> = []
    const topProducts: Array<{name: string, sales: number, orders: number, revenue: string}> = []
    const recentCampaigns = brand.campaigns.slice(0, 5).map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate.toISOString(),
      status: campaign.status,
      expectedReach: campaign.expectedReach || 0,
      influencerIds: campaign.influencerIds ? [campaign.influencerIds] : []
    }))

    console.log(`✅ [DASHBOARD] Metrics loaded for: ${brand.name}`)
    console.log('📊 [DASHBOARD] Active countries:', activeCountries)
    
    return NextResponse.json({
      success: true,
      metrics,
      salesData,
      topProducts,
      recentCampaigns,
      brand: {
        id: brand.id,
        name: brand.name,
        email: brand.email,
        totalProducts: brand._count.products,
        totalCampaigns: brand._count.campaigns
      }
    })

  } catch (error) {
    console.error('❌ [DASHBOARD] Error loading metrics:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 