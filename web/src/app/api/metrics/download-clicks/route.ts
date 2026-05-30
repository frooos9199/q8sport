import { NextResponse } from 'next/server';

import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

const APP_STORE_PATH = 'metrics/download/clicks/appStore';
const PLAY_STORE_PATH = 'metrics/download/clicks/playStore';

type Target = 'appStore' | 'playStore';

type Payload = {
  target?: Target;
};

function coerceNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

async function readCounts() {
  const db = getAdminDb();
  const [appStoreSnap, playStoreSnap] = await Promise.all([
    db.ref(APP_STORE_PATH).get(),
    db.ref(PLAY_STORE_PATH).get(),
  ]);

  return {
    appStore: appStoreSnap.exists() ? coerceNumber(appStoreSnap.val()) : 0,
    playStore: playStoreSnap.exists() ? coerceNumber(playStoreSnap.val()) : 0,
  };
}

export async function GET() {
  try {
    const counts = await readCounts();
    return NextResponse.json({ clicks: counts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Metrics unavailable';
    return NextResponse.json({ clicks: null, error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    const payload: Payload = contentType.includes('application/json')
      ? ((await request.json()) as Payload)
      : ({} as Payload);

    const target = String(payload.target || '').trim() as Target;

    if (target !== 'appStore' && target !== 'playStore') {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    }

    const refPath = target === 'appStore' ? APP_STORE_PATH : PLAY_STORE_PATH;

    const result = await getAdminDb().ref(refPath).transaction(current => {
      const nextValue = coerceNumber(current) + 1;
      return nextValue;
    });

    const nextValue = result.snapshot.exists() ? coerceNumber(result.snapshot.val()) : 0;

    return NextResponse.json({ ok: true, target, value: nextValue });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Metrics update failed';
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
