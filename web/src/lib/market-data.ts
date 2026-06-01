export type Seller = {
  slug: string;
  name: string;
  city: string;
  whatsapp: string;
  joinedLabel: string;
  responseLabel: string;
  bio: string;
};

export type SellerCampaignEntry = import("@/lib/seller-campaign").SellerCampaignEntry;

export type SellerCampaign = import("@/lib/seller-campaign").SellerCampaign;

export type CarListing = {
  slug: string;
  sellerSlug: string;
  title: string;
  price: string;
  featuredAt?: number;
  year: string;
  mileage: string;
  location: string;
  summary: string;
  status: string;
  specs: string[];
  images: string[];
};

export type PartListing = {
  slug: string;
  sellerSlug: string;
  title: string;
  price: string;
  featuredAt?: number;
  category: string;
  fitment: string;
  condition: string;
  summary: string;
  images: string[];
};

export type WantedListing = {
  slug: string;
  sellerSlug: string;
  title: string;
  budget: string;
  category: string;
  urgency: string;
  summary: string;
};

export type MarketSnapshot = {
  source: "firebase" | "fallback";
  sellers: Seller[];
  carListings: CarListing[];
  partListings: PartListing[];
  wantedListings: WantedListing[];
  campaign: SellerCampaign;
};

type RawLocalizedText = string | { ar?: string; en?: string } | null | undefined;

type RawUser = {
  name?: string;
  phone?: string;
  whatsapp?: string;
  createdAt?: unknown;
};

type RawCar = {
  userId?: string;
  userName?: string;
  userWhatsapp?: string;
  title?: RawLocalizedText;
  description?: RawLocalizedText;
  brand?: string;
  model?: string;
  year?: number | string;
  price?: number | string;
  mileage?: number | string;
  color?: string;
  transmission?: string;
  fuelType?: string;
  images?: string[];
  status?: string;
  createdAt?: unknown;
  featuredAt?: unknown;
};

type RawPart = {
  userId?: string;
  userName?: string;
  userWhatsapp?: string;
  title?: RawLocalizedText;
  description?: RawLocalizedText;
  category?: string;
  compatibleBrands?: string[];
  price?: number | string;
  condition?: string;
  images?: string[];
  status?: string;
  createdAt?: unknown;
  featuredAt?: unknown;
};

function isBlockedPartCategory(category: unknown) {
  return typeof category === "string" && category.trim() === "عادم";
}

type RawRequest = {
  userId?: string;
  userName?: string;
  userWhatsapp?: string;
  title?: RawLocalizedText;
  description?: RawLocalizedText;
  category?: string;
  budget?: number | string;
  status?: string;
  createdAt?: unknown;
};

import { buildSellerCampaign } from "@/lib/seller-campaign";

const fallbackSellers: Seller[] = [
  {
    slug: "faisal-garage",
    name: "فيصل الجراج",
    city: "الكويت",
    whatsapp: "+96590001122",
    joinedLabel: "من 2024",
    responseLabel: "يرد غالبًا خلال ساعة",
    bio: "مهتم بالسيارات الأمريكية والقطع الثقيلة، ويركز على المعروض النظيف والمطلوبات الجادة.",
  },
  {
    slug: "bader-rs",
    name: "بدر RS",
    city: "حولي",
    whatsapp: "+96595554411",
    joinedLabel: "من 2023",
    responseLabel: "يرد غالبًا خلال 30 دقيقة",
    bio: "مختص بأوربيات السبورت، خصوصًا بورش وAMG، وينزل معروضات قليلة لكنها ملفتة.",
  },
  {
    slug: "turbo-zone",
    name: "Turbo Zone",
    city: "الفروانية",
    whatsapp: "+96597773311",
    joinedLabel: "من 2025",
    responseLabel: "نشط يوميًا",
    bio: "معلن نشط في القطع والمكائن والعوادم والتجهيزات السريعة للسيارات الرياضية.",
  },
];

const fallbackCarListings: CarListing[] = [
  {
    slug: "porsche-911-turbo-s-2022",
    sellerSlug: "bader-rs",
    title: "Porsche 911 Turbo S",
    price: "41,500 د.ك",
    year: "2022",
    mileage: "18 ألف كم",
    location: "حولي",
    summary: "وكالة الكويت، لون كرايون، داخلية جلد أحمر، سيارة تلفت النظر وتصلح للمستخدم الجاد.",
    status: "معروض الآن",
    specs: ["Sport Chrono", "Carbon interior", "Bose audio", "Full service history"],
    images: [],
  },
  {
    slug: "bmw-m4-competition-2023",
    sellerSlug: "bader-rs",
    title: "BMW M4 Competition",
    price: "27,900 د.ك",
    year: "2023",
    mileage: "12 ألف كم",
    location: "الشويخ",
    summary: "وارد الخليج، عداد قليل، مواصفات عالية، جاهزة للمستخدم أو للتبديل بمعروض مميز.",
    status: "معروض الآن",
    specs: ["Bucket seats", "Adaptive suspension", "M Drive Pro", "Ceramic coating"],
    images: [],
  },
  {
    slug: "ford-mustang-gt-2021",
    sellerSlug: "faisal-garage",
    title: "Ford Mustang GT 5.0",
    price: "16,800 د.ك",
    year: "2021",
    mileage: "64 ألف كم",
    location: "الأحمدي",
    summary: "تعديل خفيف ومحترم، صوت جميل، والاستخدام واضح ونظيف. مناسبة لمن يبي V8 جاهز.",
    status: "معروض الآن",
    specs: ["Borla exhaust", "Cold air intake", "Performance package", "Fresh tires"],
    images: [],
  },
];

const fallbackPartListings: PartListing[] = [
  {
    slug: "mustang-engine-5-0-complete",
    sellerSlug: "turbo-zone",
    title: "مكينة موستنغ 5.0 كاملة",
    price: "2,450 د.ك",
    category: "مكينة",
    fitment: "Ford Mustang 2018-2022",
    condition: "مستعمل نظيف",
    summary: "مكينة كاملة مع الضفيرة والملحقات الرئيسية، مناسبة لمشروع أو تبديل سريع.",
    images: [],
  },
  {
    slug: "amg-oem-wheels-21",
    sellerSlug: "bader-rs",
    title: "رنجات AMG أصلية 21",
    price: "980 د.ك",
    category: "رنجات",
    fitment: "Mercedes AMG",
    condition: "شبه جديد",
    summary: "مقاس 21، نظيفة جدًا، وتصلح للي يبي شكل عدواني بدون لعب.",
    images: [],
  },
];

const fallbackWantedListings: WantedListing[] = [
  {
    slug: "wanted-ford-engine-50",
    sellerSlug: "faisal-garage",
    title: "مطلوب مكينة فورد 5.0 كاملة",
    budget: "2,200 د.ك",
    category: "طلب قطعة",
    urgency: "مستعجل هذا الأسبوع",
    summary: "مطلوب مكينة كاملة مع الملحقات الأساسية، ويفضل تكون مجربة أو مفحوصة بشكل محترم.",
  },
  {
    slug: "wanted-porsche-rs-wheels-21",
    sellerSlug: "bader-rs",
    title: "مطلوب رنجات Porsche RS مقاس 21",
    budget: "450 د.ك",
    category: "طلب قطعة",
    urgency: "خلال أيام",
    summary: "مطلوب طقم نظيف بدون لحامات ولا تصليح ثقيل، والأولوية للقطع الأصلية.",
  },
  {
    slug: "wanted-corvette-z06-clean",
    sellerSlug: "faisal-garage",
    title: "مطلوب كورفيت Z06 نظيفة",
    budget: "حسب الحالة",
    category: "طلب سيارة",
    urgency: "مستمر",
    summary: "مطلوب كورفيت وكالة أو نظيفة جدًا، بدون حوادث مؤثرة، والعداد المنخفض أفضل.",
  },
];

const fallbackSnapshot: MarketSnapshot = {
  source: "fallback",
  sellers: fallbackSellers,
  carListings: fallbackCarListings,
  partListings: fallbackPartListings,
  wantedListings: fallbackWantedListings,
  campaign: buildSellerCampaign(
    fallbackSellers.map((seller) => ({
      slug: seller.slug,
      name: seller.name,
      whatsapp: seller.whatsapp,
      joinedLabel: seller.joinedLabel,
    })),
    [
      ...fallbackCarListings.map((item, index) => ({ sellerSlug: item.sellerSlug, kind: "car" as const, createdAt: index + 1, isActive: item.status === "معروض الآن" })),
      ...fallbackPartListings.map((item, index) => ({ sellerSlug: item.sellerSlug, kind: "part" as const, createdAt: fallbackCarListings.length + index + 1, isActive: true })),
      ...fallbackWantedListings.map((item, index) => ({ sellerSlug: item.sellerSlug, kind: "wanted" as const, createdAt: fallbackCarListings.length + fallbackPartListings.length + index + 1, isActive: true })),
    ],
    { now: fallbackCarListings.length + fallbackPartListings.length + fallbackWantedListings.length + 30 },
  ),
};

function getProjectId() {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "q8sportcar";
}

function getDatabaseUrl() {
  return process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || `https://${getProjectId()}-default-rtdb.firebaseio.com`;
}

function normalizeText(value: RawLocalizedText, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback;
  if (value && typeof value === "object") {
    return value.ar?.trim() || value.en?.trim() || fallback;
  }
  return fallback;
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
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

function formatCurrency(value: unknown, fallback = "على السوم") {
  const amount = normalizeNumber(value);
  if (amount == null) return fallback;
  return `${amount.toLocaleString("en-US")} د.ك`;
}

function formatMileage(value: unknown) {
  const amount = normalizeNumber(value);
  if (amount == null) return "غير محدد";
  return `${amount.toLocaleString("en-US")} كم`;
}

function formatYear(value: unknown) {
  const amount = normalizeNumber(value);
  if (amount == null) return "غير محدد";
  return String(Math.trunc(amount));
}

function formatJoinedLabel(value: unknown) {
  const timestamp = normalizeTimestamp(value);
  if (!timestamp) return "عضو جديد";
  return `من ${new Date(timestamp).getFullYear()}`;
}

function mapCarStatus(status?: string) {
  if (status === "sold") return "مباع";
  if (status === "pending") return "محجوز";
  return "معروض الآن";
}

function mapRequestStatus(status?: string) {
  if (status === "closed") return "مغلق";
  return "مفتوح الآن";
}

function mapCondition(condition?: string) {
  if (condition === "new") return "جديد";
  if (condition === "used") return "مستعمل";
  return condition || "غير محدد";
}

function mapRequestCategory(category?: string) {
  if (category === "car") return "طلب سيارة";
  if (category === "part") return "طلب قطعة";
  return "طلب عام";
}

function mapTransmission(transmission?: string) {
  if (transmission === "manual") return "عادي";
  if (transmission === "automatic") return "أوتوماتيك";
  return undefined;
}

function mapFuel(fuelType?: string) {
  if (fuelType === "petrol") return "بنزين";
  if (fuelType === "diesel") return "ديزل";
  if (fuelType === "electric") return "كهرباء";
  if (fuelType === "hybrid") return "هايبرد";
  return undefined;
}

function normalizeImages(images: unknown) {
  if (!Array.isArray(images)) return [];
  return images.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function withoutCreatedAt<T extends { createdAt: number }>(item: T): Omit<T, "createdAt"> {
  const { createdAt, ...rest } = item;
  void createdAt;
  return rest;
}

function makeSellerMap(
  usersNode: Record<string, RawUser> | null,
  listingOwners: Array<{ sellerSlug: string; fallbackName: string; fallbackWhatsapp: string }>,
) {
  const sellers = new Map<string, Seller>();

  Object.entries(usersNode || {}).forEach(([slug, user]) => {
    sellers.set(slug, {
      slug,
      name: user.name?.trim() || "معلن السوق",
      city: "الكويت",
      whatsapp: user.whatsapp?.trim() || user.phone?.trim() || "",
      joinedLabel: formatJoinedLabel(user.createdAt),
      responseLabel: "تواصل مباشر عبر واتساب",
      bio: "معلن فعلي داخل سوق Q8 Sport Market. يعرض مباشرة من التطبيق بدون طبقة إدارة وسيطة.",
    });
  });

  listingOwners.forEach(({ sellerSlug, fallbackName, fallbackWhatsapp }) => {
    if (sellers.has(sellerSlug)) return;
    sellers.set(sellerSlug, {
      slug: sellerSlug,
      name: fallbackName || "معلن السوق",
      city: "الكويت",
      whatsapp: fallbackWhatsapp || "",
      joinedLabel: "عضو السوق",
      responseLabel: "تواصل مباشر",
      bio: "معلن فعلي داخل سوق Q8 Sport Market، وتم توليد هذا الملف من بيانات الإعلان نفسه.",
    });
  });

  return sellers;
}

async function readCollection<T>(collection: string) {
  const url = `${getDatabaseUrl()}/${collection}.json`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as Record<string, T> | null;
    if (!data || typeof data !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

export async function loadMarketData(): Promise<MarketSnapshot> {
  const [carsNode, partsNode, requestsNode, usersNode] = await Promise.all([
    readCollection<RawCar>("cars"),
    readCollection<RawPart>("parts"),
    readCollection<RawRequest>("requests"),
    readCollection<RawUser>("users"),
  ]);

  if (!carsNode && !partsNode && !requestsNode) {
    return fallbackSnapshot;
  }

  const listingOwners = [
    ...Object.entries(carsNode || {}).map(([, item]) => ({
      sellerSlug: item.userId || "unknown-seller",
      fallbackName: item.userName || "معلن سيارة",
      fallbackWhatsapp: item.userWhatsapp || "",
    })),
    ...Object.entries(partsNode || {})
      .filter(([, item]) => !isBlockedPartCategory(item.category))
      .map(([, item]) => ({
      sellerSlug: item.userId || "unknown-seller",
      fallbackName: item.userName || "معلن قطعة",
      fallbackWhatsapp: item.userWhatsapp || "",
    })),
    ...Object.entries(requestsNode || {}).map(([, item]) => ({
      sellerSlug: item.userId || "unknown-seller",
      fallbackName: item.userName || "طالب",
      fallbackWhatsapp: item.userWhatsapp || "",
    })),
  ].filter((item) => item.sellerSlug !== "unknown-seller");

  const sellers = makeSellerMap(usersNode, listingOwners);

  const carListings = Object.entries(carsNode || {})
    .map(([slug, item]) => {
      const sellerSlug = item.userId || "unknown-seller";
      const specs = [item.brand, item.model, item.color, mapTransmission(item.transmission), mapFuel(item.fuelType)].filter(
        (value): value is string => Boolean(value),
      );

      return {
        slug,
        sellerSlug,
        title: normalizeText(item.title, item.model || item.brand || "سيارة معروضة"),
        price: formatCurrency(item.price),
        featuredAt: normalizeTimestamp(item.featuredAt) || 0,
        year: formatYear(item.year),
        mileage: formatMileage(item.mileage),
        location: "الكويت",
        summary: normalizeText(item.description, "إعلان سيارة مباشرة من التطبيق."),
        status: mapCarStatus(item.status),
        specs: specs.length ? specs : ["تفاصيل أكثر داخل الإعلان"],
        images: normalizeImages(item.images),
        createdAt: normalizeTimestamp(item.createdAt),
        isActive: item.status !== "sold" && item.status !== "pending",
      };
    })
    .sort((left, right) => {
      const featuredDiff = (right.featuredAt || 0) - (left.featuredAt || 0);
      if (featuredDiff) return featuredDiff;
      return right.createdAt - left.createdAt;
    })
    .map(withoutCreatedAt);

  const partListings = Object.entries(partsNode || {})
    .filter(([, item]) => !isBlockedPartCategory(item.category))
    .map(([slug, item]) => ({
      slug,
      sellerSlug: item.userId || "unknown-seller",
      title: normalizeText(item.title, item.category || "قطعة معروضة"),
      price: formatCurrency(item.price),
      featuredAt: normalizeTimestamp(item.featuredAt) || 0,
      category: item.category?.trim() || "قطع غيار",
      fitment: item.compatibleBrands?.length ? item.compatibleBrands.join(" / ") : "توافق غير محدد",
      condition: mapCondition(item.condition),
      summary: normalizeText(item.description, "إعلان قطعة غيار مباشرة من التطبيق."),
      images: normalizeImages(item.images),
      createdAt: normalizeTimestamp(item.createdAt),
      isActive: item.status !== "sold" && item.status !== "pending",
    }))
    .sort((left, right) => {
      const featuredDiff = (right.featuredAt || 0) - (left.featuredAt || 0);
      if (featuredDiff) return featuredDiff;
      return right.createdAt - left.createdAt;
    })
    .map(withoutCreatedAt);

  const wantedListings = Object.entries(requestsNode || {})
    .map(([slug, item]) => ({
      slug,
      sellerSlug: item.userId || "unknown-seller",
      title: normalizeText(item.title, "مطلوب الآن"),
      budget: formatCurrency(item.budget, "حسب الحالة"),
      category: mapRequestCategory(item.category),
      urgency: mapRequestStatus(item.status),
      summary: normalizeText(item.description, "طلب مباشر من السوق."),
      createdAt: normalizeTimestamp(item.createdAt),
      isActive: item.status !== "closed",
    }))
    .sort((left, right) => right.createdAt - left.createdAt)
    .map(withoutCreatedAt);

  const counts = new Map<string, { cars: number; parts: number; wanted: number }>();
  const countFor = (slug: string) => counts.get(slug) || { cars: 0, parts: 0, wanted: 0 };

  carListings.forEach((item) => counts.set(item.sellerSlug, { ...countFor(item.sellerSlug), cars: countFor(item.sellerSlug).cars + 1 }));
  partListings.forEach((item) => counts.set(item.sellerSlug, { ...countFor(item.sellerSlug), parts: countFor(item.sellerSlug).parts + 1 }));
  wantedListings.forEach((item) => counts.set(item.sellerSlug, { ...countFor(item.sellerSlug), wanted: countFor(item.sellerSlug).wanted + 1 }));

  counts.forEach((value, slug) => {
    const seller = sellers.get(slug);
    if (!seller) return;
    seller.bio = `يعرض ${value.cars} سيارة و${value.parts} قطعة و${value.wanted} طلبات حالية داخل السوق.`;
  });

  const campaign = buildSellerCampaign(
    Array.from(sellers.values()).map((seller) => ({
      slug: seller.slug,
      name: seller.name,
      whatsapp: seller.whatsapp,
      joinedLabel: seller.joinedLabel,
    })),
    [
      ...Object.entries(carsNode || {}).map(([, item]) => ({
        sellerSlug: item.userId || "unknown-seller",
        kind: "car" as const,
        createdAt: normalizeTimestamp(item.createdAt),
        isActive: item.status !== "sold" && item.status !== "pending",
      })),
      ...Object.entries(partsNode || {})
        .filter(([, item]) => !isBlockedPartCategory(item.category))
        .map(([, item]) => ({
        sellerSlug: item.userId || "unknown-seller",
        kind: "part" as const,
        createdAt: normalizeTimestamp(item.createdAt),
        isActive: item.status !== "sold" && item.status !== "pending",
      })),
      ...Object.entries(requestsNode || {}).map(([, item]) => ({
        sellerSlug: item.userId || "unknown-seller",
        kind: "wanted" as const,
        createdAt: normalizeTimestamp(item.createdAt),
        isActive: item.status !== "closed",
      })),
    ].filter((item) => item.sellerSlug !== "unknown-seller"),
  );

  return {
    source: "firebase",
    sellers: Array.from(sellers.values()),
    carListings,
    partListings,
    wantedListings,
    campaign,
  };
}

export async function getSeller(slug: string) {
  const market = await loadMarketData();
  return market.sellers.find((seller) => seller.slug === slug);
}

export async function getCar(slug: string) {
  const market = await loadMarketData();
  return market.carListings.find((car) => car.slug === slug);
}

export async function getPart(slug: string) {
  const market = await loadMarketData();
  return market.partListings.find((part) => part.slug === slug);
}

export async function getWanted(slug: string) {
  const market = await loadMarketData();
  return market.wantedListings.find((wanted) => wanted.slug === slug);
}

export async function getSellerFeed(slug: string) {
  const market = await loadMarketData();
  return {
    cars: market.carListings.filter((car) => car.sellerSlug === slug),
    parts: market.partListings.filter((part) => part.sellerSlug === slug),
    wanted: market.wantedListings.filter((wanted) => wanted.sellerSlug === slug),
  };
}