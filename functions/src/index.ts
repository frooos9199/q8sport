import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onValueDeleted, onValueUpdated, onValueWritten } from 'firebase-functions/v2/database';
import { logger } from 'firebase-functions';
import * as functionsV1 from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

type ListingLike = {
  status?: string;
  deleteAt?: number | null;
  soldAt?: number | null;
  createdAt?: any;
  updatedAt?: any;
  imageUrl?: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
  images?: string[];
  imageThumbs?: string[];
  imageMediums?: string[];
};

const LISTING_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function toTimestampMs(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function lastTouchMs(value: ListingLike): number {
  const updatedAt = toTimestampMs(value.updatedAt);
  const createdAt = toTimestampMs(value.createdAt);
  return updatedAt || createdAt;
}

async function cleanupExpiredByAge(path: 'cars' | 'parts' | 'requests', now: number) {
  const threshold = now - LISTING_TTL_MS;
  const rootRef = admin.database().ref(path);

  // Query both updatedAt and createdAt to avoid scanning the entire node.
  const [snapUpdated, snapCreated] = await Promise.all([
    rootRef.orderByChild('updatedAt').endAt(threshold).once('value'),
    rootRef.orderByChild('createdAt').endAt(threshold).once('value'),
  ]);

  const candidates = new Map<string, ListingLike>();
  const addCandidates = (snap: admin.database.DataSnapshot) => {
    snap.forEach((child) => {
      const id = String(child.key);
      const val = (child.val() || {}) as ListingLike;
      if (!candidates.has(id)) candidates.set(id, val);
    });
  };

  if (snapUpdated.exists()) addCandidates(snapUpdated);
  if (snapCreated.exists()) addCandidates(snapCreated);

  let examined = 0;
  let deleted = 0;

  const deletions: Array<Promise<void>> = [];
  for (const [id, val] of candidates.entries()) {
    examined += 1;
    const touch = lastTouchMs(val);
    if (!touch || touch > threshold) continue;

    deletions.push(
      (async () => {
        try {
          await admin.database().ref(`${path}/${id}`).remove();
          deleted += 1;
        } catch {
          // ignore
        }
      })(),
    );
  }

  await Promise.allSettled(deletions);
  return { deleted, examined, threshold };
}

function extractStoragePathFromDownloadUrl(url: string): string | null {
  if (!url) return null;

  if (url.startsWith('gs://')) {
    const withoutScheme = url.slice('gs://'.length);
    const slash = withoutScheme.indexOf('/');
    if (slash === -1) return null;
    return withoutScheme.slice(slash + 1);
  }

  const marker = '/o/';
  const markerIndex = url.indexOf(marker);
  if (markerIndex !== -1) {
    const rest = url.slice(markerIndex + marker.length);
    const end = rest.indexOf('?');
    const encodedPath = end === -1 ? rest : rest.slice(0, end);
    try {
      return decodeURIComponent(encodedPath);
    } catch {
      return encodedPath;
    }
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'storage.googleapis.com') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) return parts.slice(1).join('/');
    }
  } catch {
    // ignore
  }

  return null;
}

function collectListingMediaUrls(item: ListingLike | null | undefined) {
  const urls = new Set<string>();
  const push = (value?: string | null) => {
    const trimmed = String(value || '').trim();
    if (trimmed) urls.add(trimmed);
  };

  push(item?.imageUrl);
  push(item?.mediumUrl);
  push(item?.thumbnailUrl);

  (item?.images || []).forEach(push);
  (item?.imageMediums || []).forEach(push);
  (item?.imageThumbs || []).forEach(push);

  return Array.from(urls);
}

async function deleteStorageByUrls(urls: string[]) {
  const bucket = admin.storage().bucket();
  const unique = Array.from(new Set((urls || []).map(u => String(u || '').trim()).filter(Boolean)));
  if (!unique.length) return;

  await Promise.allSettled(
    unique.map(async (url) => {
      const path = extractStoragePathFromDownloadUrl(url);
      if (!path) return;
      try {
        await bucket.file(path).delete();
      } catch {
        // Best-effort cleanup.
      }
    }),
  );
}

async function deleteRemovedStorageMedia(before: ListingLike | null | undefined, after: ListingLike | null | undefined) {
  const beforeSet = new Set(collectListingMediaUrls(before));
  const afterSet = new Set(collectListingMediaUrls(after));
  const toDelete: string[] = [];
  beforeSet.forEach((url) => {
    if (!afterSet.has(url)) toDelete.push(url);
  });
  await deleteStorageByUrls(toDelete);
}

async function cleanupExpiredSold(path: 'cars' | 'parts', now: number) {
  const rootRef = admin.database().ref(path);

  // Use deleteAt for efficient querying (requires .indexOn deleteAt in RTDB rules).
  const snap = await rootRef.orderByChild('deleteAt').endAt(now).once('value');
  if (!snap.exists()) return { deleted: 0, examined: 0 };

  let deleted = 0;
  let examined = 0;

  const deletions: Array<Promise<void>> = [];

  snap.forEach((child) => {
    examined += 1;
    const value = (child.val() || {}) as ListingLike;
    const status = String(value.status || '');
    const deleteAt = Number(value.deleteAt || 0);

    if (status !== 'sold' || !deleteAt || deleteAt > now) {
      return;
    }

    const listingId = String(child.key);

    deletions.push(
      (async () => {
        try {
          await admin.database().ref(`${path}/${listingId}`).remove();
          deleted += 1;
        } catch {
          return;
        }
      })(),
    );
  });

  await Promise.allSettled(deletions);
  return { deleted, examined };
}

export const cleanupCarStorageOnDelete = onValueDeleted(
  {
    ref: '/cars/{carId}',
    region: 'europe-west1',
  },
  async (event) => {
    const value = (event.data.val() || null) as ListingLike | null;
    if (!value) return;
    await deleteStorageByUrls(collectListingMediaUrls(value));
  },
);

export const cleanupPartStorageOnDelete = onValueDeleted(
  {
    ref: '/parts/{partId}',
    region: 'europe-west1',
  },
  async (event) => {
    const value = (event.data.val() || null) as ListingLike | null;
    if (!value) return;
    await deleteStorageByUrls(collectListingMediaUrls(value));
  },
);

export const cleanupRequestStorageOnDelete = onValueDeleted(
  {
    ref: '/requests/{requestId}',
    region: 'europe-west1',
  },
  async (event) => {
    const value = (event.data.val() || null) as ListingLike | null;
    if (!value) return;
    await deleteStorageByUrls(collectListingMediaUrls(value));
  },
);

export const cleanupCarStorageOnUpdate = onValueUpdated(
  {
    ref: '/cars/{carId}',
    region: 'europe-west1',
  },
  async (event) => {
    const before = (event.data.before.val() || null) as ListingLike | null;
    const after = (event.data.after.val() || null) as ListingLike | null;
    await deleteRemovedStorageMedia(before, after);
  },
);

export const cleanupPartStorageOnUpdate = onValueUpdated(
  {
    ref: '/parts/{partId}',
    region: 'europe-west1',
  },
  async (event) => {
    const before = (event.data.before.val() || null) as ListingLike | null;
    const after = (event.data.after.val() || null) as ListingLike | null;
    await deleteRemovedStorageMedia(before, after);
  },
);

export const cleanupRequestStorageOnUpdate = onValueUpdated(
  {
    ref: '/requests/{requestId}',
    region: 'europe-west1',
  },
  async (event) => {
    const before = (event.data.before.val() || null) as ListingLike | null;
    const after = (event.data.after.val() || null) as ListingLike | null;
    await deleteRemovedStorageMedia(before, after);
  },
);

export const purgeSoldListings = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'Asia/Kuwait',
    region: 'europe-west1',
    timeoutSeconds: 540,
    memory: '256MiB',
    maxInstances: 1,
  },
  async () => {
    const now = Date.now();

    const [cars, parts] = await Promise.all([
      cleanupExpiredSold('cars', now),
      cleanupExpiredSold('parts', now),
    ]);

    logger.info('purgeSoldListings completed', {
      now,
      cars,
      parts,
    });
  },
);

export const purgeExpiredListings = onSchedule(
  {
    schedule: 'every 12 hours',
    timeZone: 'Asia/Kuwait',
    region: 'europe-west1',
    timeoutSeconds: 540,
    memory: '256MiB',
    maxInstances: 1,
  },
  async () => {
    const now = Date.now();
    const [cars, parts, requests] = await Promise.all([
      cleanupExpiredByAge('cars', now),
      cleanupExpiredByAge('parts', now),
      cleanupExpiredByAge('requests', now),
    ]);

    logger.info('purgeExpiredListings completed', { now, cars, parts, requests });
  },
);

export const syncSuperAdminClaims = functionsV1
  .region('europe-west1')
  .database.ref('/users/{uid}/isSuperAdmin')
  .onWrite(async (change, context) => {
    const uid = String(context.params.uid || '').trim();
    if (!uid) return;

    const nextIsSuperAdmin = change.after.exists() && change.after.val() === true;

    try {
      const user = await admin.auth().getUser(uid);
      const currentClaims = (user.customClaims || {}) as Record<string, unknown>;
      const current = currentClaims.superAdmin === true;

      if (current === nextIsSuperAdmin) return;

      const nextClaims: Record<string, unknown> = { ...currentClaims };
      if (nextIsSuperAdmin) {
        nextClaims.superAdmin = true;
      } else {
        delete nextClaims.superAdmin;
      }

      await admin.auth().setCustomUserClaims(uid, nextClaims);
      logger.info('syncSuperAdminClaims updated', { uid, nextIsSuperAdmin });
    } catch (error) {
      logger.warn('syncSuperAdminClaims failed', { uid, nextIsSuperAdmin, error });
    }
  });

export const cleanupPopupAdStorageOnDelete = functionsV1
  .region('europe-west1')
  .database.ref('/popupAds/{popupAdId}')
  .onDelete(async (snap) => {
    const value = (snap.val() || null) as ListingLike | null;
    if (!value) return;
    await deleteStorageByUrls(collectListingMediaUrls(value));
  });

export const cleanupPopupAdStorageOnUpdate = functionsV1
  .region('europe-west1')
  .database.ref('/popupAds/{popupAdId}')
  .onUpdate(async (change) => {
    const before = (change.before.val() || null) as ListingLike | null;
    const after = (change.after.val() || null) as ListingLike | null;
    await deleteRemovedStorageMedia(before, after);
  });

export const purgeExpiredPopupAds = functionsV1
  .region('europe-west1')
  .pubsub.schedule('every 6 hours')
  .timeZone('Asia/Kuwait')
  .onRun(async () => {
    const now = Date.now();
    const rootRef = admin.database().ref('popupAds');
    const snap = await rootRef.orderByChild('endDate').endAt(now).once('value');
    if (!snap.exists()) return null;

    const updates: Record<string, null> = {};
    let examined = 0;

    snap.forEach((child) => {
      examined += 1;
      const id = String(child.key || '');
      if (!id) return false;

      const value = (child.val() || {}) as any;
      const endDate = toTimestampMs(value.endDate);
      if (!endDate || endDate > now) return false;

      updates[id] = null;
      return false;
    });

    const keys = Object.keys(updates);
    if (!keys.length) {
      logger.info('purgeExpiredPopupAds noop', { now, examined });
      return null;
    }

    await rootRef.update(updates);
    logger.info('purgeExpiredPopupAds removed', { now, examined, deleted: keys.length });
    return null;
  });

export const bootstrapSuperAdminClaim = functionsV1
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'method_not_allowed' });
      return;
    }

    const authHeader = String(req.headers.authorization || '').trim();
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      res.status(401).json({ ok: false, error: 'missing_bearer_token' });
      return;
    }

    try {
      const decoded = await admin.auth().verifyIdToken(match[1], true);
      const uid = String(decoded.uid || '').trim();
      if (!uid) {
        res.status(401).json({ ok: false, error: 'invalid_token' });
        return;
      }

      const flagSnap = await admin.database().ref(`/users/${uid}/isSuperAdmin`).once('value');
      const isSuperAdmin = flagSnap.exists() && flagSnap.val() === true;
      if (!isSuperAdmin) {
        res.status(403).json({ ok: false, error: 'not_super_admin' });
        return;
      }

      const user = await admin.auth().getUser(uid);
      const currentClaims = (user.customClaims || {}) as Record<string, unknown>;
      const already = currentClaims.superAdmin === true;

      if (!already) {
        await admin.auth().setCustomUserClaims(uid, { ...currentClaims, superAdmin: true });
        logger.info('bootstrapSuperAdminClaim set', { uid });
      } else {
        logger.info('bootstrapSuperAdminClaim noop', { uid });
      }

      res.status(200).json({ ok: true, changed: !already });
    } catch (error) {
      logger.warn('bootstrapSuperAdminClaim failed', { error });
      res.status(500).json({ ok: false, error: 'internal_error' });
    }
  });
