"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CAR_BRANDS, PART_CATEGORIES } from "@/types";

type Tab = "cars" | "parts" | "requests" | "gallery" | "users";

export default function DashboardPage() {
  const { locale, t } = useLocale();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("cars");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/auth/login`);
  }, [user, authLoading, locale, router]);

  useEffect(() => {
    if (!user) return;
    fetchItems();
  }, [user, tab]);

  const fetchItems = async () => {
    if (!user) return;
    setLoadingItems(true);
    try {
      let q;
      if (isAdmin) {
        q = query(collection(db, tab), orderBy("createdAt", "desc"));
      } else {
        if (tab === "gallery" || tab === "users") { setMyItems([]); setLoadingItems(false); return; }
        q = query(collection(db, tab), where("userId", "==", user.uid));
      }
      const snap = await getDocs(q);
      setMyItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setMyItems([]);
    }
    setLoadingItems(false);
  };

  const uploadImages = async (files: FileList): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const r = ref(storage, `${tab}/${Date.now()}_${file.name}`);
      await uploadBytes(r, file);
      urls.push(await getDownloadURL(r));
    }
    return urls;
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === "ar" ? "متأكد تبي تحذف؟" : "Are you sure?")) return;
    await deleteDoc(doc(db, tab, id));
    setMyItems((p) => p.filter((i) => i.id !== id));
  };

  if (authLoading || !user) return <div className="text-center py-20 text-silver/50 animate-pulse">{t.common.loading}</div>;

  const userTabs: Tab[] = ["cars", "parts", "requests"];
  const adminTabs: Tab[] = ["cars", "parts", "requests", "gallery", "users"];
  const tabs = isAdmin ? adminTabs : userTabs;

  const tabLabels: Record<Tab, { icon: string; label: string }> = {
    cars: { icon: "🏎️", label: t.common.cars },
    parts: { icon: "⚙️", label: t.common.parts },
    requests: { icon: "📋", label: t.common.requests },
    gallery: { icon: "📸", label: t.common.gallery },
    users: { icon: "👥", label: locale === "ar" ? "المستخدمين" : "Users" },
  };

  const addLabels: Record<string, string> = {
    cars: t.cars.addCar,
    parts: t.parts.addPart,
    requests: t.requests.addRequest,
    gallery: locale === "ar" ? "إضافة صور" : "Add Photos",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {isAdmin && <span className="text-primary font-english text-sm bg-primary/10 border border-primary/30 px-2 py-0.5 rounded">ADMIN</span>}
          {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
        </h1>
      </div>
      <p className="text-silver/60 mb-8">
        {locale === "ar" ? `مرحبا، ${user.name}` : `Welcome, ${user.name}`}
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((t2) => (
          <button
            key={t2}
            onClick={() => { setTab(t2); setShowForm(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              tab === t2 ? "bg-primary text-white" : "bg-metal text-silver hover:bg-metal-light"
            }`}
          >
            <span>{tabLabels[t2].icon}</span>
            {tabLabels[t2].label}
            {!loadingItems && tab === t2 && <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{myItems.length}</span>}
          </button>
        ))}
      </div>

      {/* Add Button */}
      {tab !== "users" && (
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm mb-6">
          {showForm ? t.common.cancel : `+ ${addLabels[tab] || ""}`}
        </button>
      )}

      {/* Add Form */}
      {showForm && tab !== "users" && (
        <AddForm
          tab={tab}
          user={user}
          locale={locale}
          t={t}
          uploadImages={uploadImages}
          submitting={submitting}
          setSubmitting={setSubmitting}
          onDone={(item: any) => { setMyItems((p) => [item, ...p]); setShowForm(false); }}
        />
      )}

      {/* Items List */}
      {loadingItems ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-metal rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-metal rounded w-1/2" />
                <div className="h-3 bg-metal rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : myItems.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-4xl block mb-3">{tabLabels[tab].icon}</span>
          <p className="text-silver/50">{t.common.noResults}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myItems.map((item) => (
            <div key={item.id} className="card p-4 flex items-center justify-between hover-lift">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <span className="w-14 h-14 rounded-lg bg-metal flex items-center justify-center text-xl">
                    {tabLabels[tab].icon}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="text-white font-bold truncate">
                    {item.title?.[locale] || item.title?.ar || item.name || item.email || "—"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-silver/50 mt-0.5">
                    {item.brand && <span>{item.brand}</span>}
                    {item.year && <span>• {item.year}</span>}
                    {item.price && <span>• {item.price.toLocaleString()} {t.common.kwd}</span>}
                    {item.userName && tab === "users" && <span>{item.userName}</span>}
                    {item.phone && <span>📱 {item.phone}</span>}
                    {item.status && (
                      <span className={`${
                        item.status === "active" || item.status === "open" ? "text-green-400" :
                        item.status === "sold" ? "text-primary" : "text-yellow-400"
                      }`}>
                        • {item.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-primary hover:text-primary-dark text-sm font-bold ms-4 transition-colors">
                {t.common.delete}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddForm({ tab, user, locale, t, uploadImages, submitting, setSubmitting, onDone }: any) {
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [color, setColor] = useState("");
  const [transmission, setTransmission] = useState("automatic");
  const [fuelType, setFuelType] = useState("petrol");
  const [category, setCategory] = useState("engine");
  const [condition, setCondition] = useState("used");
  const [reqCategory, setReqCategory] = useState("car");
  const [images, setImages] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (images && images.length > 0) imageUrls = await uploadImages(images);

      let data: any = {
        userId: user.uid,
        userName: user.name,
        userWhatsapp: user.whatsapp,
        title: { ar: titleAr, en: titleEn || titleAr },
        description: { ar: descAr, en: descEn || descAr },
        status: tab === "requests" ? "open" : "active",
        createdAt: serverTimestamp(),
      };

      if (tab === "cars") {
        data = { ...data, brand, model, year: Number(year), price: Number(price), mileage: Number(mileage), color, transmission, fuelType, images: imageUrls };
      } else if (tab === "parts") {
        data = { ...data, category, condition, price: Number(price), compatibleBrands: [brand], images: imageUrls };
      } else if (tab === "requests") {
        data = { ...data, category: reqCategory, budget: price ? Number(price) : null };
      } else if (tab === "gallery") {
        data = { title: { ar: titleAr, en: titleEn || titleAr }, images: imageUrls, createdAt: serverTimestamp() };
      }

      const docRef = await addDoc(collection(db, tab), data);
      onDone({ id: docRef.id, ...data });
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4 animate-fadeInUp">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-silver text-sm mb-1 block">{locale === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}</label>
          <input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="text-silver text-sm mb-1 block">{locale === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="input-field" />
        </div>
      </div>

      {tab !== "gallery" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-silver text-sm mb-1 block">{locale === "ar" ? "الوصف (عربي)" : "Desc (Arabic)"}</label>
            <textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} className="input-field" rows={3} />
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{locale === "ar" ? "الوصف (إنجليزي)" : "Desc (English)"}</label>
            <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} className="input-field" rows={3} />
          </div>
        </div>
      )}

      {tab === "cars" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-silver text-sm mb-1 block">{t.common.brand}</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field" required>
                <option value="">--</option>
                {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-silver text-sm mb-1 block">{t.common.model}</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="text-silver text-sm mb-1 block">{t.common.year}</label>
              <input type="number" min="1960" value={year} onChange={(e) => setYear(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="text-silver text-sm mb-1 block">{t.common.price} ({t.common.kwd})</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" required />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-silver text-sm mb-1 block">{t.common.mileage}</label>
              <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-silver text-sm mb-1 block">{t.common.color}</label>
              <input value={color} onChange={(e) => setColor(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-silver text-sm mb-1 block">{t.common.transmission}</label>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="input-field">
                <option value="automatic">{t.common.automatic}</option>
                <option value="manual">{t.common.manual}</option>
              </select>
            </div>
            <div>
              <label className="text-silver text-sm mb-1 block">{t.common.fuelType}</label>
              <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="input-field">
                <option value="petrol">{t.common.petrol}</option>
                <option value="diesel">{t.common.diesel}</option>
                <option value="electric">{t.common.electric}</option>
                <option value="hybrid">{t.common.hybrid}</option>
              </select>
            </div>
          </div>
        </>
      )}

      {tab === "parts" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-silver text-sm mb-1 block">{t.parts.category}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
              {PART_CATEGORIES.map((c) => <option key={c} value={c}>{t.parts[c as keyof typeof t.parts] || c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{t.common.condition}</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input-field">
              <option value="new">{t.common.new}</option>
              <option value="used">{t.common.used}</option>
            </select>
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{t.common.brand}</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field">
              <option value="">--</option>
              {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{t.common.price} ({t.common.kwd})</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" required />
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-silver text-sm mb-1 block">{t.parts.category}</label>
            <select value={reqCategory} onChange={(e) => setReqCategory(e.target.value)} className="input-field">
              <option value="car">{t.requests.car}</option>
              <option value="part">{t.requests.part}</option>
              <option value="other">{t.parts.other}</option>
            </select>
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{t.requests.budget} ({t.common.kwd})</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" />
          </div>
        </div>
      )}

      {tab !== "requests" && (
        <div>
          <label className="text-silver text-sm mb-1 block">{locale === "ar" ? "الصور" : "Images"}</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)}
            className="input-field file:bg-primary file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:me-3 file:cursor-pointer" />
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
        {submitting ? t.common.loading : t.common.save}
      </button>
    </form>
  );
}
