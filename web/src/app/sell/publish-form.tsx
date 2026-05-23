"use client";

import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { canUseFirebaseStorage, storage } from "@/lib/firebase-client";

type PublishType = "car" | "part" | "request";

const CAR_BRANDS = ["Porsche", "BMW", "Mercedes-Benz", "Audi", "Ford", "Chevrolet", "Dodge", "Nissan", "Toyota", "Other"];
const PART_CATEGORIES = ["مكينة", "قير", "رنجات", "عادم", "داخلية", "بودي كت", "فرامل", "كمبيوتر", "أخرى"];
const COMPATIBLE_BRANDS = ["Porsche", "BMW", "Mercedes-Benz", "Audi", "Ford", "Chevrolet", "Dodge", "Nissan", "Toyota"];

const initialState = {
  sellerName: "",
  sellerWhatsapp: "",
  website: "",
  title: "",
  description: "",
  imageUrls: "",
  brand: "Porsche",
  model: "",
  year: "",
  price: "",
  mileage: "",
  color: "",
  transmission: "automatic",
  fuelType: "petrol",
  category: "مكينة",
  condition: "used",
  compatibleBrands: ["Ford"],
  budget: "",
  requestCategory: "car",
};

export default function PublishForm() {
  const [type, setType] = useState<PublishType>("car");
  const [form, setForm] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const setField = <K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleCompatibleBrand = (brand: string) => {
    setForm((current) => ({
      ...current,
      compatibleBrands: current.compatibleBrands.includes(brand)
        ? current.compatibleBrands.filter((item) => item !== brand)
        : [...current.compatibleBrands, brand],
    }));
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files.slice(0, 6));
  };

  const uploadSelectedFiles = async () => {
    if (!selectedFiles.length) return [] as string[];

    if (!canUseFirebaseStorage()) {
      throw new Error("إعدادات Firebase Storage غير مكتملة على الويب");
    }

    setUploading(true);
    try {
      const folder = `${type}/${Date.now()}-${crypto.randomUUID()}`;
      const uploadedUrls = await Promise.all(
        selectedFiles.map(async (file, index) => {
          const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]+/g, "-").toLowerCase();
          const fileRef = ref(storage, `web-uploads/${folder}/${index}-${safeName || `image.${extension}`}`);

          await uploadBytes(fileRef, file, {
            contentType: file.type || `image/${extension}`,
          });

          return getDownloadURL(fileRef);
        }),
      );

      return uploadedUrls;
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const uploadedImageUrls = await uploadSelectedFiles();
      const manualImageUrls = form.imageUrls
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const response = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          type,
          sellerName: form.sellerName,
          sellerWhatsapp: form.sellerWhatsapp,
          website: form.website,
          title: form.title,
          description: form.description,
          imageUrls: [...uploadedImageUrls, ...manualImageUrls],
          brand: form.brand,
          model: form.model,
          year: form.year,
          price: form.price,
          mileage: form.mileage,
          color: form.color,
          transmission: form.transmission,
          fuelType: form.fuelType,
          category: form.category,
          condition: form.condition,
          compatibleBrands: form.compatibleBrands,
          budget: form.budget,
          requestCategory: form.requestCategory,
        }),
      });

      const result = (await response.json()) as { error?: string; sellerId?: string };
      if (!response.ok) {
        throw new Error(result.error || "تعذر نشر الإعلان");
      }

      setMessage({ kind: "success", text: `تم نشر الإعلان مباشرة. ملف المعلن أصبح متاحًا على /sellers/${result.sellerId}` });
      setForm(initialState);
      setSelectedFiles([]);
      setFileInputKey((current) => current + 1);
      setType("car");
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "تعذر نشر الإعلان" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 grid gap-6">
      <section className="rounded-[2rem] border border-line bg-panel p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Publishing Mode</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Picker active={type === "car"} label="سيارة" onClick={() => setType("car")} />
          <Picker active={type === "part"} label="قطعة" onClick={() => setType("part")} />
          <Picker active={type === "request"} label="مطلوب" onClick={() => setType("request")} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-line bg-panel p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Seller</p>
          <div className="mt-5 grid gap-4">
            <Field label="اسم المعلن" value={form.sellerName} onChange={(value) => setField("sellerName", value)} placeholder="مثال: فيصل الجراج" />
            <Field label="واتساب" value={form.sellerWhatsapp} onChange={(value) => setField("sellerWhatsapp", value)} placeholder="96590001122" />
            <ViewTrap value={form.website} onChange={(value) => setField("website", value)} />
            <Field label="عنوان الإعلان" value={form.title} onChange={(value) => setField("title", value)} placeholder="مثال: مكينة موستنغ 5.0 كاملة" />
            <Field label="الوصف" value={form.description} onChange={(value) => setField("description", value)} placeholder="اكتب التفاصيل المهمة والحالة والملاحظات" multiline />
            <label className="grid gap-2">
              <span className="text-sm font-black text-foreground">رفع الصور من الجهاز</span>
              <input
                key={fileInputKey}
                type="file"
                accept="image/*"
                multiple
                onChange={onFileChange}
                className="w-full rounded-[1.1rem] border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-sm font-bold text-white file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
              />
              <p className="text-xs leading-6 text-zinc-500">يمكنك رفع حتى 6 صور مباشرة إلى Firebase Storage.</p>
              {selectedFiles.length ? (
                <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-3 text-xs font-bold text-zinc-300">
                  {selectedFiles.map((file) => file.name).join(" • ")}
                </div>
              ) : null}
            </label>
            <Field
              label="روابط صور إضافية"
              value={form.imageUrls}
              onChange={(value) => setField("imageUrls", value)}
              placeholder="اختياري: ضع كل رابط في سطر مستقل"
              multiline
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-panel p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Details</p>

          {type === "car" ? (
            <div className="mt-5 grid gap-4">
              <div>
                <p className="mb-3 text-sm font-black text-foreground">الماركة</p>
                <div className="flex flex-wrap gap-2">
                  {CAR_BRANDS.map((brand) => (
                    <Picker key={brand} compact active={form.brand === brand} label={brand} onClick={() => setField("brand", brand)} />
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="الموديل" value={form.model} onChange={(value) => setField("model", value)} placeholder="GT-R / M4 / Turbo S" />
                <Field label="السنة" value={form.year} onChange={(value) => setField("year", value)} placeholder="2022" />
                <Field label="السعر" value={form.price} onChange={(value) => setField("price", value)} placeholder="41500" />
                <Field label="الممشى" value={form.mileage} onChange={(value) => setField("mileage", value)} placeholder="18000" />
                <Field label="اللون" value={form.color} onChange={(value) => setField("color", value)} placeholder="رمادي" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="ناقل الحركة" value={form.transmission} onChange={(value) => setField("transmission", value as "automatic" | "manual")} options={[{ value: "automatic", label: "أوتوماتيك" }, { value: "manual", label: "عادي" }]} />
                <Select label="الوقود" value={form.fuelType} onChange={(value) => setField("fuelType", value as "petrol" | "diesel" | "electric" | "hybrid")} options={[{ value: "petrol", label: "بنزين" }, { value: "diesel", label: "ديزل" }, { value: "electric", label: "كهرباء" }, { value: "hybrid", label: "هايبرد" }]} />
              </div>
            </div>
          ) : null}

          {type === "part" ? (
            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="التصنيف" value={form.category} onChange={(value) => setField("category", value)} options={PART_CATEGORIES.map((item) => ({ value: item, label: item }))} />
                <Select label="الحالة" value={form.condition} onChange={(value) => setField("condition", value as "new" | "used")} options={[{ value: "used", label: "مستعمل" }, { value: "new", label: "جديد" }]} />
              </div>
              <Field label="السعر" value={form.price} onChange={(value) => setField("price", value)} placeholder="980" />
              <div>
                <p className="mb-3 text-sm font-black text-foreground">التوافق</p>
                <div className="flex flex-wrap gap-2">
                  {COMPATIBLE_BRANDS.map((brand) => (
                    <Picker key={brand} compact active={form.compatibleBrands.includes(brand)} label={brand} onClick={() => toggleCompatibleBrand(brand)} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {type === "request" ? (
            <div className="mt-5 grid gap-4">
              <Select label="نوع المطلوب" value={form.requestCategory} onChange={(value) => setField("requestCategory", value as "car" | "part" | "other")} options={[{ value: "car", label: "سيارة" }, { value: "part", label: "قطعة" }, { value: "other", label: "أخرى" }]} />
              <Field label="الميزانية" value={form.budget} onChange={(value) => setField("budget", value)} placeholder="2200" />
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" disabled={submitting || uploading} className="rounded-full bg-brand px-6 py-4 text-sm font-black text-white transition hover:bg-[#ff5b4e] disabled:cursor-not-allowed disabled:opacity-60">
              {uploading ? "جاري رفع الصور..." : submitting ? "جاري النشر..." : "نشر مباشرة"}
            </button>
            <p className="text-sm leading-7 text-zinc-400">يتم النشر فورًا على نفس مسارات السوق بدون طبقة موافقات.</p>
          </div>

          {message ? (
            <div className={`mt-5 rounded-[1.25rem] border px-4 py-4 text-sm font-bold ${message.kind === "success" ? "border-mint/30 bg-mint/10 text-mint" : "border-brand/25 bg-brand/10 text-[#ff8a80]"}`}>
              {message.text}
            </div>
          ) : null}
        </div>
      </section>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean }) {
  const className = "w-full rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-500 focus:border-brand/40";

  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-foreground">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${className} min-h-32 resize-y`} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-foreground">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand/40">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Picker({ active, label, onClick, compact = false }: { active: boolean; label: string; onClick: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-3 text-sm font-black transition ${compact ? "" : "w-full"} ${active ? "border-brand/40 bg-brand/15 text-white" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"}`}
    >
      {label}
    </button>
  );
}

function ViewTrap({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="hidden" aria-hidden="true">
      <label className="grid gap-2">
        <span>Website</span>
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
    </div>
  );
}