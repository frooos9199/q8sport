import { createHash } from 'crypto';

import { digits, type PublishPayload } from './publish-validation';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 3;

type RateLimitState = {
  count: number;
  windowStartedAt: number;
  lastAttemptAt: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
  nextState: RateLimitState;
};

function envNumber(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getPublishRateLimitConfig() {
  return {
    windowMs: envNumber('PUBLISH_RATE_LIMIT_WINDOW_MS', DEFAULT_WINDOW_MS),
    maxAttempts: envNumber('PUBLISH_RATE_LIMIT_MAX_ATTEMPTS', DEFAULT_MAX_ATTEMPTS),
  };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export function createPublishRateLimitKey(clientIp: string, payload: PublishPayload) {
  const phone = digits(payload.sellerWhatsapp);
  const rawKey = `${clientIp}::${phone}::${payload.type}`;
  return createHash('sha256').update(rawKey).digest('hex').slice(0, 40);
}

export function resolvePublishRateLimit(
  current: Partial<RateLimitState> | null | undefined,
  now: number,
  windowMs: number,
  maxAttempts: number,
): RateLimitDecision {
  const windowStartedAt = typeof current?.windowStartedAt === 'number' ? current.windowStartedAt : 0;
  const count = typeof current?.count === 'number' ? current.count : 0;

  if (!windowStartedAt || now - windowStartedAt >= windowMs) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      nextState: {
        count: 1,
        windowStartedAt: now,
        lastAttemptAt: now,
      },
    };
  }

  if (count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - windowStartedAt)) / 1000)),
      nextState: {
        count,
        windowStartedAt,
        lastAttemptAt: typeof current?.lastAttemptAt === 'number' ? current.lastAttemptAt : now,
      },
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    nextState: {
      count: count + 1,
      windowStartedAt,
      lastAttemptAt: now,
    },
  };
}