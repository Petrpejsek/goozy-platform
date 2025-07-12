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
      const influencer = await prisma.influencers.findUnique({
        where: { id: influencerId }
      })

      if (!influencer) {
        return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
      }
    }

    // For now, return empty withdrawal history since table doesn't exist yet
    // In future, this will query: prisma.withdrawals.findMany({ where: { influencerId } })
    const withdrawalHistory: any[] = []

    return NextResponse.json({ withdrawals: withdrawalHistory })

  } catch (error) {
    console.error('Withdrawals API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const influencerId = decoded.id
    const { amount, paymentMethodId } = await req.json()

    // Get influencer to verify existence
    const influencer = await prisma.influencers.findUnique({
      where: { id: influencerId }
    })

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Get current earnings to check availability
    const commissions = await prisma.commissions.findMany({
      where: { influencerId }
    })

    const totalEarnings = commissions.reduce((sum, commission) => {
      return sum + parseFloat(commission.amount.toString())
    }, 0)

    const totalSent = commissions.filter(c => c.status === 'paid').reduce((sum, commission) => {
      return sum + parseFloat(commission.amount.toString())
    }, 0)

    const availableBalance = totalEarnings - totalSent

    if (amount > availableBalance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // For now, just return success since table doesn't exist yet
    // In future, this will create: prisma.withdrawals.create()
    const newWithdrawal = {
      id: Date.now().toString(),
      amount,
      paymentMethodId,
      status: 'pending',
      transactionId: null,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      withdrawal: newWithdrawal,
      message: 'Withdrawal request submitted successfully'
    })

  } catch (error) {
    console.error('Withdrawals POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 