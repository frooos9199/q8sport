import { buildInitialCredits, getTotalCredits, normalizeUserCredits, resolveChargeCredits } from '../src/lib/userCreditsCore';

describe('user credits', () => {
  it('builds the default onboarding credits', () => {
    const credits = buildInitialCredits(1_700_000_000_000);
    expect(credits.trialPoints).toBe(50);
    expect(credits.paidPoints).toBe(0);
    expect(credits.totalSpentPoints).toBe(0);
  });

  it('charges trial points first', () => {
    const decision = resolveChargeCredits({ trialPoints: 2, paidPoints: 3, totalSpentPoints: 0 }, 1, 123);
    expect(decision.ok).toBe(true);
    if (!decision.ok) return;

    expect(decision.next.trialPoints).toBe(1);
    expect(decision.next.paidPoints).toBe(3);
    expect(decision.next.totalSpentPoints).toBe(1);
  });

  it('falls back to paid points when trial points are exhausted', () => {
    const decision = resolveChargeCredits({ trialPoints: 0, paidPoints: 5, totalSpentPoints: 3 }, 1, 123);
    expect(decision.ok).toBe(true);
    if (!decision.ok) return;

    expect(decision.next.trialPoints).toBe(0);
    expect(decision.next.paidPoints).toBe(4);
    expect(decision.next.totalSpentPoints).toBe(4);
  });

  it('rejects charge when available balance is insufficient', () => {
    const decision = resolveChargeCredits({ trialPoints: 0, paidPoints: 0, totalSpentPoints: 0 }, 1, 123);
    expect(decision.ok).toBe(false);
  });

  it('normalizes missing data with onboarding defaults', () => {
    const credits = normalizeUserCredits(undefined, 123);
    expect(getTotalCredits(credits)).toBe(50);
  });
});
