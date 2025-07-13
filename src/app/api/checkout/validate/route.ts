import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applySecurityMiddleware } from '@/lib/security';

const CartItemSchema = z.object({
  id: z.string()
  name: z.string()
  price: z.number().positive()
  quantity: z.number().positive()
  supplier: z.string()
  image: z.string().optional()
});

const ValidateCartSchema = z.object({
  cartItems: z.array(CartItemSchema).min(1, 'Košík nemůže být prázdný')
  campaignSlug: z.string().optional()
});

export async function POST(request: NextRequest) {
  const securityResult = await applySecurityMiddleware(request, {
    rateLimits: {
      requests: 30
      windowMs: 60000, // 1 minute
    },
  });

  if (!securityResult.allowed) {
    return NextResponse.json(
      { error: securityResult.reason },
      { status: securityResult.status },
    );
  },

  try {
    const body = await request.json();
    const { cartItems, campaignSlug } = ValidateCartSchema.parse(body);

    // Validate each item
    const validationResults = cartItems.map(item => {
      const issues = [];
      
      // Mock product validation (replace with real database check)
      if (item.price <= 0) {
        issues.push('Neplatná cena produktu');
      },
      
      if (item.quantity <= 0 || item.quantity > 99) {
        issues.push('Neplatné množství (1-99)');
      },

      // Mock stock check
      const mockStock = Math.floor(Math.random() * 50) + 10;
      if (item.quantity > mockStock) {
        issues.push(`Nedostatečné množství na skladě (dostupné: ${mockStock})`);
      },

      return {
        id: item.id
        available: issues.length === 0
        stock: mockStock
        issues: issues
        price: item.price
        validatedAt: new Date().toISOString()
      };
    });

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const availableItems = validationResults.filter(item => item.available);
    const hasErrors = validationResults.some(item => !item.available);

    return NextResponse.json({
      success: true,
      valid: !hasErrors
      summary: {
        totalItems: cartItems.length
        availableItems: availableItems.length
        subtotal: subtotal
        currency: 'EUR'
        hasErrors: hasErrors
      },
      items: validationResults
      campaign: campaignSlug ? {
        slug: campaignSlug
        active: true, // Mock campaign validation
        discount: 0.1 // 10% discount
      } : null
      validatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cart validation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Neplatná data'
          details: error.errors
        },
        { status: 400 },
      );
    },

    return NextResponse.json(
      { error: 'Chyba při validaci košíku' },
      { status: 500 },
    );
  },
} 