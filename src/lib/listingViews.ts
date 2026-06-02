import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref as dbRef } from '@react-native-firebase/database';

import { db } from './firebase';

export type ListingCollection = 'cars' | 'parts' | 'requests';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function coerceNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export async function incrementListingViewsOncePerDay(collection: ListingCollection, id: string) {
  const day = todayKey();
  const storageKey = `q8:listings:views:${collection}:${id}:${day}`;

  try {
    const existing = await AsyncStorage.getItem(storageKey);
    if (existing) return null;
    await AsyncStorage.setItem(storageKey, '1');
  } catch {
    // If storage fails, proceed without throttling.
  }

  try {
    const viewsRef = dbRef(db, `${collection}/${id}/views`);
    const result = await (viewsRef as any).transaction((current: unknown) => coerceNumber(current) + 1);

    const nextViews = result?.snapshot?.val?.() ?? result?.snapshot?.val;
    const value = coerceNumber(typeof nextViews === 'function' ? nextViews() : nextViews);
    return value;
  } catch {
    return null;
  }
}
