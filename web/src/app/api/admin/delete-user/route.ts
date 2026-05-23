import { NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

type DeleteUserPayload = {
  uid?: string;
};

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function getAdminToken() {
  return process.env.ADMIN_API_TOKEN || '';
}

async function deleteUserMarketplaceData(uid: string) {
  const [carsSnap, partsSnap, requestsSnap, userSnap] = await Promise.all([
    adminDb.ref('cars').get(),
    adminDb.ref('parts').get(),
    adminDb.ref('requests').get(),
    adminDb.ref(`users/${uid}`).get(),
  ]);

  const updates: Record<string, null | object> = {};

  carsSnap.forEach(child => {
    if (child.val()?.userId === uid) {
      updates[`cars/${child.key}`] = null;
    }
  });

  partsSnap.forEach(child => {
    if (child.val()?.userId === uid) {
      updates[`parts/${child.key}`] = null;
    }
  });

  requestsSnap.forEach(child => {
    if (child.val()?.userId === uid) {
      updates[`requests/${child.key}`] = null;
    }
  });

  const existingUser = userSnap.exists() ? (userSnap.val() as Record<string, unknown>) : {};

  updates[`users/${uid}`] = {
    uid,
    email: String(existingUser.email || ''),
    name: 'حساب محذوف',
    phone: '',
    whatsapp: '',
    isAdmin: false,
    disabled: true,
    deletedAt: Date.now(),
    updatedAt: Date.now(),
  };

  await adminDb.ref().update(updates);
}

export async function POST(request: Request) {
  const adminToken = getAdminToken();
  const requestToken = request.headers.get('x-admin-token') || '';

  if (!adminToken || requestToken !== adminToken) {
    return unauthorized();
  }

  try {
    const payload = (await request.json()) as DeleteUserPayload;
    const uid = String(payload.uid || '').trim();

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    await deleteUserMarketplaceData(uid);
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ ok: true, uid });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete user failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}