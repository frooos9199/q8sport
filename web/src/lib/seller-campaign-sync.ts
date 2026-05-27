import { buildSellerCampaign } from "./seller-campaign";

type RawUser = {
  uid?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  createdAt?: unknown;
  disabled?: boolean;
};

type RawListing = {
  userId?: string;
  status?: string;
  createdAt?: unknown;
  category?: string;
};

type CampaignCounts = {
  cars: number;
  parts: number;
  wanted: number;
  active: number;
  total: number;
};

const EMPTY_COUNTS: CampaignCounts = {
  cars: 0,
  parts: 0,
  wanted: 0,
  active: 0,
  total: 0,
};

function normalizeNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizeTimestamp(value: unknown) {
  const numeric = normalizeNumber(value);
  if (numeric) return numeric;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function isBlockedPartCategory(category: unknown) {
  return typeof category === "string" && category.trim() === "عادم";
}

function formatJoinedLabel(value: unknown) {
  const timestamp = normalizeTimestamp(value);
  if (!timestamp) return "عضو جديد";
  return `من ${new Date(timestamp).getFullYear()}`;
}

function buildCampaignPayload(
  entry:
    | {
        activityScore: number;
        founderPosition?: number;
        freeAdsEligible: boolean;
        tierLabel: string;
        rewardLabel: string;
        listingCounts: CampaignCounts;
      }
    | undefined,
  now: number,
) {
  return {
    activityScore: entry?.activityScore || 0,
    founderPosition: entry?.founderPosition || 0,
    freeAdsEligible: Boolean(entry?.freeAdsEligible),
    tierLabel: entry?.tierLabel || "عضو السوق",
    rewardLabel: entry?.rewardLabel || "أكمل نشاطك لتحصل على امتياز الإعلانات المجانية.",
    listingCounts: entry?.listingCounts || EMPTY_COUNTS,
    updatedAt: now,
  };
}

export function buildSellerCampaignUpdates({
  usersNode,
  carsNode,
  partsNode,
  requestsNode,
  now = Date.now(),
}: {
  usersNode: Record<string, RawUser> | null;
  carsNode: Record<string, RawListing> | null;
  partsNode: Record<string, RawListing> | null;
  requestsNode: Record<string, RawListing> | null;
  now?: number;
}) {
  const allUsers = usersNode || {};
  const sellers = Object.entries(allUsers)
    .filter(([, user]) => !user?.disabled)
    .map(([uid, user]) => ({
      slug: uid,
      name: user.name?.trim() || "معلن السوق",
      whatsapp: user.whatsapp?.trim() || user.phone?.trim() || "",
      joinedLabel: formatJoinedLabel(user.createdAt),
    }));

  const campaign = buildSellerCampaign(
    sellers,
    [
      ...Object.values(carsNode || {}).map((item) => ({
        sellerSlug: item.userId || "",
        kind: "car" as const,
        createdAt: normalizeTimestamp(item.createdAt),
        isActive: item.status !== "sold" && item.status !== "pending",
      })),
      ...Object.values(partsNode || {})
        .filter((item) => !isBlockedPartCategory(item.category))
        .map((item) => ({
          sellerSlug: item.userId || "",
          kind: "part" as const,
          createdAt: normalizeTimestamp(item.createdAt),
          isActive: item.status !== "sold" && item.status !== "pending",
        })),
      ...Object.values(requestsNode || {}).map((item) => ({
        sellerSlug: item.userId || "",
        kind: "wanted" as const,
        createdAt: normalizeTimestamp(item.createdAt),
        isActive: item.status !== "closed",
      })),
    ].filter((item) => item.sellerSlug && allUsers[item.sellerSlug] && !allUsers[item.sellerSlug]?.disabled),
    {
      leaderboardSize: Math.max(sellers.length, 10),
      now,
    },
  );

  const campaignEntries = new Map(campaign.entries.map((entry) => [entry.sellerSlug, entry]));
  const updates: Record<string, ReturnType<typeof buildCampaignPayload>> = {};

  Object.keys(allUsers).forEach((uid) => {
    const user = allUsers[uid];
    const entry = user?.disabled ? undefined : campaignEntries.get(uid);
    updates[`users/${uid}/campaign`] = buildCampaignPayload(entry, now);
  });

  return {
    campaign,
    updates,
  };
}

export async function syncSellerCampaignState() {
  const { getAdminDb } = await import("./firebase-admin");
  const adminDb = getAdminDb();
  const [usersSnap, carsSnap, partsSnap, requestsSnap] = await Promise.all([
    adminDb.ref("users").get(),
    adminDb.ref("cars").get(),
    adminDb.ref("parts").get(),
    adminDb.ref("requests").get(),
  ]);

  const now = Date.now();
  const { campaign, updates } = buildSellerCampaignUpdates({
    usersNode: (usersSnap.val() as Record<string, RawUser> | null) || null,
    carsNode: (carsSnap.val() as Record<string, RawListing> | null) || null,
    partsNode: (partsSnap.val() as Record<string, RawListing> | null) || null,
    requestsNode: (requestsSnap.val() as Record<string, RawListing> | null) || null,
    now,
  });

  if (Object.keys(updates).length) {
    await adminDb.ref().update(updates);
  }

  return campaign;
}