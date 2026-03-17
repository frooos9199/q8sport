"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { ADMIN_CREDENTIALS } from "@/lib/admin";
import { db, storage } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CAR_BRANDS, PART_CATEGORIES } from "@/types";

type Tab = "cars" | "parts" | "requests" | "gallery" | "users";

export default function AdminPage() {
  const { locale, t } = useLocale();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("cars");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("admin");
      if (saved === "true") setLoggedIn(true);
    } catch (e) {}
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setLoggedIn(true);
      sessionStorage.setItem("admin", "true");
      setError("");
    } else {
      setError(locale === "ar" ? "بيانات خاطئة" : "Invalid credentials");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    sessionStorage.removeItem("admin");
  };

  useEffect(() => {
    if (!loggedIn) return;
    fetchItems();
  }, [loggedIn, tab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, tab), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setItems([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === "ar" ? "متأكد تبي تحذف؟" : "Are you sure?")) return;
    await deleteDoc(doc(db, tab, id));
    setItems((p) => p.filter((i) => i.id !== id));
  };

  // Login Screen
  if (!loggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-primary text-3xl font-black font-english">Q8</span>
            <span className="text-white text-xl font-bold font-english ms-2">ADMIN</span>
          </div>

          {error && <div className="bg-primary/10 border border-primary/30 text-primary text-sm rounded-lg p-3 mb-4">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder={locale === "ar" ? "اسم المستخدم" : "Username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder={locale === "ar" ? "كلمة المرور" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
            <button type="submit" className="btn-primary w-full">
              {locale === "ar" ? "دخول" : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-primary font-english">Q8</span>
            {locale === "ar" ? "لوحة التحكم" : "Admin Panel"}
          </h1>
        </div>
        <button onClick={handleLogout} className="text-silver hover:text-primary text-sm transition-colors">
          {t.common.logout}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {(["cars", "parts", "requests", "gallery", "users"] as Tab[]).map((t2) => (
          <button
            key={t2}
            onClick={() => { setTab(t2); setShowForm(false); }}
            className={`card p-4 text-center transition-all ${tab === t2 ? "!border-primary bg-primary/5" : ""}`}
          >
            <span className="text-2xl block mb-1">
              {t2 === "cars" ? "🏎️" : t2 === "parts" ? "⚙️" : t2 === "requests" ? "📋" : t2 === "gallery" ? "📸" : "👥"}
            </span>
            <span className={`text-sm font-bold ${tab === t2 ? "text-primary" : "text-silver"}`}>
              {t2 === "cars" ? t.common.cars : t2 === "parts" ? t.common.parts : t2 === "requests" ? t.common.requests : t2 === "gallery" ? t.common.gallery : (locale === "ar" ? "المستخدمين" : "Users")}
            </span>
          </button>
        ))}
      </div>

      {/* Add Button */}
      {tab !== "users" && (
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm mb-6">
          {showForm ? t.common.cancel : `+ ${locale === "ar" ? "إضافة" : "Add"}`}
        </button>
      )}

      {/* Add Form */}
      {showForm && tab !== "users" && (
        <AdminAddForm
          tab={tab}
          locale={locale}
          t={t}
          onDone={(item: any) => { setItems((p) => [item, ...p]); setShowForm(false); }}
        />
      )}

      {/* Items List */}
      {loading ? (
        <div className="text-center py-10 text-silver/50">{t.common.loading}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-silver/50">{t.common.noResults}</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {item.images?.[0] && (
                  <img src={item.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="min-w-0">
                  <h3 className="text-white font-bold truncate">
                    {item.title?.[locale] || item.title?.ar || item.name || item.email || "—"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-silver/50">
                    {item.brand && <span>{item.brand}</span>}
                    {item.year && <span>• {item.year}</span>}
                    {item.price && <span>• {item.price} {t.common.kwd}</span>}
                    {item.status && (
                      <span className={`${item.status === "active" || item.status === "open" ? "text-green-400" : item.status === "sold" ? "text-primary" : "text-yellow-400"}`}>
                        • {item.status}
                      </span>
                    )}
                    {item.phone && <span>📱 {item.phone}</span>}
                    {item.whatsapp && <span>💬 {item.whatsapp}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-primary hover:text-primary-dark text-sm font-bold ms-4">
                {t.common.delete}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminAddForm({ tab, locale, t, onDone }: { tab: Tab; locale: string; t: any; onDone: (item: any) => void }) {
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
  const [whatsapp, setWhatsapp] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        for (const file of Array.from(images)) {
          const r = ref(storage, `${tab}/${Date.now()}_${file.name}`);
          await uploadBytes(r, file);
          imageUrls.push(await getDownloadURL(r));
        }
      }

      let data: any = {
        userId: "admin",
        userName: "Admin",
        userWhatsapp: whatsapp,
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
    <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
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
        <>
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

          <div>
            <label className="text-silver text-sm mb-1 block">{locale === "ar" ? "رقم الواتساب" : "WhatsApp"}</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="input-field" placeholder="+965" />
          </div>
        </>
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
              <label className="text-silver text-sm mb-1 block">{t.common.price}</label>
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
            <label className="text-silver text-sm mb-1 block">{t.common.price}</label>
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
            <label className="text-silver text-sm mb-1 block">{t.requests.budget}</label>
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
