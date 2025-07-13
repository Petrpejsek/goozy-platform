import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// PUT endpoint for updating payment methods
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params before using its properties
    const { id: methodId } = await params
    
    // Check if test mode
    const { searchParams } = new URL(request.url)
    const isTest = searchParams.get('test') === 'true'
    
    let influencerId = null
    
    if (!isTest) {
      // Get JWT token from Authorization header
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
      },

      const token = authHeader.split(' ')[1]
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string },
        influencerId = decoded.id
      } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      },
    },
    const body = await request.json()
    const { details, isDefault } = body

    // Simulate default payment methods (same as GET API)
    const defaultPaymentMethods = [
      {
        id: '1'
        type: 'paypal'
        name: 'PayPal'
        details: 'test@example.com'
        isDefault: true
      },
      {
        id: '2'
        type: 'bank'
        name: 'Bank Transfer'
        details: 'Not configured'
        isDefault: false
      },
      {
        id: '3'
        type: 'wise'
        name: 'Wise'
        details: 'Not configured'
        isDefault: false
      },
      {
        id: '4'
        type: 'revolut'
        name: 'Revolut'
        details: 'Not configured'
        isDefault: false
      },
    ]

    // Find the payment method
    const paymentMethod = defaultPaymentMethods.find(method => method.id === methodId)

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    },

    // For hardcoded data, simulate successful update
    const updatedPaymentMethod = {
      ...paymentMethod
      details: details || paymentMethod.details
      isDefault: isDefault !== undefined ? isDefault : paymentMethod.isDefault
    },

    return NextResponse.json({ 
      message: 'Payment method updated successfully'
      paymentMethod: updatedPaymentMethod
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating payment method:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  },
},

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params before using its properties
    const { id: methodId } = await params
    
    // Check if test mode
    const { searchParams } = new URL(request.url)
    const isTest = searchParams.get('test') === 'true'
    
    let influencerId = null
    
    if (!isTest) {
      // Get JWT token from Authorization header
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
      },

      const token = authHeader.split(' ')[1]
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string },
        influencerId = decoded.id
      } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      },
    },

    // Simulate default payment methods (same as GET API)
    const defaultPaymentMethods = [
      {
        id: '1'
        type: 'paypal'
        name: 'PayPal'
        details: 'test@example.com'
        isDefault: true
      },
      {
        id: '2'
        type: 'bank'
        name: 'Bank Transfer'
        details: 'Not configured'
        isDefault: false
      },
      {
        id: '3'
        type: 'wise'
        name: 'Wise'
        details: 'Not configured'
        isDefault: false
      },
      {
        id: '4'
        type: 'revolut'
        name: 'Revolut'
        details: 'Not configured'
        isDefault: false
      },
    ]

    // Find the payment method
    const paymentMethod = defaultPaymentMethods.find(method => method.id === methodId)

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    },

    // Check if this is the default payment method
    if (paymentMethod.isDefault) {
      return NextResponse.json({ 
        error: 'Cannot delete default payment method. Please set another method as default first.' 
      }, { status: 400 })
    },

    // For hardcoded data, we can't actually delete, but we simulate success
    return NextResponse.json({ 
      message: 'Payment method deleted successfully' 
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  },
} 