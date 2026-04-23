import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const MAX_STORE_SIZE = 10_000;
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key);
  });
}, 60_000);

/**
 * Simple in-memory rate limiter with bounded store.
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 */
export function rateLimit(
  req: NextRequest,
  { maxRequests = 10, windowMs = 60_000, keyPrefix = '' } = {}
): NextResponse | null {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // Evict oldest entries if store is full to prevent memory exhaustion
    if (store.size >= MAX_STORE_SIZE) {
      const firstKey = store.keys().next().value;
      if (firstKey) store.delete(firstKey);
    }
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  entry.count++;
  return null;
}
