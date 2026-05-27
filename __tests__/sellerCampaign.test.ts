import { buildSellerCampaign } from '../web/src/lib/seller-campaign';

describe('seller campaign', () => {
  it('awards free ads to the earliest qualified active sellers and ranks the leaderboard by score', () => {
    const now = 1_700_000_000_000;
    const campaign = buildSellerCampaign(
      [
        { slug: 'alpha', name: 'Alpha Garage', whatsapp: '96590000001', joinedLabel: 'من 2024' },
        { slug: 'beta', name: 'Beta Parts', whatsapp: '96590000002', joinedLabel: 'من 2024' },
        { slug: 'gamma', name: 'Gamma Wanted', whatsapp: '96590000003', joinedLabel: 'من 2024' },
      ],
      [
        { sellerSlug: 'alpha', kind: 'car', createdAt: now - 5_000, isActive: true },
        { sellerSlug: 'alpha', kind: 'part', createdAt: now - 4_000, isActive: true },
        { sellerSlug: 'beta', kind: 'car', createdAt: now - 10_000, isActive: true },
        { sellerSlug: 'beta', kind: 'wanted', createdAt: now - 9_000, isActive: true },
        { sellerSlug: 'gamma', kind: 'wanted', createdAt: now - 15_000, isActive: false },
        { sellerSlug: 'gamma', kind: 'part', createdAt: now - 14_000, isActive: true },
      ],
      {
        founderLimit: 2,
        minimumScore: 50,
        leaderboardSize: 3,
        now,
      },
    );

    expect(campaign.qualifiedFounders).toBe(2);
    expect(campaign.entries[0].sellerSlug).toBe('alpha');
    expect(campaign.entries[0].freeAdsEligible).toBe(false);
    expect(campaign.entries[1].sellerSlug).toBe('beta');
    expect(campaign.entries[1].founderPosition).toBe(2);
    expect(campaign.entries[2].sellerSlug).toBe('gamma');
    expect(campaign.entries[2].freeAdsEligible).toBe(true);
    expect(campaign.entries[2].founderPosition).toBe(1);
  });
});