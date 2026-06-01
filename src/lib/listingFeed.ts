import { InteractionManager } from 'react-native';
import { limitToLast, orderByChild, query, ref as dbRef } from '@react-native-firebase/database';

import { db } from './firebase';
import { getDbSnapshot } from './firebaseDatabase';
import { getListingThumbnailUrl } from './listingImages';
import { prefetchAdImages } from './prefetchAdImages';
import { sortListingsByFreshnessAndStatus } from './listingSort';

type ListingWithImages = {
  id: string;
  thumbnailUrl?: string;
  images?: string[];
  imageThumbs?: string[];
  imageMediums?: string[];
  status?: string;
  createdAt?: any;
  updatedAt?: any;
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

function isExpiredByAge(listing: ListingWithImages, now = Date.now()) {
  const updatedAt = toTimestampMs(listing.updatedAt);
  const createdAt = toTimestampMs(listing.createdAt);
  const lastTouch = updatedAt || createdAt;
  if (!lastTouch) return false;
  return lastTouch <= now - LISTING_TTL_MS;
}

const IMAGE_PREFETCH_TIMEOUT_MS = 1500;

function isBlockedPartCategory(category: unknown) {
  return typeof category === 'string' && category.trim() === 'عادم';
}

export async function fetchSortedListings<T extends ListingWithImages>(path: string, limit?: number) {
  const baseRef = dbRef(db, path);
  const listingsQuery = limit
    ? query(baseRef, orderByChild('createdAt'), limitToLast(limit))
    : query(baseRef, orderByChild('createdAt'));

  const snap = await getDbSnapshot(listingsQuery, path);
  const data: T[] = [];

  snap.forEach((child: any) => {
    data.push({ id: child.key, ...child.val() });
    return undefined;
  });

  const visibleData = path === 'parts'
    ? data.filter(item => !isBlockedPartCategory((item as { category?: unknown }).category))
    : data;

  const now = Date.now();
  const withoutExpired = visibleData.filter(item => !isExpiredByAge(item, now));

  return sortListingsByFreshnessAndStatus(withoutExpired) as T[];
}

export async function prefetchListingImages<T extends ListingWithImages>(items: T[], count = 10) {
  const urls = items
    .flatMap(item => {
      const image = getListingThumbnailUrl(item);
      return image ? [image] : [];
    })
    .slice(0, count);

  if (!urls.length) return;

  await Promise.race([
    Promise.resolve(prefetchAdImages(urls, count)),
    new Promise(resolve => setTimeout(resolve, IMAGE_PREFETCH_TIMEOUT_MS)),
  ]);
}

export function runAfterFirstPaint(task: () => Promise<void> | void) {
  InteractionManager.runAfterInteractions(() => {
    Promise.resolve(task()).catch(() => undefined);
  });
}