import { NextResponse } from "next/server";

import { getAdminDb, getAdminStorageBucket } from "@/lib/firebase-admin";
import { enforcePublishRateLimit } from "@/lib/publish-rate-limit";
import { syncSellerCampaignState } from "@/lib/seller-campaign-sync";
import { digits, normalizeImages, type PublishPayload, type PublishType, validateCommon } from "@/lib/publish-validation";

export const runtime = "nodejs";

type PublishFiles = {
  imageFiles: File[];
};

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

async function write(path: string, method: "POST" | "PUT", body: unknown) {
  const adminDb = getAdminDb();

  if (method === "PUT") {
    await adminDb.ref(path).set(body);
    return { ok: true };
  }

  const ref = adminDb.ref(path).push();
  await ref.set(body);
  return { name: ref.key };
}

async function upsertUser(uid: string, sellerName: string, sellerWhatsapp: string, now: number) {
  const adminDb = getAdminDb();
  const userRef = adminDb.ref(`users/${uid}`);
  const snapshot = await userRef.get();
  const existingUser = snapshot.exists() ? (snapshot.val() as Record<string, unknown>) : null;

  await userRef.set({
    ...(existingUser || {}),
    uid,
    name: sellerName.trim(),
    email: typeof existingUser?.email === "string" ? existingUser.email : "",
    phone: digits(sellerWhatsapp),
    whatsapp: digits(sellerWhatsapp),
    disabled: false,
    createdAt: existingUser?.createdAt || now,
    updatedAt: now,
  });
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

async function uploadImages(type: PublishType, files: File[]) {
  if (!files.length) {
    return [] as string[];
  }

  if (files.length > 6) {
    throw new Error("الحد الأقصى 6 صور");
  }

  const bucket = getAdminStorageBucket();
  const folder = `web-uploads/${type}/${Date.now()}-${crypto.randomUUID()}`;

  return Promise.all(
    files.map(async (file, index) => {
      if (!file.type.startsWith("image/")) {
        throw new Error("يسمح فقط برفع الصور");
      }

      if (file.size > 8 * 1024 * 1024) {
        throw new Error("حجم الصورة كبير جدًا");
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = sanitizeFileName(file.name) || `image-${index}.${extension}`;
      const path = `${folder}/${index}-${safeName}`;
      const uploadedFile = bucket.file(path);
      const buffer = Buffer.from(await file.arrayBuffer());

      await uploadedFile.save(buffer, {
        resumable: false,
        metadata: {
          contentType: file.type || `image/${extension}`,
          cacheControl: "public, max-age=31536000, immutable",
        },
      });

      return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;
    }),
  );
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: FormDataEntryValue | null) {
  const normalized = asString(value).trim();
  return normalized || undefined;
}

function asStringArray(values: FormDataEntryValue[]) {
  return values.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean);
}

async function parseRequest(request: Request): Promise<{ payload: PublishPayload; files: PublishFiles }> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    return {
      payload: {
        type: asString(formData.get("type")) as PublishType,
        sellerName: asString(formData.get("sellerName")),
        sellerWhatsapp: asString(formData.get("sellerWhatsapp")),
        website: asOptionalString(formData.get("website")),
        title: asString(formData.get("title")),
        description: asString(formData.get("description")),
        imageUrls: asStringArray(formData.getAll("imageUrls")),
        brand: asOptionalString(formData.get("brand")),
        model: asOptionalString(formData.get("model")),
        year: asOptionalString(formData.get("year")),
        price: asOptionalString(formData.get("price")),
        mileage: asOptionalString(formData.get("mileage")),
        color: asOptionalString(formData.get("color")),
        transmission: asOptionalString(formData.get("transmission")) as PublishPayload["transmission"],
        fuelType: asOptionalString(formData.get("fuelType")) as PublishPayload["fuelType"],
        category: asOptionalString(formData.get("category")),
        condition: asOptionalString(formData.get("condition")) as PublishPayload["condition"],
        compatibleBrands: asStringArray(formData.getAll("compatibleBrands")),
        budget: asOptionalString(formData.get("budget")),
        requestCategory: asOptionalString(formData.get("requestCategory")) as PublishPayload["requestCategory"],
      },
      files: {
        imageFiles: formData.getAll("imageFiles").filter((value): value is File => value instanceof File && value.size > 0),
      },
    };
  }

  return {
    payload: (await request.json()) as PublishPayload,
    files: { imageFiles: [] },
  };
}

export async function POST(request: Request) {
  try {
    const { payload, files } = await parseRequest(request);
    const commonError = validateCommon(payload);
    if (commonError) {
      return NextResponse.json({ error: commonError }, { status: 400 });
    }

    const rateLimit = await enforcePublishRateLimit(request, payload);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${rateLimit.retryAfterSeconds} ثانية.`,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'retry-after': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const uid = sellerId(payload.sellerName, payload.sellerWhatsapp);
    const now = Date.now();
    const uploadedImages = await uploadImages(payload.type, files.imageFiles);
    const images = normalizeImages([...(payload.imageUrls || []), ...uploadedImages]);

    await upsertUser(uid, payload.sellerName, payload.sellerWhatsapp, now);

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

      await syncSellerCampaignState();

      return NextResponse.json({ ok: true, type: payload.type, listingId: result.name, sellerId: uid });
    }

    if (payload.type === "part") {
      const price = parseNumber(payload.price);
      if (!price || !payload.category?.trim()) {
        return NextResponse.json({ error: "بيانات القطعة ناقصة" }, { status: 400 });
      }

      if (payload.category.trim() === "عادم") {
        return NextResponse.json({ error: "فئة العادم غير مسموح بعرضها أو بيعها" }, { status: 400 });
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

      await syncSellerCampaignState();

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

    await syncSellerCampaignState();

    return NextResponse.json({ ok: true, type: payload.type, listingId: result.name, sellerId: uid });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر نشر الإعلان";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}