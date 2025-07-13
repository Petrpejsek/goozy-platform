import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applySecurityMiddleware } from '@/lib/security';

const SubmitOrderSchema = z.object({
  orderId: z.string().min(1)
  supplierGroups: z.array(z.object({
    supplier: z.string()
    items: z.array(z.object({
      id: z.string()
      name: z.string()
      quantity: z.number()
      price: z.number()
    }))
    subtotal: z.number()
    shippingCost: z.number()
  }))
  shippingAddress: z.object({
    firstName: z.string()
    lastName: z.string()
    street: z.string()
    city: z.string()
    postalCode: z.string()
    country: z.string()
    email: z.string().email()
    phone: z.string()
  })
});

export async function POST(request: NextRequest) {
  const securityResult = await applySecurityMiddleware(request, {
    rateLimits: {
      requests: 5
      windowMs: 60000, // 1 minute
    }
  });

  if (!securityResult.allowed) {
    return NextResponse.json(
      { error: securityResult.reason }
      { status: securityResult.status }
    );
  }

  try {
    const body = await request.json();
    const { orderId, supplierGroups, shippingAddress } = SubmitOrderSchema.parse(body);

    console.log('📦 Submitting order to partners:', orderId);

    const submissions = [];

    // Process each supplier group
    for (const group of supplierGroups) {
      try {
        const submission = await submitToSupplier(group, shippingAddress, orderId);
        submissions.push({
          supplier: group.supplier
          status: 'success'
          submissionId: submission.id
          trackingNumber: submission.trackingNumber
          estimatedDelivery: submission.estimatedDelivery
        });
      } catch (error) {
        console.error(`Failed to submit to supplier ${group.supplier}:`, error);
        submissions.push({
          supplier: group.supplier
          status: 'failed'
          error: error.message
          retryable: true
        });
      }
    }

    const successCount = submissions.filter(s => s.status === 'success').length;
    const failureCount = submissions.filter(s => s.status === 'failed').length;

    return NextResponse.json({
      success: failureCount === 0
      orderId
      summary: {
        totalSuppliers: supplierGroups.length
        successful: successCount
        failed: failureCount
      }
      submissions
      submittedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Partner submission error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Neplatná data'
          details: error.errors
        }
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Chyba při odesílání objednávky partnerům' }
      { status: 500 }
    );
  }
}

async function submitToSupplier(supplierGroup: any, shippingAddress: any, orderId: string) {
  const { supplier, items, subtotal, shippingCost } = supplierGroup;
  
  console.log(`🚚 Submitting to supplier: ${supplier}`);
  
  // Mock API configurations for different suppliers
  const supplierConfigs = {
    'supplier-1': {
      apiUrl: 'https://api.supplier1.com/orders'
      apiKey: process.env.SUPPLIER_1_API_KEY || 'mock_key_1'
      format: 'standard'
    }
    'supplier-2': {
      apiUrl: 'https://api.supplier2.com/v2/create-order'
      apiKey: process.env.SUPPLIER_2_API_KEY || 'mock_key_2'
      format: 'custom'
    }
    'supplier-3': {
      apiUrl: 'https://supplier3.dropship.com/api/orders'
      apiKey: process.env.SUPPLIER_3_API_KEY || 'mock_key_3'
      format: 'dropship'
    }
  };

  const config = supplierConfigs[supplier] || supplierConfigs['supplier-1'];
  
  // Prepare order data based on supplier format
  const orderData = {
    externalOrderId: orderId
    items: items.map(item => ({
      sku: item.id
      name: item.name
      quantity: item.quantity
      price: item.price
    }))
    shipping: {
      firstName: shippingAddress.firstName
      lastName: shippingAddress.lastName
      address1: shippingAddress.street
      city: shippingAddress.city
      postalCode: shippingAddress.postalCode
      country: shippingAddress.country
      email: shippingAddress.email
      phone: shippingAddress.phone
    }
    totals: {
      subtotal: subtotal
      shipping: shippingCost
      total: subtotal + shippingCost
    }
    metadata: {
      source: 'goozy'
      submittedAt: new Date().toISOString()
    }
  };

  // Mock API submission (in production, replace with actual HTTP requests)
  console.log(`📤 Sending order to ${supplier}:`, {
    url: config.apiUrl
    itemsCount: items.length
    total: orderData.totals.total
  });

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Mock response based on supplier
  const mockResponses = {
    'supplier-1': {
      id: `S1_${Date.now()}`
      trackingNumber: `TRK1${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
      status: 'confirmed'
    }
    'supplier-2': {
      id: `S2_${Date.now()}`
      trackingNumber: `TRK2${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      status: 'processing'
    }
    'supplier-3': {
      id: `S3_${Date.now()}`
      trackingNumber: `TRK3${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'received'
    }
  };

  const response = mockResponses[supplier] || mockResponses['supplier-1'];
  
  // Randomly simulate some failures for testing
  if (Math.random() < 0.1) { // 10% chance of failure
    throw new Error(`API Error: ${supplier} service temporarily unavailable`);
  }

  console.log(`✅ Successfully submitted to ${supplier}:`, response.id);
  
  return response;
}

// GET endpoint for checking submission status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  
  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID is required' }
      { status: 400 }
    );
  }

  // Mock status check (replace with actual database query)
  const mockStatus = {
    orderId
    submissions: [
      {
        supplier: 'supplier-1'
        status: 'shipped'
        trackingNumber: 'TRK1ABC123'
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
      {
        supplier: 'supplier-2', 
        status: 'processing'
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    lastUpdated: new Date().toISOString()
  };

  return NextResponse.json(mockStatus);
} 