import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // TEMPORARY: Skip token validation for testing
    const urlParams = new URL(req.url).searchParams
    const testMode = urlParams.get('test') === 'true'
    
    let influencerId = 'test-influencer-id'
    
    if (!testMode) {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 })
      }

      const token = authHeader.substring(7)
      let decoded: any

      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      influencerId = decoded.id

      // Get influencer to verify existence
      const influencer = await prisma.influencer.findUnique({
        where: { id: influencerId }
      })

      if (!influencer) {
        return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
      }
    }

    // Get all orders related to this influencer through discount codes
    const discountCodes = await prisma.discountCode.findMany({
      where: { influencerId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true
              }
            },
            commissions: true
          }
        }
      }
    })

    // Calculate analytics data
    let totalRevenue = 0
    let totalCommission = 0
    let totalReturns = 0
    let thisMonthRevenue = 0
    let thisMonthCommission = 0
    let thisMonthReturns = 0
    let campaignPerformance: any[] = []
    let productPerformance: any[] = []

    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

    // Process orders
    const allOrders = discountCodes.flatMap(code => code.orders)
    
    for (const order of allOrders) {
      const orderTotal = parseFloat(order.totalAmount.toString())
      const commission = (order.commissions as any)?.[0]?.amount || 0
      const returnAmount = order.status === 'returned' ? orderTotal : 0

      totalRevenue += orderTotal
      totalCommission += parseFloat(commission.toString())
      totalReturns += returnAmount

      // This month calculations
      if (order.createdAt >= startOfMonth) {
        thisMonthRevenue += orderTotal
        thisMonthCommission += parseFloat(commission.toString())
        thisMonthReturns += returnAmount
      }
    }

    // Get campaigns data
    const campaigns = await prisma.campaign.findMany({
      where: {
        influencerIds: {
          contains: influencerId
        }
      }
    })

    // Calculate campaign performance (simplified)
    for (const campaign of campaigns) {
      const campaignOrders = allOrders.filter(order => {
        // This is simplified - in real implementation you'd have better campaign-order linking
        return order.createdAt >= campaign.startDate && order.createdAt <= campaign.endDate
      })

      const campaignRevenue = campaignOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0)
      const campaignCommission = campaignOrders.reduce((sum, order) => {
        const commission = (order.commissions as any)?.[0]?.amount || 0
        return sum + parseFloat(commission.toString())
      }, 0)
      const campaignReturns = campaignOrders.filter(order => order.status === 'returned').reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0)

      campaignPerformance.push({
        id: campaign.id,
        name: campaign.name,
        totalRevenue: campaignRevenue,
        commission: campaignCommission,
        returns: campaignReturns,
        netEarnings: campaignCommission - (campaignReturns * 0.125), // Assuming 12.5% commission rate
        commissionRate: 12.5,
        returnRate: campaignRevenue > 0 ? (campaignReturns / campaignRevenue) * 100 : 0
      })
    }

    // Get product performance
    const products = await prisma.product.findMany({
      include: {
        orderItem: {
          include: {
            orders: {
              include: {
                discountCode: true,
                commissions: true
              }
            }
          }
        }
      }
    })

    for (const product of products) {
      const productOrders = product.orderItem.filter(item => 
        item.order.discountCode?.influencerId === influencerId
      )

      const productRevenue = productOrders.reduce((sum, item) => sum + (parseFloat(item.price.toString()) * item.quantity), 0)
      const productCommission = productOrders.reduce((sum, item) => {
        const commission = (item.order.commissions as any)?.[0]?.amount || 0
        return sum + parseFloat(commission.toString())
      }, 0)
      const productReturns = productOrders.filter(item => item.order.status === 'returned').reduce((sum, item) => sum + (parseFloat(item.price.toString()) * item.quantity), 0)

      if (productRevenue > 0) {
        productPerformance.push({
          id: product.id,
          name: product.name,
          totalRevenue: productRevenue,
          commission: productCommission,
          returns: productReturns,
          netEarnings: productCommission - (productReturns * 0.125),
          returnRate: (productReturns / productRevenue) * 100
        })
      }
    }

    // Sort by revenue
    campaignPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue)
    productPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue)

    const analytics = {
      totalRevenue,
      totalCommission,
      totalReturns,
      netEarnings: totalCommission - (totalReturns * 0.125),
      averageCommissionRate: 12.5,
      returnRate: totalRevenue > 0 ? (totalReturns / totalRevenue) * 100 : 0,
      topPerformingCampaign: campaignPerformance[0]?.name || 'No campaigns',
      topPerformingProduct: productPerformance[0]?.name || 'No products',
      thisMonthRevenue,
      thisMonthCommission,
      thisMonthReturns
    }

    return NextResponse.json({
      analytics,
      campaigns: campaignPerformance.slice(0, 10),
      products: productPerformance.slice(0, 10)
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 