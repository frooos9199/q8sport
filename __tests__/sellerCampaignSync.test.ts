import { buildSellerCampaignUpdates } from '../web/src/lib/seller-campaign-sync';

describe('seller campaign sync', () => {
  it('persists campaign state for qualified and non-qualified users', () => {
    const now = 1_700_000_000_000;
    const { updates } = buildSellerCampaignUpdates({
      usersNode: {
        'web-1': { uid: 'web-1', name: 'Alpha', whatsapp: '96590000001', createdAt: now - 20_000 },
        'web-2': { uid: 'web-2', name: 'Beta', whatsapp: '96590000002', createdAt: now - 18_000 },
        'web-3': { uid: 'web-3', name: 'Gamma', whatsapp: '96590000003', createdAt: now - 16_000 },
      },
      carsNode: {
        a: { userId: 'web-2', status: 'active', createdAt: now - 10_000 },
        b: { userId: 'web-1', status: 'active', createdAt: now - 9_000 },
      },
      partsNode: {
        c: { userId: 'web-1', status: 'active', createdAt: now - 8_000 },
      },
      requestsNode: {
        d: { userId: 'web-3', status: 'open', createdAt: now - 7_000 },
      },
      now,
    });

    expect(updates['users/web-1/campaign'].freeAdsEligible).toBe(true);
    expect(updates['users/web-1/campaign'].founderPosition).toBe(2);
    expect(updates['users/web-2/campaign'].freeAdsEligible).toBe(true);
    expect(updates['users/web-2/campaign'].founderPosition).toBe(1);
    expect(updates['users/web-3/campaign'].freeAdsEligible).toBe(false);
    expect(updates['users/web-3/campaign'].activityScore).toBeGreaterThan(0);
  });

  it('resets disabled users to a non-qualified campaign state', () => {
    const now = 1_700_000_000_000;
    const { updates } = buildSellerCampaignUpdates({
      usersNode: {
        'web-disabled': { uid: 'web-disabled', name: 'Disabled', whatsapp: '96590000099', createdAt: now - 20_000, disabled: true },
      },
      carsNode: {
        a: { userId: 'web-disabled', status: 'active', createdAt: now - 10_000 },
      },
      partsNode: null,
      requestsNode: null,
      now,
    });

    expect(updates['users/web-disabled/campaign'].freeAdsEligible).toBe(false);
    expect(updates['users/web-disabled/campaign'].activityScore).toBe(0);
  });
});