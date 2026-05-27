import { digits, normalizeImages, validateCommon, type PublishPayload } from '../web/src/lib/publish-validation';
import { createPublishRateLimitKey, resolvePublishRateLimit } from '../web/src/lib/publish-rate-limit-core';

const validPayload: PublishPayload = {
  type: 'car',
  sellerName: 'معرض الكويت',
  sellerWhatsapp: '+965 5555 1234',
  title: 'تويوتا كامري 2020',
  description: 'سيارة نظيفة جدًا وممشاها مناسب ومعروضة بسعر واضح.',
};

describe('publish validation', () => {
  it('normalizes seller phone digits', () => {
    expect(digits(validPayload.sellerWhatsapp)).toBe('96555551234');
  });

  it('caps images at six items and strips blanks', () => {
    expect(normalizeImages([' one ', '', 'two', 'three', 'four', 'five', 'six', 'seven'])).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
    ]);
  });

  it('rejects honeypot submissions', () => {
    expect(validateCommon({ ...validPayload, website: 'https://spam.invalid' })).toBe('تعذر إرسال النموذج');
  });

  it('rejects invalid whatsapp numbers', () => {
    expect(validateCommon({ ...validPayload, sellerWhatsapp: '123' })).toBe('رقم الواتساب غير صالح');
  });

  it('accepts a valid payload', () => {
    expect(validateCommon(validPayload)).toBeNull();
  });

  it('creates a stable rate limit key from ip, seller, and type', () => {
    expect(createPublishRateLimitKey('203.0.113.10', validPayload)).toBe(createPublishRateLimitKey('203.0.113.10', validPayload));
  });

  it('blocks when max attempts are exhausted inside the same window', () => {
    const now = 1_700_000_000_000;
    const first = resolvePublishRateLimit(null, now, 60_000, 2);
    const second = resolvePublishRateLimit(first.nextState, now + 1_000, 60_000, 2);
    const third = resolvePublishRateLimit(second.nextState, now + 2_000, 60_000, 2);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets the window after it expires', () => {
    const now = 1_700_000_000_000;
    const blockedBase = {
      count: 3,
      windowStartedAt: now,
      lastAttemptAt: now,
    };

    const next = resolvePublishRateLimit(blockedBase, now + 61_000, 60_000, 3);
    expect(next.allowed).toBe(true);
    expect(next.nextState.count).toBe(1);
  });
});