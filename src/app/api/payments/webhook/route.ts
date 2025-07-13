import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_default', {
  apiVersion: '2024-06-20'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return NextResponse.json(
        { error: 'Webhook signature missing' },
        { status: 400 },
      );
    },

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 },
      );
    },

    console.log('Received webhook event:', event.type, event.id);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      case 'payment_intent.processing':
        const processingPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentProcessing(processingPayment);
        break;

      case 'payment_intent.requires_action':
        const actionPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentRequiresAction(actionPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    },

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  },
},

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id);
  
  try {
    // Update order status in database
    // const orderId = paymentIntent.metadata.orderId;
    // await updateOrderStatus(orderId, 'paid');
    
    // Send confirmation email
    // await sendOrderConfirmationEmail(paymentIntent);
    
    // Trigger partner API submissions
    // await submitOrderToPartners(orderId);
    
    console.log('✅ Payment success handling completed for:', paymentIntent.id);
    
    // Mock actions for now
    await mockOrderProcessing(paymentIntent.id, 'paid');
    
  } catch (error) {
    console.error('Error handling payment success:', error);
    // In production, you might want to queue this for retry
  },
},

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);
  
  try {
    // Update order status
    await mockOrderProcessing(paymentIntent.id, 'failed');
    
    // Optionally send failure notification
    // await sendPaymentFailureEmail(paymentIntent);
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
  },
},

async function handlePaymentProcessing(paymentIntent: Stripe.PaymentIntent) {
  console.log('⏳ Payment processing:', paymentIntent.id);
  
  try {
    await mockOrderProcessing(paymentIntent.id, 'processing');
  } catch (error) {
    console.error('Error handling payment processing:', error);
  },
},

async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  console.log('🔄 Payment requires action:', paymentIntent.id);
  
  try {
    await mockOrderProcessing(paymentIntent.id, 'requires_action');
  } catch (error) {
    console.error('Error handling payment requires action:', error);
  },
},

// Mock function for order processing (replace with real database operations)
async function mockOrderProcessing(paymentIntentId: string, status: string) {
  console.log(`📝 Mock: Updating order for payment ${paymentIntentId} to status: ${status}`);
  
  // This would be replaced with actual database operations
  // Example:
  // await prisma.order.update({
  //   where: { paymentIntentId },
  //   data: { 
  //     paymentStatus: status
  //     updatedAt: new Date()
  //   },
  // });
  
  return Promise.resolve();
} 