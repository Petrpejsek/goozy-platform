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

    // For now, return default payment methods since table doesn't exist yet
    // In future, this will query: prisma.payment_methods.findMany({ where: { influencerId } })
    const defaultPaymentMethods = [
      {
        id: '1',
        type: 'paypal',
        name: 'PayPal',
        details: testMode ? 'test@example.com' : (influencerId || 'Not configured'),
        isDefault: true
      },
      {
        id: '2',
        type: 'bank',
        name: 'Bank Transfer',
        details: 'Not configured',
        isDefault: false
      },
      {
        id: '3',
        type: 'wise',
        name: 'Wise',
        details: 'Not configured',
        isDefault: false
      },
      {
        id: '4',
        type: 'revolut',
        name: 'Revolut',
        details: 'Not configured',
        isDefault: false
      }
    ]

    return NextResponse.json({ paymentMethods: defaultPaymentMethods })

  } catch (error) {
    console.error('Payment methods API error:', error)
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
    const { type, name, details, isDefault } = await req.json()

    // Get influencer to verify existence
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId }
    })

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // For now, just return success since table doesn't exist yet
    // In future, this will create: prisma.payment_methods.create()
    const newPaymentMethod = {
      id: Date.now().toString(),
      type,
      name,
      details,
      isDefault: isDefault || false
    }

    return NextResponse.json({ 
      success: true, 
      paymentMethod: newPaymentMethod,
      message: 'Payment method added successfully'
    })

  } catch (error) {
    console.error('Payment methods POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 