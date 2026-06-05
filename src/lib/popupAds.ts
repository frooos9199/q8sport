import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref as dbRef } from '@react-native-firebase/database';

import { db } from './firebase';
import { getDbSnapshot } from './firebaseDatabase';

export type PopupAdRepeatType = 'every_open' | 'daily' | 'weekly' | 'once';
export type PopupAdLinkType = 'none' | 'internal' | 'external';

export type PopupAd = {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  isActive: boolean;
  startDate: number; // ms
  endDate: number; // ms
  repeatType: PopupAdRepeatType;
  priority: number;
  linkType: PopupAdLinkType;
  linkUrl?: string;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
};

const DISMISS_PREFIX = 'popup-ad:dismissed:';
const SESSION_SHOWN = new Set<string>();

function toMillis(value: any): number | null {
  if (!value) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
    const d = Date.parse(value);
    return Number.isFinite(d) ? d : null;
  }

  // Firestore Timestamp
  if (typeof value?.toMillis === 'function') {
    const ms = value.toMillis();
    return typeof ms === 'number' && Number.isFinite(ms) ? ms : null;
  }

  // Date
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  return null;
}

function normalizeRepeatType(value: any): PopupAdRepeatType {
  return value === 'daily' || value === 'weekly' || value === 'once' || value === 'every_open'
    ? value
    : 'every_open';
}

function normalizeLinkType(value: any): PopupAdLinkType {
  return value === 'internal' || value === 'external' || value === 'none' ? value : 'none';
}

function isInDateWindow(ad: PopupAd, nowMs: number) {
  return nowMs >= ad.startDate && nowMs <= ad.endDate;
}

function hours(n: number) {
  return n * 60 * 60 * 1000;
}

async function getLastDismissedAt(adId: string): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(`${DISMISS_PREFIX}${adId}`);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

async function shouldShowByRepeatType(ad: PopupAd, nowMs: number): Promise<boolean> {
  if (SESSION_SHOWN.has(ad.id)) return false;

  const lastDismissedAt = await getLastDismissedAt(ad.id);

  if (ad.repeatType === 'every_open') {
    return true;
  }

  if (ad.repeatType === 'once') {
    return lastDismissedAt == null;
  }

  if (ad.repeatType === 'daily') {
    return lastDismissedAt == null || nowMs - lastDismissedAt >= hours(24);
  }

  if (ad.repeatType === 'weekly') {
    return lastDismissedAt == null || nowMs - lastDismissedAt >= hours(24 * 7);
  }

  return true;
}

function docToPopupAd(doc: any): PopupAd | null {
  const data = doc.data?.() ?? doc;
  if (!data) return null;

  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl.trim() : '';
  if (!imageUrl) return null;

  const startDate = toMillis(data.startDate);
  const endDate = toMillis(data.endDate);
  if (!startDate || !endDate) return null;

  return {
    id: doc.id || String(data.id || ''),
    title: typeof data.title === 'string' ? data.title : undefined,
    description: typeof data.description === 'string' ? data.description : undefined,
    imageUrl,
    isActive: data.isActive === true,
    startDate,
    endDate,
    repeatType: normalizeRepeatType(data.repeatType),
    priority: typeof data.priority === 'number' && Number.isFinite(data.priority) ? data.priority : 0,
    linkType: normalizeLinkType(data.linkType),
    linkUrl: typeof data.linkUrl === 'string' ? data.linkUrl : undefined,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : undefined,
    createdAt: toMillis(data.createdAt) || undefined,
    updatedAt: toMillis(data.updatedAt) || undefined,
  };
}

function sortPopupAds(items: PopupAd[]) {
  return [...items].sort((left, right) => {
    const leftPriority = typeof left.priority === 'number' && Number.isFinite(left.priority) ? left.priority : 0;
    const rightPriority = typeof right.priority === 'number' && Number.isFinite(right.priority) ? right.priority : 0;
    if (leftPriority !== rightPriority) return rightPriority - leftPriority;
    return Number(right.updatedAt || right.createdAt || 0) - Number(left.updatedAt || left.createdAt || 0);
  });
}

export async function fetchPopupAdsCandidates(options?: { limit?: number }): Promise<PopupAd[]> {
  const limit = Math.max(1, Math.min(options?.limit ?? 20, 100));
  const snap = await getDbSnapshot(dbRef(db, 'popupAds'), 'popupAds', { showAlert: false });
  const list: PopupAd[] = [];

  snap.forEach((child: any) => {
    const id = child.key;
    const data = child.val?.();
    const ad = docToPopupAd({ id, ...data });
    if (ad) list.push(ad);
    return undefined;
  });

  return sortPopupAds(list).filter((ad) => ad.isActive).slice(0, limit);
}

export async function pickPopupAdToShow(nowMs = Date.now()): Promise<PopupAd | null> {
  try {
    const candidates = await fetchPopupAdsCandidates({ limit: 20 });
    const inWindow = candidates.filter(ad => ad.isActive && isInDateWindow(ad, nowMs));

    for (const ad of inWindow) {
      // Highest priority first already.
      // eslint-disable-next-line no-await-in-loop
      const ok = await shouldShowByRepeatType(ad, nowMs);
      if (ok) {
        SESSION_SHOWN.add(ad.id);
        return ad;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function markPopupAdDismissed(adId: string, nowMs = Date.now()): Promise<void> {
  SESSION_SHOWN.add(adId);
  try {
    await AsyncStorage.setItem(`${DISMISS_PREFIX}${adId}`, String(nowMs));
  } catch {
    // ignore
  }
}
