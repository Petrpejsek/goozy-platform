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

    // Get all commissions for this influencer
    const commissions = await prisma.commissions.findMany({
      where: { influencerId },
      include: {
        orders: {
          include: {
            order_items: {
              include: {
                products: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate earnings data
    let totalEarnings = 0
    let totalSent = 0
    let pendingPayout = 0
    let thisMonthEarnings = 0
    let totalOrders = 0
    let orderValues: number[] = []

    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

    for (const commission of commissions) {
      const amount = parseFloat(commission.amount.toString())
      totalEarnings += amount

      if (commission.status === 'paid') {
        totalSent += amount
      } else if (commission.status === 'pending') {
        pendingPayout += amount
      }

      if (commission.createdAt >= startOfMonth) {
        thisMonthEarnings += amount
      }

      totalOrders++
      const orderValue = parseFloat(commission.orders.totalAmount.toString())
      orderValues.push(orderValue)
    }

    const averageOrderValue = orderValues.length > 0 ? 
      orderValues.reduce((sum, val) => sum + val, 0) / orderValues.length : 0

    // Get commission rate (simplified - using first commission or default)
    const commissionRate = commissions.length > 0 ? 
      parseFloat(commissions[0].rate.toString()) : 12.5

    // Get last payout date
    const lastPaidCommission = commissions.find(c => c.status === 'paid' && c.paidAt)
    const lastPayout = lastPaidCommission?.paidAt?.toISOString().split('T')[0] || null

    // Calculate next payout (simplified - last day of current month)
    const nextPayout = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      .toISOString().split('T')[0]

    const earnings = {
      totalEarnings,
      currentMonth: thisMonthEarnings,
      pendingPayout,
      totalSent,
      totalOrders,
      averageOrderValue,
      commissionRate,
      lastPayout,
      nextPayout
    }

    return NextResponse.json({ earnings })

  } catch (error) {
    console.error('Earnings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 