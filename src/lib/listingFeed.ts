import { Image, InteractionManager } from 'react-native';
import { limitToLast, orderByChild, query, ref as dbRef } from '@react-native-firebase/database';

import { db } from './firebase';
import { getDbSnapshot } from './firebaseDatabase';
import { getListingPreviewImage } from './listingImages';
import { sortListingsByFreshnessAndStatus } from './listingSort';

type ListingWithImages = {
  id: string;
  images?: string[];
  imageThumbs?: string[];
  status?: string;
  createdAt?: any;
  updatedAt?: any;
};

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

  return sortListingsByFreshnessAndStatus(visibleData) as T[];
}

export async function prefetchListingImages<T extends ListingWithImages>(items: T[], count = 10) {
  const urls = items
    .flatMap(item => {
      const image = getListingPreviewImage(item);
      return image ? [image] : [];
    })
    .slice(0, count);

  if (!urls.length) return;

  await Promise.race([
    Promise.allSettled(urls.map(url => Image.prefetch(url))),
    new Promise(resolve => setTimeout(resolve, IMAGE_PREFETCH_TIMEOUT_MS)),
  ]);
}

export function runAfterFirstPaint(task: () => Promise<void> | void) {
  InteractionManager.runAfterInteractions(() => {
    Promise.resolve(task()).catch(() => undefined);
  });
}