export const INITIAL_TRIAL_POINTS = 50;
export const PUBLISH_POINT_COST = 2;
export const FOUNDER_LIMIT = 50;

type CampaignLike = {
  founderPosition?: number;
  freeAdsEligible?: boolean;
} | null | undefined;

export function hasFreeAdsEligibility(campaign: CampaignLike) {
  return Boolean(campaign?.freeAdsEligible || Number(campaign?.founderPosition || 0) > 0);
}

export type UserCredits = {
  trialPoints: number;
  paidPoints: number;
  totalSpentPoints: number;
  updatedAt: number;
};

export type ChargeDecision =
  | { ok: true; next: UserCredits }
  | { ok: false; current: UserCredits };

function asFiniteNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toSafeInt(value: unknown, fallback = 0) {
  return Math.max(0, Math.floor(asFiniteNumber(value, fallback)));
}

export function buildInitialCredits(now = Date.now()): UserCredits {
  return {
    trialPoints: INITIAL_TRIAL_POINTS,
    paidPoints: 0,
    totalSpentPoints: 0,
    updatedAt: now,
  };
}

export function normalizeUserCredits(raw: unknown, now = Date.now()): UserCredits {
  const value = (raw || {}) as Partial<UserCredits>;
  return {
    trialPoints: toSafeInt(value.trialPoints, INITIAL_TRIAL_POINTS),
    paidPoints: toSafeInt(value.paidPoints, 0),
    totalSpentPoints: toSafeInt(value.totalSpentPoints, 0),
    updatedAt: toSafeInt(value.updatedAt, now),
  };
}

export function getTotalCredits(raw: unknown) {
  const credits = normalizeUserCredits(raw);
  return credits.trialPoints + credits.paidPoints;
}

export function resolveChargeCredits(raw: unknown, cost = PUBLISH_POINT_COST, now = Date.now()): ChargeDecision {
  const current = normalizeUserCredits(raw, now);
  const safeCost = Math.max(1, Math.floor(cost));
  const available = current.trialPoints + current.paidPoints;

  if (available < safeCost) {
    return { ok: false, current };
  }

  const trialUsed = Math.min(current.trialPoints, safeCost);
  const paidUsed = safeCost - trialUsed;

  return {
    ok: true,
    next: {
      trialPoints: current.trialPoints - trialUsed,
      paidPoints: current.paidPoints - paidUsed,
      totalSpentPoints: current.totalSpentPoints + safeCost,
      updatedAt: now,
    },
  };
}