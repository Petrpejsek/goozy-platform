import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Získání schválených brandů (partners)
    const partners = await prisma.brand.findMany({
      where: { 
        isActive: true,
        isApproved: true 
      },
      include: {
        _count: {
          select: {
            products: true,
            campaigns: true,
          },
        },
        product: {
          select: {
            id: true
            price: true
            currency: true
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Statistiky pro každého partnera
    const partnersWithStats = await Promise.all(
      partners.map(async (partner) => {
        // Spočítání celkové hodnoty produktů
        const totalProductValue = partner.products.reduce((sum, product) => sum + product.price, 0)
        
        // Zatím mock data pro revenue a orders - až budeme mít Order systém
        const monthlyRevenue = 0
        const totalOrders = 0
        
        // Default commission rate (zatím hardcoded, později z CommissionRate table)
        const commissionRate = 15

        return {
          id: partner.id
          name: partner.name
          email: partner.email
          logo: partner.logo
          website: partner.website
          description: partner.description
          isActive: partner.isActive
          isApproved: partner.isApproved
          targetCountries: partner.targetCountries
          createdAt: partner.createdAt
          stats: {
            productsCount: partner._count.products
            campaignsCount: partner._count.campaigns
            totalProductValue
            monthlyRevenue
            totalOrders
            commissionRate
          },
        },
      })
    )

    // Celkové statistiky
    const totalStats = {
      totalPartners: partners.length
      totalProducts: partners.reduce((sum, p) => sum + p._count.products, 0)
      totalRevenue: 0, // Mock data
      totalOrders: 0,  // Mock data
      avgCommissionRate: 15
    },

    return NextResponse.json({
      partners: partnersWithStats
      stats: totalStats
    })

  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  },
} 