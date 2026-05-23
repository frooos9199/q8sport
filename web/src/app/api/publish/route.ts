import { NextResponse } from "next/server";

import { runtimeConfig } from "@/lib/runtime-config";

type PublishType = "car" | "part" | "request";

type PublishPayload = {
  type: PublishType;
  sellerName: string;
  sellerWhatsapp: string;
  website?: string;
  title: string;
  description: string;
  imageUrls?: string[];
  brand?: string;
  model?: string;
  year?: string;
  price?: string;
  mileage?: string;
  color?: string;
  transmission?: "automatic" | "manual";
  fuelType?: "petrol" | "diesel" | "electric" | "hybrid";
  category?: string;
  condition?: "new" | "used";
  compatibleBrands?: string[];
  budget?: string;
  requestCategory?: "car" | "part" | "other";
};

function getProjectId() {
  return runtimeConfig.firebase.projectId;
}

function getDatabaseUrl() {
  return runtimeConfig.firebase.databaseUrl || `https://${getProjectId()}-default-rtdb.firebaseio.com`;
}

function digits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function sellerId(name: string, whatsapp: string) {
  const phone = digits(whatsapp);
  if (phone) return `web-${phone}`;
  return `web-${slugify(name) || "seller"}`;
}

function parseNumber(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeImages(imageUrls?: string[]) {
  return (imageUrls || []).map((url) => url.trim()).filter(Boolean).slice(0, 6);
}

async function write(path: string, method: "POST" | "PUT", body: unknown) {
  const response = await fetch(`${getDatabaseUrl()}/${path}.json`, {
    method,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Firebase write failed");
  }

  return response.json();
}

function validateCommon(payload: PublishPayload) {
  if ((payload.website || '').trim().length > 0) {
    return 'تعذر إرسال النموذج';
  }
  if (payload.sellerName.trim().length < 2) {
    return "اسم المعلن قصير جدًا";
  }
  if (digits(payload.sellerWhatsapp).length < 8) {
    return "رقم الواتساب غير صالح";
  }
  if (payload.title.trim().length < 3) {
    return "عنوان الإعلان قصير جدًا";
  }
  if (payload.description.trim().length < 10) {
    return "الوصف يحتاج تفاصيل أكثر";
  }
  if (payload.title.trim().length > 120) {
    return 'عنوان الإعلان أطول من اللازم';
  }
  if (payload.description.trim().length > 3000) {
    return 'الوصف أطول من اللازم';
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PublishPayload;
    const commonError = validateCommon(payload);
    if (commonError) {
      return NextResponse.json({ error: commonError }, { status: 400 });
    }

    const uid = sellerId(payload.sellerName, payload.sellerWhatsapp);
    const now = Date.now();
    const images = normalizeImages(payload.imageUrls);

    await write(`users/${uid}`, "PUT", {
      uid,
      name: payload.sellerName.trim(),
      email: "",
      phone: digits(payload.sellerWhatsapp),
      whatsapp: digits(payload.sellerWhatsapp),
      createdAt: now,
    });

    if (payload.type === "car") {
      const year = parseNumber(payload.year);
      const price = parseNumber(payload.price);
      if (!year || !price || !payload.brand?.trim() || !payload.model?.trim()) {
        return NextResponse.json({ error: "بيانات السيارة ناقصة" }, { status: 400 });
      }

      const result = await write("cars", "POST", {
        userId: uid,
        userName: payload.sellerName.trim(),
        userWhatsapp: digits(payload.sellerWhatsapp),
        title: { ar: payload.title.trim(), en: payload.title.trim() },
        description: { ar: payload.description.trim(), en: payload.description.trim() },
        brand: payload.brand.trim(),
        model: payload.model.trim(),
        year,
        price,
        mileage: parseNumber(payload.mileage) || 0,
        color: payload.color?.trim() || "",
        transmission: payload.transmission || "automatic",
        fuelType: payload.fuelType || "petrol",
        images,
        status: "active",
        createdAt: now,
      });

      return NextResponse.json({ ok: true, type: payload.type, listingId: result.name, sellerId: uid });
    }

    if (payload.type === "part") {
      const price = parseNumber(payload.price);
      if (!price || !payload.category?.trim()) {
        return NextResponse.json({ error: "بيانات القطعة ناقصة" }, { status: 400 });
      }

      const result = await write("parts", "POST", {
        userId: uid,
        userName: payload.sellerName.trim(),
        userWhatsapp: digits(payload.sellerWhatsapp),
        title: { ar: payload.title.trim(), en: payload.title.trim() },
        description: { ar: payload.description.trim(), en: payload.description.trim() },
        category: payload.category.trim(),
        compatibleBrands: payload.compatibleBrands?.length ? payload.compatibleBrands : [],
        price,
        condition: payload.condition || "used",
        images,
        status: "active",
        createdAt: now,
      });

      return NextResponse.json({ ok: true, type: payload.type, listingId: result.name, sellerId: uid });
    }

    const result = await write("requests", "POST", {
      userId: uid,
      userName: payload.sellerName.trim(),
      userWhatsapp: digits(payload.sellerWhatsapp),
      title: { ar: payload.title.trim(), en: payload.title.trim() },
      description: { ar: payload.description.trim(), en: payload.description.trim() },
      category: payload.requestCategory || "other",
      budget: parseNumber(payload.budget),
      status: "open",
      createdAt: now,
    });

    return NextResponse.json({ ok: true, type: payload.type, listingId: result.name, sellerId: uid });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر نشر الإعلان";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}