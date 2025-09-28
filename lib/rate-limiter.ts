import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextRequest } from 'next/server';
import { createErrorResponse } from './api-error-handler';

// Create different rate limiters for different endpoints
const rateLimiters = {
  // General API rate limiter - 100 requests per minute
  general: new RateLimiterMemory({
    keyPrefix: 'general',
    points: 100,
    duration: 60,
  }),

  // Auth rate limiter - 5 login attempts per minute
  auth: new RateLimiterMemory({
    keyPrefix: 'auth',
    points: 5,
    duration: 60,
    blockDuration: 60 * 5, // Block for 5 minutes
  }),

  // Password reset - 3 attempts per hour
  passwordReset: new RateLimiterMemory({
    keyPrefix: 'password_reset',
    points: 3,
    duration: 60 * 60,
    blockDuration: 60 * 60, // Block for 1 hour
  }),

  // Registration - 3 registrations per hour per IP
  registration: new RateLimiterMemory({
    keyPrefix: 'registration',
    points: 3,
    duration: 60 * 60,
  }),

  // AI homework generation - 10 requests per hour
  aiGeneration: new RateLimiterMemory({
    keyPrefix: 'ai_generation',
    points: 10,
    duration: 60 * 60,
  }),
};

export type RateLimiterType = keyof typeof rateLimiters;

export function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddress = request.headers.get('remote-addr');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (remoteAddress) {
    return remoteAddress;
  }

  // Fallback to a default IP for development
  return '127.0.0.1';
}

export async function checkRateLimit(
  request: NextRequest,
  type: RateLimiterType,
  identifier?: string
) {
  const rateLimiter = rateLimiters[type];
  const ip = getClientIP(request);
  const key = identifier ? `${ip}:${identifier}` : ip;

  try {
    await rateLimiter.consume(key);
    return { success: true };
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;

    return {
      success: false,
      response: createErrorResponse(
        'Too many requests. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED',
        {
          retryAfter: secs,
          limit: rateLimiter.points,
          window: rateLimiter.duration
        }
      )
    };
  }
}

export function addRateLimitHeaders(response: Response, type: RateLimiterType) {
  const rateLimiter = rateLimiters[type];

  response.headers.set('X-RateLimit-Limit', rateLimiter.points.toString());
  response.headers.set('X-RateLimit-Window', rateLimiter.duration.toString());

  return response;
}