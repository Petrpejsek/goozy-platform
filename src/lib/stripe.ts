import { loadStripe, Stripe } from '@stripe/stripe-js';

// Types
export interface PaymentIntentData {
  amount: number;
  currency: string;
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customerEmail?: string;
  campaignSlug?: string;
}

// Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key not found');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

// EU countries for VAT calculation
export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
];

// VAT rates by country
export const VAT_RATES = {
  'CZ': 0.21, // Czech Republic 21%
  'DE': 0.19, // Germany 19%
  'AT': 0.20, // Austria 20%
  'SK': 0.20, // Slovakia 20%
  'PL': 0.23, // Poland 23%
  'HU': 0.27, // Hungary 27%
  'default': 0.21 // Default EU rate
};

// Helper functions
export const formatPrice = (price: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
};

export const calculateVAT = (amount: number, country: string): number => {
  if (!EU_COUNTRIES.includes(country)) return 0;
  
  const rate = VAT_RATES[country] || VAT_RATES.default;
  return Math.round(amount * rate * 100) / 100;
};

export const isApplePayAvailable = async (): Promise<boolean> => {
  try {
    const stripe = await getStripe();
    if (!stripe) return false;
    
    return stripe.paymentRequest({
      country: 'CZ',
      currency: 'eur',
      total: { label: 'Test', amount: 100 },
    }).canMakePayment();
  } catch (error) {
    console.error('Apple Pay availability check failed:', error);
    return false;
  }
};

// Validation helpers
export const validateCardNumber = (cardNumber: string): boolean => {
  // Basic Luhn algorithm
  const sanitized = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(sanitized)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const getCardType = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(sanitized)) return 'visa';
  if (/^5[1-5]/.test(sanitized)) return 'mastercard';
  if (/^3[47]/.test(sanitized)) return 'amex';
  if (/^6(?:011|5)/.test(sanitized)) return 'discover';
  
  return 'unknown';
};

// Error handling
export const handleStripeError = (error: any): string => {
  if (!error) return 'Neznámá chyba';
  
  switch (error.type) {
    case 'card_error':
      return error.message || 'Chyba platební karty';
    case 'validation_error':
      return 'Neplatné údaje';
    case 'api_connection_error':
      return 'Problém s připojením k platebnímu systému';
    case 'api_error':
      return 'Chyba platebního systému';
    case 'authentication_error':
      return 'Chyba autentizace';
    case 'rate_limit_error':
      return 'Příliš mnoho požadavků';
    default:
      return error.message || 'Chyba při zpracování platby';
  }
};

// Test card numbers for development
export const TEST_CARDS = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  processingError: '4000000000000119',
};

export default {
  getStripe,
  formatPrice,
  calculateVAT,
  isApplePayAvailable,
  validateCardNumber,
  getCardType,
  handleStripeError,
  EU_COUNTRIES,
  VAT_RATES,
  TEST_CARDS,
}; 