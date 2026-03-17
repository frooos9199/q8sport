"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CAR_BRANDS, PART_CATEGORIES } from "@/types";

type Tab = "cars" | "parts" | "requests" | "gallery" | "users";

export default function DashboardPage() {
  const { locale, t } = useLocale();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("cars");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, tab, id), { status: newStatus });
    setMyItems((p) => p.map((i) => i.id === id ? { ...i, status: newStatus } : i));
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleUpdate = async (id: string, data: any) => {
    await updateDoc(doc(db, tab, id), data);
    setMyItems((p) => p.map((i) => i.id === id ? { ...i, ...data } : i));
    setEditItem(null);
    setShowForm(false);
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

  const statusOptions: Record<string, string[]> = {
    cars: ["active", "sold", "pending"],
    parts: ["active", "sold", "pending"],
    requests: ["open", "closed"],
  };

  const statusColors: Record<string, string> = {
    active: "text-green-400 bg-green-600/10 border-green-600/30",
    open: "text-green-400 bg-green-600/10 border-green-600/30",
    sold: "text-primary bg-primary/10 border-primary/30",
    closed: "text-primary bg-primary/10 border-primary/30",
    pending: "text-yellow-400 bg-yellow-600/10 border-yellow-600/30",
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
          <button key={t2} onClick={() => { setTab(t2); setShowForm(false); setEditItem(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${tab === t2 ? "bg-primary text-white" : "bg-metal text-silver hover:bg-metal-light"}`}>
            <span>{tabLabels[t2].icon}</span>
            {tabLabels[t2].label}
            {!loadingItems && tab === t2 && <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{myItems.length}</span>}
          </button>
        ))}
      </div>

      {/* Add Button */}
      {tab !== "users" && (
        <button onClick={() => { setShowForm(!showForm); setEditItem(null); }} className="btn-primary text-sm mb-6">
          {showForm && !editItem ? t.common.cancel : `+ ${addLabels[tab] || ""}`}
        </button>
      )}

      {/* Add / Edit Form */}
      {showForm && tab !== "users" && (
        <ItemForm
          tab={tab}
          user={user}
          locale={locale}
          t={t}
          uploadImages={uploadImages}
          submitting={submitting}
          setSubmitting={setSubmitting}
          editItem={editItem}
          onDone={(item: any) => { setMyItems((p) => [item, ...p]); setShowForm(false); setEditItem(null); }}
          onUpdate={(id: string, data: any) => handleUpdate(id, data)}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
        />
      )}

      {/* Items List */}
      {loadingItems ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse flex items-center gap-4">
              <div className="w-14 h-14 bg-metal rounded-lg" />
              <div className="flex-1 space-y-2"><div className="h-4 bg-metal rounded w-1/2" /><div className="h-3 bg-metal rounded w-1/3" /></div>
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
            <div key={item.id} className="card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  ) : (
                    <span className="w-14 h-14 rounded-lg bg-metal flex items-center justify-center text-xl">{tabLabels[tab].icon}</span>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-white font-bold truncate">
                      {item.title?.[locale] || item.title?.ar || item.name || item.email || "—"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-silver/50 mt-0.5 flex-wrap">
                      {item.brand && <span>{item.brand}</span>}
                      {item.year && <span>• {item.year}</span>}
                      {item.price && <span>• {item.price.toLocaleString()} {t.common.kwd}</span>}
                      {tab === "users" && item.phone && <span>📱 {item.phone}</span>}
                      {tab === "users" && item.whatsapp && <span>💬 {item.whatsapp}</span>}
                      {tab === "users" && item.email && <span>📧 {item.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ms-4">
                  {/* Status Dropdown (Admin) */}
                  {isAdmin && statusOptions[tab] && item.status && (
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-lg border cursor-pointer ${statusColors[item.status] || "text-silver bg-metal border-metal"}`}
                    >
                      {statusOptions[tab].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}

                  {/* Non-admin status badge */}
                  {!isAdmin && item.status && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${statusColors[item.status] || "text-silver bg-metal border-metal"}`}>
                      {item.status}
                    </span>
                  )}

                  {/* Edit Button */}
                  {(isAdmin || item.userId === user.uid) && tab !== "users" && (
                    <button onClick={() => handleEdit(item)} className="text-silver hover:text-white text-sm transition-colors p-1.5 rounded-lg hover:bg-metal">
                      ✏️
                    </button>
                  )}

                  {/* Delete Button */}
                  {(isAdmin || item.userId === user.uid) && (
                    <button onClick={() => handleDelete(item.id)} className="text-silver hover:text-primary text-sm transition-colors p-1.5 rounded-lg hover:bg-primary/10">
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemForm({ tab, user, locale, t, uploadImages, submitting, setSubmitting, editItem, onDone, onUpdate, onCancel }: any) {
  const isEdit = !!editItem;
  const [titleAr, setTitleAr] = useState(editItem?.title?.ar || "");
  const [titleEn, setTitleEn] = useState(editItem?.title?.en || "");
  const [descAr, setDescAr] = useState(editItem?.description?.ar || "");
  const [descEn, setDescEn] = useState(editItem?.description?.en || "");
  const [brand, setBrand] = useState(editItem?.brand || editItem?.compatibleBrands?.[0] || "");
  const [model, setModel] = useState(editItem?.model || "");
  const [year, setYear] = useState(editItem?.year?.toString() || "");
  const [price, setPrice] = useState(editItem?.price?.toString() || editItem?.budget?.toString() || "");
  const [mileage, setMileage] = useState(editItem?.mileage?.toString() || "");
  const [color, setColor] = useState(editItem?.color || "");
  const [transmission, setTransmission] = useState(editItem?.transmission || "automatic");
  const [fuelType, setFuelType] = useState(editItem?.fuelType || "petrol");
  const [category, setCategory] = useState(editItem?.category || "engine");
  const [condition, setCondition] = useState(editItem?.condition || "used");
  const [reqCategory, setReqCategory] = useState(editItem?.category || "car");
  const [images, setImages] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrls: string[] = editItem?.images || [];
      if (images && images.length > 0) {
        const newUrls = await uploadImages(images);
        imageUrls = [...imageUrls, ...newUrls];
      }

      let data: any = {
        title: { ar: titleAr, en: titleEn || titleAr },
        description: { ar: descAr, en: descEn || descAr },
      };

      if (tab === "cars") {
        data = { ...data, brand, model, year: Number(year), price: Number(price), mileage: Number(mileage), color, transmission, fuelType, images: imageUrls };
      } else if (tab === "parts") {
        data = { ...data, category, condition, price: Number(price), compatibleBrands: [brand], images: imageUrls };
      } else if (tab === "requests") {
        data = { ...data, category: reqCategory, budget: price ? Number(price) : null };
      } else if (tab === "gallery") {
        data = { title: { ar: titleAr, en: titleEn || titleAr }, images: imageUrls };
      }

      if (isEdit) {
        await onUpdate(editItem.id, data);
      } else {
        data = {
          ...data,
          userId: user.uid,
          userName: user.name,
          userWhatsapp: user.whatsapp,
          status: tab === "requests" ? "open" : "active",
          createdAt: serverTimestamp(),
        };
        if (tab === "gallery") {
          data = { title: { ar: titleAr, en: titleEn || titleAr }, images: imageUrls, createdAt: serverTimestamp() };
        }
        const docRef = await addDoc(collection(db, tab), data);
        onDone({ id: docRef.id, ...data });
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4 animate-fadeInUp">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold">
          {isEdit ? (locale === "ar" ? "✏️ تعديل" : "✏️ Edit") : (locale === "ar" ? "➕ إضافة جديد" : "➕ Add New")}
        </h3>
        {isEdit && (
          <button type="button" onClick={onCancel} className="text-silver hover:text-primary text-sm">{t.common.cancel}</button>
        )}
      </div>

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
          <label className="text-silver text-sm mb-1 block">
            {locale === "ar" ? (isEdit ? "إضافة صور جديدة" : "الصور") : (isEdit ? "Add new images" : "Images")}
          </label>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)}
            className="input-field file:bg-primary file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:me-3 file:cursor-pointer" />
          {isEdit && editItem?.images?.length > 0 && (
            <p className="text-silver/40 text-xs mt-1">
              {locale === "ar" ? `${editItem.images.length} صور موجودة - الصور الجديدة بتنضاف عليها` : `${editItem.images.length} existing images - new images will be added`}
            </p>
          )}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
        {submitting ? t.common.loading : isEdit ? t.common.save : (locale === "ar" ? "إضافة" : "Add")}
      </button>
    </form>
  );
}
