import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applySecurityMiddleware } from '@/lib/security';

// Validation schemas
const AddressSchema = z.object({
  firstName: z.string().min(1, 'Jméno je povinné'),
  lastName: z.string().min(1, 'Příjmení je povinné'),
  email: z.string().email('Neplatný email'),
  phone: z.string().min(9, 'Telefon musí mít alespoň 9 číslic'),
  street: z.string().min(1, 'Ulice je povinná'),
  city: z.string().min(1, 'Město je povinné'),
  postalCode: z.string().min(5, 'PSČ musí mít alespoň 5 číslic'),
  country: z.string().min(2, 'Země je povinná'),
});

const CreateOrderSchema = z.object({
  cartItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().positive(),
    supplier: z.string(),
    image: z.string().optional(),
    description: z.string().optional(),
  })),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  paymentIntentId: z.string().min(1, 'Payment Intent ID je povinné'),
  campaignSlug: z.string().optional(),
  appliedCampaigns: z.array(z.string()).optional(),
  shippingMethod: z.string().min(1, 'Způsob dopravy je povinný'),
  totalAmount: z.number().positive(),
  shippingCost: z.number().min(0),
  taxAmount: z.number().min(0),
});

// EU countries for shipping calculation
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
];

// Shipping costs by supplier and destination
const SHIPPING_COSTS = {
  EU: {
    'supplier-1': 5.99,
    'supplier-2': 7.99,
    'supplier-3': 4.99,
    'default': 6.99
  },
  NON_EU: {
    'supplier-1': 12.99,
    'supplier-2': 15.99,
    'supplier-3': 11.99,
    'default': 14.99
  }
};

function calculateShippingCost(cartItems: any[], shippingAddress: any): number {
  const isEU = EU_COUNTRIES.includes(shippingAddress.country);
  const region = isEU ? 'EU' : 'NON_EU';
  
  // Group items by supplier
  const supplierGroups = cartItems.reduce((groups, item) => {
    const supplier = item.supplier || 'default';
    if (!groups[supplier]) groups[supplier] = [];
    groups[supplier].push(item);
    return groups;
  }, {});

  // Calculate shipping for each supplier
  let totalShipping = 0;
  Object.keys(supplierGroups).forEach(supplier => {
    const cost = (SHIPPING_COSTS as any)[region][supplier] || (SHIPPING_COSTS as any)[region]['default'];
    totalShipping += cost;
  });

  return Math.round(totalShipping * 100) / 100; // Round to 2 decimals
}

function calculateTaxAmount(cartItems: any[], shippingAddress: any): number {
  const isEU = EU_COUNTRIES.includes(shippingAddress.country);
  
  if (!isEU) return 0; // No VAT for non-EU
  
  // EU VAT rates (simplified - using Czech rate)
  const VAT_RATE = 0.21; // 21% for Czech Republic
  
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  return Math.round(subtotal * VAT_RATE * 100) / 100;
}

async function createOrderInDatabase(orderData: any) {
  // This would be implemented with your database
  // For now, return a mock order ID
  return {
    id: `order_${Date.now()}`,
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...orderData
  };
}

async function sendOrderConfirmationEmail(order: any) {
  // This would send actual email
  console.log('Sending order confirmation email for:', order.id);
  
  // Mock email sending
  return {
    sent: true,
    messageId: `msg_${Date.now()}`
  };
}

export async function POST(request: NextRequest) {
  // Apply security middleware
  const securityResult = await applySecurityMiddleware(request, {
    rateLimits: {
      requests: 10,
      windowMs: 60000, // 1 minute
    }
  });

  if (!securityResult.allowed) {
    return NextResponse.json(
      { error: securityResult.reason },
      { status: securityResult.status }
    );
  }

  try {
    const body = await request.json();
    
    // Validate request data
    const validatedData = CreateOrderSchema.parse(body);
    
    const {
      cartItems,
      billingAddress,
      shippingAddress,
      paymentIntentId,
      campaignSlug,
      appliedCampaigns,
      shippingMethod,
      totalAmount,
    } = validatedData;

    // Calculate shipping and tax
    const calculatedShipping = calculateShippingCost(cartItems, shippingAddress);
    const calculatedTax = calculateTaxAmount(cartItems, shippingAddress);
    
    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Verify total amount
    const expectedTotal = subtotal + calculatedShipping + calculatedTax;
    if (Math.abs(totalAmount - expectedTotal) > 0.01) {
      return NextResponse.json(
        { 
          error: 'Total amount mismatch',
          expected: expectedTotal,
          received: totalAmount 
        },
        { status: 400 }
      );
    }

    // Group items by supplier for order processing
    const supplierGroups = cartItems.reduce((groups: any, item) => {
      const supplier = item.supplier || 'default';
      if (!groups[supplier]) {
        groups[supplier] = {
          supplier,
          items: [],
          subtotal: 0,
          shippingCost: SHIPPING_COSTS[
            EU_COUNTRIES.includes(shippingAddress.country) ? 'EU' : 'NON_EU'
          ][supplier] || SHIPPING_COSTS[
            EU_COUNTRIES.includes(shippingAddress.country) ? 'EU' : 'NON_EU'
          ]['default']
        };
      }
      groups[supplier].items.push(item);
      groups[supplier].subtotal += item.price * item.quantity;
      return groups;
    }, {});

    // Create order data
    const orderData = {
      paymentIntentId,
      status: 'pending',
      subtotal,
      shippingCost: calculatedShipping,
      taxAmount: calculatedTax,
      totalAmount,
      currency: 'EUR',
      billingAddress,
      shippingAddress,
      shippingMethod,
      items: cartItems,
      supplierGroups: Object.values(supplierGroups),
      campaignSlug,
      appliedCampaigns: appliedCampaigns || [],
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        createdAt: new Date().toISOString(),
      }
    };

    // Create order in database
    const order = await createOrderInDatabase(orderData);

    // Send confirmation email (async)
    sendOrderConfirmationEmail(order).catch(error => {
      console.error('Failed to send order confirmation email:', error);
    });

    // Return success response
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: 'EUR',
        supplierGroups: order.supplierGroups,
        estimatedDelivery: {
          min: 3,
          max: 7,
          unit: 'days'
        }
      }
    });

  } catch (error) {
    console.error('Create order error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 