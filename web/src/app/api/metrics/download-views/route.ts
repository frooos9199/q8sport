import { NextResponse } from 'next/server';

import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

const METRIC_PATH = 'metrics/download/views';

function coerceNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export async function GET() {
  try {
    const snapshot = await getAdminDb().ref(METRIC_PATH).get();
    const views = snapshot.exists() ? coerceNumber(snapshot.val()) : 0;
    return NextResponse.json({ views });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Metrics unavailable';
    return NextResponse.json({ views: null, error: message }, { status: 503 });
  }
}

export async function POST() {
  try {
    const ref = getAdminDb().ref(METRIC_PATH);

    const result = await ref.transaction(current => {
      const nextValue = coerceNumber(current) + 1;
      return nextValue;
    });

    const views = result.snapshot.exists() ? coerceNumber(result.snapshot.val()) : 0;

    return NextResponse.json({ views });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Metrics update failed';
    return NextResponse.json({ views: null, error: message }, { status: 503 });
  }
}
