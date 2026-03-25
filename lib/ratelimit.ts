/**
 * Rate Limiting Utility
 * 
 * Protects authentication endpoints from brute force attacks.
 * Uses Upstash Redis for distributed rate limiting.
 * 
 * Setup Instructions:
 * 1. Create account at https://console.upstash.com/
 * 2. Create a Redis database
 * 3. Copy REST URL and token to .env.local:
 *    UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
 *    UPSTASH_REDIS_REST_TOKEN=your_token_here
 * 4. Install dependencies: npm install @upstash/ratelimit @upstash/redis
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash is configured
const isUpstashConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client (only if configured)
const redis = isUpstashConfigured 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Rate limit configurations
export const authRateLimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 requests per hour
      analytics: true,
      prefix: "@auth/ratelimit",
    })
  : null;

export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
      analytics: true,
      prefix: "@api/ratelimit",
    })
  : null;

export const strictRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "5 m"), // 3 requests per 5 minutes
      analytics: true,
      prefix: "@strict/ratelimit",
    })
  : null;

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Check rate limit for a given identifier
 * Returns { success: boolean, limit: number, remaining: number, reset: Date }
 */
export async function checkRateLimit(
  identifier: string,
  type: "auth" | "api" | "strict" = "api"
) {
  const limiter = type === "auth" 
    ? authRateLimit 
    : type === "strict"
    ? strictRateLimit
    : apiRateLimit;

  if (!limiter) {
    console.warn("⚠️  Rate limiting not configured - requests allowed by default");
    console.warn("   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable");
    return { 
      success: true, 
      limit: 999999, 
      remaining: 999999, 
      reset: new Date(Date.now() + 60000),
      pending: Promise.resolve()
    };
  }

  return await limiter.limit(identifier);
}

/**
 * Middleware helper to apply rate limiting to a route handler
 */
export async function withRateLimit(
  request: Request,
  type: "auth" | "api" | "strict" = "api",
  handler: () => Promise<Response>
): Promise<Response> {
  const identifier = getClientIp(request);
  const { success, limit, remaining, reset } = await checkRateLimit(identifier, type);

  // Ensure reset is a Date object
  const resetDate = typeof reset === 'number' ? new Date(reset) : reset;

  // Add rate limit headers
  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetDate.toISOString(),
  };

  if (!success) {
    console.warn(`🚫 Rate limit exceeded for ${identifier} (type: ${type})`);
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "You have exceeded the rate limit. Please try again later.",
        retryAfter: Math.ceil((resetDate.getTime() - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil((resetDate.getTime() - Date.now()) / 1000).toString(),
          ...headers,
        },
      }
    );
  }

  // Execute handler and add rate limit headers to response
  const response = await handler();
  const newResponse = new Response(response.body, response);
  
  Object.entries(headers).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });

  return newResponse;
}

/**
 * Simple in-memory rate limiter fallback (for local development)
 * Not suitable for production! Use Upstash Redis.
 */
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    
    // Remove old timestamps outside window
    const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
    
    if (validTimestamps.length >= this.maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);
    
    return true; // Request allowed
  }
}

// Export in-memory fallback for testing
export const inMemoryAuthLimiter = new InMemoryRateLimiter(5, 60 * 60 * 1000); // 5 per hour
