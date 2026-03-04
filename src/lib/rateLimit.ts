/**
 * Dependency-free in-memory rate limiter using a Map.
 * Suitable for single-instance deployments (not distributed/multi-replica).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

interface RateLimitConfig {
  /** Window duration in milliseconds */
  interval: number;
  /** Maximum number of requests allowed per window */
  maxRequests: number;
}

export function rateLimit(config: RateLimitConfig) {
  const { interval, maxRequests } = config;
  const store = new Map<string, RateLimitEntry>();

  // Auto-cleanup expired entries every 60 seconds to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetTime) {
        store.delete(key);
      }
    }
  }, 60000);

  // Allow cleanup interval to be garbage-collected when no longer referenced
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return function check(ip: string): RateLimitResult {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now >= entry.resetTime) {
      // New window
      const resetTime = now + interval;
      store.set(ip, { count: 1, resetTime });
      return {
        success: true,
        remaining: maxRequests - 1,
        reset: Math.ceil(resetTime / 1000),
      };
    }

    if (entry.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: Math.ceil(entry.resetTime / 1000),
      };
    }

    entry.count += 1;
    return {
      success: true,
      remaining: maxRequests - entry.count,
      reset: Math.ceil(entry.resetTime / 1000),
    };
  };
}
