import Redis from 'ioredis';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Global Redis instance placeholder to avoid creating multiple connections in development
let redisClient: Redis | null = null;
let isRedisConfigured = false;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });
    isRedisConfigured = true;
    
    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis connection error, falling back to in-memory rate limiter:', err.message);
      isRedisConfigured = false;
    });
    
    redisClient.on('connect', () => {
      isRedisConfigured = true;
    });
  } catch (err: any) {
    console.warn('⚠️ Failed to initialize Redis client, falling back to in-memory store:', err.message);
    isRedisConfigured = false;
  }
}

// In-Memory store fallback
const memoryStore = new Map<string, RateLimitEntry>();

// Purge expired memory entries every 10 minutes to avoid unbounded memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
  }, 10 * 60 * 1000);
}

export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
  // If Redis is configured, use Redis rate limiting
  if (isRedisConfigured && redisClient) {
    try {
      const key = `ratelimit:${identifier}`;
      
      const results = await redisClient
        .multi()
        .incr(key)
        .ttl(key)
        .exec();

      if (results && results[0] && results[1]) {
        const incrErr = results[0][0];
        const incrVal = results[0][1] as number;
        const ttlErr = results[1][0];
        const ttlVal = results[1][1] as number;

        if (!incrErr && !ttlErr) {
          // If key is new (TTL is not set), set the TTL
          if (ttlVal === -1) {
            await redisClient.expire(key, Math.ceil(windowMs / 1000));
          }

          const remaining = Math.max(0, limit - incrVal);
          const retryAfterMs = incrVal > limit ? (ttlVal > 0 ? ttlVal * 1000 : windowMs) : 0;
          const allowed = incrVal <= limit;

          return { allowed, remaining, retryAfterMs };
        }
      }
    } catch (err: any) {
      console.warn('⚠️ Redis rate limiting failed, falling back to in-memory:', err.message);
    }
  }

  // Fallback: In-memory Map store rate limiting
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
