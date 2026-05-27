export type CampaignSeller = {
  slug: string;
  name: string;
  whatsapp: string;
  joinedLabel: string;
};

export type CampaignListing = {
  sellerSlug: string;
  kind: "car" | "part" | "wanted";
  createdAt: number;
  isActive: boolean;
};

export type SellerCampaignEntry = {
  sellerSlug: string;
  sellerName: string;
  whatsapp: string;
  joinedLabel: string;
  activityScore: number;
  founderPosition?: number;
  freeAdsEligible: boolean;
  tierLabel: string;
  rewardLabel: string;
  listingCounts: {
    cars: number;
    parts: number;
    wanted: number;
    active: number;
    total: number;
  };
};

export type SellerCampaign = {
  founderLimit: number;
  minimumScore: number;
  entries: SellerCampaignEntry[];
  qualifiedFounders: number;
};

type SellerAggregate = {
  seller: CampaignSeller;
  cars: number;
  parts: number;
  wanted: number;
  active: number;
  total: number;
  firstActivityAt: number;
  lastActivityAt: number;
  activityScore: number;
};

const SCORE = {
  car: 40,
  part: 24,
  wanted: 12,
  active: 18,
  recentBonus: 10,
};

const RECENT_ACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function compareFounders(left: SellerAggregate, right: SellerAggregate) {
  if (left.firstActivityAt !== right.firstActivityAt) {
    return left.firstActivityAt - right.firstActivityAt;
  }
  if (left.activityScore !== right.activityScore) {
    return right.activityScore - left.activityScore;
  }
  return left.seller.slug.localeCompare(right.seller.slug);
}

function compareLeaderboard(left: SellerAggregate, right: SellerAggregate) {
  if (left.activityScore !== right.activityScore) {
    return right.activityScore - left.activityScore;
  }
  if (left.active !== right.active) {
    return right.active - left.active;
  }
  if (left.firstActivityAt !== right.firstActivityAt) {
    return left.firstActivityAt - right.firstActivityAt;
  }
  return left.seller.slug.localeCompare(right.seller.slug);
}

function makeTierLabel(founderPosition: number | undefined, activityScore: number) {
  if (founderPosition === 1) return "رائد السوق";
  if (founderPosition && founderPosition <= 3) return "مؤسس ذهبي";
  if (founderPosition) return "مؤسس نشط";
  if (activityScore >= 100) return "نخبة السوق";
  if (activityScore >= 60) return "مرشح للنخبة";
  return "عضو نشط";
}

function makeRewardLabel(founderPosition: number | undefined) {
  if (founderPosition) return "إعلانات مجانية دائمًا";
  return "نشاطك الحالي يقربك من الامتياز";
}

export function buildSellerCampaign(
  sellers: CampaignSeller[],
  listings: CampaignListing[],
  options?: {
    founderLimit?: number;
    minimumScore?: number;
    leaderboardSize?: number;
    now?: number;
  },
): SellerCampaign {
  const founderLimit = options?.founderLimit ?? 10;
  const minimumScore = options?.minimumScore ?? 60;
  const leaderboardSize = options?.leaderboardSize ?? 10;
  const now = options?.now ?? Date.now();
  const sellerMap = new Map(sellers.map((seller) => [seller.slug, seller]));
  const aggregates = new Map<string, SellerAggregate>();

  listings.forEach((listing, index) => {
    const seller = sellerMap.get(listing.sellerSlug);
    if (!seller) return;

    const createdAt = listing.createdAt || index + 1;
    const current = aggregates.get(listing.sellerSlug) || {
      seller,
      cars: 0,
      parts: 0,
      wanted: 0,
      active: 0,
      total: 0,
      firstActivityAt: createdAt,
      lastActivityAt: createdAt,
      activityScore: 0,
    };

    current.total += 1;
    current.firstActivityAt = Math.min(current.firstActivityAt, createdAt);
    current.lastActivityAt = Math.max(current.lastActivityAt, createdAt);

    if (listing.kind === "car") current.cars += 1;
    if (listing.kind === "part") current.parts += 1;
    if (listing.kind === "wanted") current.wanted += 1;
    if (listing.isActive) current.active += 1;

    aggregates.set(listing.sellerSlug, current);
  });

  const metrics = Array.from(aggregates.values()).map((item) => {
    const recentBonus = now - item.lastActivityAt <= RECENT_ACTIVITY_WINDOW_MS ? SCORE.recentBonus : 0;

    return {
      ...item,
      activityScore:
        item.cars * SCORE.car +
        item.parts * SCORE.part +
        item.wanted * SCORE.wanted +
        item.active * SCORE.active +
        recentBonus,
    };
  });

  const founders = metrics
    .filter((item) => item.active > 0 && item.activityScore >= minimumScore)
    .sort(compareFounders)
    .slice(0, founderLimit);

  const founderRanks = new Map(founders.map((item, index) => [item.seller.slug, index + 1]));

  const entries = metrics
    .sort(compareLeaderboard)
    .slice(0, leaderboardSize)
    .map((item) => {
      const founderPosition = founderRanks.get(item.seller.slug);

      return {
        sellerSlug: item.seller.slug,
        sellerName: item.seller.name,
        whatsapp: item.seller.whatsapp,
        joinedLabel: item.seller.joinedLabel,
        activityScore: item.activityScore,
        founderPosition,
        freeAdsEligible: Boolean(founderPosition),
        tierLabel: makeTierLabel(founderPosition, item.activityScore),
        rewardLabel: makeRewardLabel(founderPosition),
        listingCounts: {
          cars: item.cars,
          parts: item.parts,
          wanted: item.wanted,
          active: item.active,
          total: item.total,
        },
      };
    });

  return {
    founderLimit,
    minimumScore,
    entries,
    qualifiedFounders: founders.length,
  };
}