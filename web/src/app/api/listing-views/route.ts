import { NextResponse } from 'next/server';

import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

type ListingKind = 'cars' | 'parts' | 'requests';

function coerceNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeKind(value: unknown): ListingKind | null {
  if (value === 'cars' || value === 'car') return 'cars';
  if (value === 'parts' || value === 'part') return 'parts';
  if (value === 'requests' || value === 'request' || value === 'wanted') return 'requests';
  return null;
}

function isValidId(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 128;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { kind?: unknown; slug?: unknown };
    const kind = normalizeKind(body.kind);
    const slug = body.slug;

    if (!kind || !isValidId(slug)) {
      return NextResponse.json({ views: null, error: 'Invalid request' }, { status: 400 });
    }

    const listingRef = getAdminDb().ref(`${kind}/${String(slug).trim()}`);

    const result = await listingRef.transaction((current) => {
      if (!current || typeof current !== 'object') return current;
      const currentViews = coerceNumber((current as any).views);
      const nextViews = currentViews + 1;
      return { ...(current as any), views: nextViews };
    });

    const views = result.snapshot.child('views').exists() ? coerceNumber(result.snapshot.child('views').val()) : 0;
    return NextResponse.json({ views });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Views update failed';
    return NextResponse.json({ views: null, error: message }, { status: 503 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kind = normalizeKind(url.searchParams.get('kind'));
    const slug = url.searchParams.get('slug');

    if (!kind || !isValidId(slug)) {
      return NextResponse.json({ views: null, error: 'Invalid request' }, { status: 400 });
    }

    const snapshot = await getAdminDb().ref(`${kind}/${slug}/views`).get();
    const views = snapshot.exists() ? coerceNumber(snapshot.val()) : 0;

    return NextResponse.json({ views });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Views unavailable';
    return NextResponse.json({ views: null, error: message }, { status: 503 });
  }
}
