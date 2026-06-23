import { ref as dbRef } from '@react-native-firebase/database';

import { db } from './firebase';
import {
  PUBLISH_POINT_COST,
  buildInitialCredits,
  resolveChargeCredits,
} from './userCreditsCore';

export const FEATURED_LISTING_POINT_COST = 5;

export {
  FOUNDER_LIMIT,
  INITIAL_TRIAL_POINTS,
  PUBLISH_POINT_COST,
  buildInitialCredits,
  hasFreeAdsEligibility,
  normalizeUserCredits,
  getTotalCredits,
  resolveChargeCredits,
} from './userCreditsCore';

import type { ChargeDecision } from './userCreditsCore';

export async function consumeUserCredits(uid: string, cost: number) {
  const creditsRef = dbRef(db, `users/${uid}/credits`);
  let decision: ChargeDecision = { ok: false, current: buildInitialCredits() };
  let chargedCredits = buildInitialCredits();

  const result = await (creditsRef as any).transaction((current: unknown) => {
    decision = resolveChargeCredits(current, cost, Date.now());
    if (!decision.ok) {
      return;
    }
    chargedCredits = decision.next;
    return chargedCredits;
  });

  if (!result?.committed || !decision.ok) {
    return {
      ok: false as const,
      credits: decision.current,
    };
  }

  return {
    ok: true as const,
    credits: chargedCredits,
  };
}

export async function consumeOnePublishPoint(uid: string) {
  return consumeUserCredits(uid, PUBLISH_POINT_COST);
}