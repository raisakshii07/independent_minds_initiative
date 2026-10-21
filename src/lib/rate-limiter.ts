import { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window rate limiter
const store = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  const maxRetention = 60 * 1000; // 1 minute
  for (const [key, record] of store.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < maxRetention);
    if (record.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // e.g. 1000ms (1 second)
  maxRequests: number; // e.g. 10 requests
  actionName: string; // e.g. 'admin_login', 'upload', 'join'
}

export function resetRateLimit(actionName?: string): void {
  if (actionName) {
    for (const key of store.keys()) {
      if (key.startsWith(`${actionName}:`)) {
        store.delete(key);
      }
    }
  } else {
    store.clear();
  }
}

export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const key = `${options.actionName}:${ip}`;
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldestTimestamp + options.windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: options.maxRequests - record.timestamps.length,
    resetInSeconds: Math.ceil(options.windowMs / 1000),
  };
}
