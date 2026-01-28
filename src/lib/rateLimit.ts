import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(limit: number = 10, windowMs: number = 60000) {
  return (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const userLimit = rateLimit.get(ip);

    if (!userLimit || now > userLimit.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
      return null;
    }

    if (userLimit.count >= limit) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    userLimit.count++;
    return null;
  };
}

export const apiRateLimit = rateLimiter(100, 60000); // 100 requests per minute
export const authRateLimit = rateLimiter(5, 300000); // 5 requests per 5 minutes
export const uploadRateLimit = rateLimiter(10, 60000); // 10 uploads per minute
