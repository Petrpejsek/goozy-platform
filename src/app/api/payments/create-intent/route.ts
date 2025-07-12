import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { applySecurityMiddleware } from '@/lib/security';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_default', {
  apiVersion: '2024-06-20',
});

const CreatePaymentIntentSchema = z.object({
  amount: z.number().positive().max(999999), // Max €9,999.99
  currency: z.string().default('eur'),
  cartItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })),
  customerEmail: z.string().email().optional(),
  campaignSlug: z.string().optional(),
});

export async function POST(request: NextRequest) {
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
    const { amount, currency, cartItems, customerEmail, campaignSlug } = 
      CreatePaymentIntentSchema.parse(body);

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Validate Stripe keys
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_default') {
      return NextResponse.json(
        { error: 'Stripe není nakonfigurováno' },
        { status: 500 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      metadata: {
        cartItemsCount: cartItems.length.toString(),
        campaignSlug: campaignSlug || '',
        customerEmail: customerEmail || '',
        createdAt: new Date().toISOString(),
      },
      description: `Goozy objednávka - ${cartItems.length} položek`,
      statement_descriptor: 'GOOZY*',
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
      status: paymentIntent.status,
      metadata: {
        itemsCount: cartItems.length,
        campaignSlug: campaignSlug,
      }
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Neplatná data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Chyba platebního systému',
          message: error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Nepodařilo se vytvořit platbu',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 