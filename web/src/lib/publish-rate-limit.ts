import { getAdminDb } from './firebase-admin';
import { getClientIp, getPublishRateLimitConfig, createPublishRateLimitKey, resolvePublishRateLimit, type RateLimitDecision } from './publish-rate-limit-core';
import type { PublishPayload } from './publish-validation';

export async function enforcePublishRateLimit(
  request: Request,
  payload: PublishPayload,
  now = Date.now(),
): Promise<RateLimitDecision> {
  const { maxAttempts, windowMs } = getPublishRateLimitConfig();
  const rateLimitKey = createPublishRateLimitKey(getClientIp(request), payload);
  const rateLimitRef = getAdminDb().ref(`rateLimits/publish/${rateLimitKey}`);

  let decision: RateLimitDecision | null = null;

  await rateLimitRef.transaction((current) => {
    decision = resolvePublishRateLimit(current as Parameters<typeof resolvePublishRateLimit>[0], now, windowMs, maxAttempts);
    return decision.allowed ? decision.nextState : current;
  });

  if (!decision) {
    throw new Error('تعذر التحقق من عدد المحاولات');
  }

  return decision;
}