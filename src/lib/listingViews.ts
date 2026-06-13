import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref as dbRef } from '@react-native-firebase/database';

import { db } from './firebase';

export type ListingCollection = 'cars' | 'parts' | 'requests';

const VIEW_BOOST_START_MIN = 110;
const VIEW_BOOST_START_MAX = 230;
const VIEW_BOOST_DAILY_MIN = 24;
const VIEW_BOOST_DAILY_MAX = 62;
const DAY_MS = 24 * 60 * 60 * 1000;
const VIEW_BOOST_DELAY_MS = 30 * 60 * 1000;
const VIEW_BOOST_RAMP_MS = 8 * 60 * 60 * 1000;

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

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed: string) {
  return (hashString(seed) % 10000) / 10000;
}

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

function easeOutCubic(t: number) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

export function getBoostedListingViews(rawViews: unknown, createdAt: unknown, listingId?: string, now = Date.now()) {
  const baseViews = coerceNumber(rawViews);
  const createdAtMs = coerceNumber(createdAt);

  if (!createdAtMs) {
    return baseViews;
  }

  const elapsedMs = Math.max(0, now - createdAtMs);
  if (elapsedMs <= VIEW_BOOST_DELAY_MS) {
    return baseViews;
  }

  const daysLive = Math.max(1, Math.floor((now - createdAtMs) / DAY_MS) + 1);

  const seedBase = `${String(listingId || '')}:${createdAtMs}`;
  const startBoost = Math.floor(lerp(VIEW_BOOST_START_MIN, VIEW_BOOST_START_MAX, seededUnit(`${seedBase}:start`)));
  const dailyBoost = Math.floor(lerp(VIEW_BOOST_DAILY_MIN, VIEW_BOOST_DAILY_MAX, seededUnit(`${seedBase}:daily`)));

  const taperedDays = daysLive <= 14 ? daysLive : 14 + (daysLive - 14) * 0.58;
  const engagementNudge = Math.min(180, Math.floor(Math.sqrt(baseViews) * 6));
  const dailyVariance = 1 + seededUnit(`${seedBase}:variance`) * 0.18;
  const targetBoost = Math.floor((startBoost + dailyBoost * taperedDays + engagementNudge) * dailyVariance);

  const rampProgress = Math.min(1, Math.max(0, (elapsedMs - VIEW_BOOST_DELAY_MS) / VIEW_BOOST_RAMP_MS));
  const gradualBoost = Math.floor(targetBoost * easeOutCubic(rampProgress));

  return baseViews + gradualBoost;
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
