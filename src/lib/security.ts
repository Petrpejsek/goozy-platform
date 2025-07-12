import { NextRequest } from 'next/server';

interface SecurityConfig {
  rateLimits?: {
    requests: number;
    windowMs: number;
  };
  validateOrigin?: boolean;
  requireContentType?: string;
}

interface SecurityResult {
  allowed: boolean;
  reason?: string;
  status: number;
}

// Simple in-memory rate limiting (for production use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function applySecurityMiddleware(
  request: NextRequest,
  config: SecurityConfig = {}
): Promise<SecurityResult> {
  
  // Rate limiting
  if (config.rateLimits) {
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const key = `rate_limit:${clientIp}`;
    const now = Date.now();
    const windowMs = config.rateLimits.windowMs;
    const maxRequests = config.rateLimits.requests;
    
    let rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      rateLimitData.count++;
    }
    
    rateLimitStore.set(key, rateLimitData);
    
    if (rateLimitData.count > maxRequests) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        status: 429
      };
    }
  }

  // Origin validation (for CORS)
  if (config.validateOrigin) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://goozy.com',
      'https://www.goozy.com'
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      return {
        allowed: false,
        reason: 'Origin not allowed',
        status: 403
      };
    }
  }

  // Content-Type validation
  if (config.requireContentType) {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes(config.requireContentType)) {
      return {
        allowed: false,
        reason: 'Invalid content type',
        status: 400
      };
    }
  }

  // Basic security headers validation
  const userAgent = request.headers.get('user-agent');
  if (!userAgent || userAgent.length < 10) {
    // Allow for development/testing but log suspicious requests
    console.warn('Suspicious request - minimal user agent:', userAgent);
  }

  return {
    allowed: true,
    status: 200
  };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute 