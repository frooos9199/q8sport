"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Car, Part, Request } from "@/types";
import CarCard from "@/components/cars/CarCard";
import PartCard from "@/components/parts/PartCard";

export default function HomePage() {
  const { locale, t } = useLocale();
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [carsSnap, partsSnap, reqSnap] = await Promise.all([
          getDocs(query(collection(db, "cars"), orderBy("createdAt", "desc"), limit(6))),
          getDocs(query(collection(db, "parts"), orderBy("createdAt", "desc"), limit(8))),
          getDocs(query(collection(db, "requests"), orderBy("createdAt", "desc"), limit(4))),
        ]);
        setCars(carsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Car)));
        setParts(partsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Part)));
        setRequests(reqSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Request)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/95 to-dark" />
        <div className="absolute inset-0">
          <div className="absolute top-1/3 start-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[200px] animate-pulse" />
          <div className="absolute bottom-1/4 end-1/3 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="animate-fadeInUp">
            <div className="inline-block mb-6 px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
              <span className="text-primary text-sm font-bold">🇰🇼 {locale === "ar" ? "الكويت" : "Kuwait"}</span>
            </div>
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            <span className="text-primary text-7xl md:text-9xl font-black font-english tracking-tighter leading-none">Q8</span>
            <span className="text-white text-5xl md:text-7xl font-bold font-english ms-4 leading-none">SPORT CAR</span>
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            <div className="h-1 w-32 bg-primary mx-auto my-6 rounded-full animate-revEngine" />
          </div>

          <h1 className="text-xl md:text-3xl font-bold mb-4 leading-relaxed animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            {t.home.hero}
          </h1>
          <p className="text-silver/60 text-lg mb-10 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            {t.home.heroSub}
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
            <Link href={`/${locale}/cars`} className="btn-primary text-lg !py-4 !px-10 animate-pulse-glow">
              🏎️ {t.home.browseCars}
            </Link>
            <Link href={`/${locale}/parts`} className="btn-secondary text-lg !py-4 !px-10">
              ⚙️ {t.home.browseParts}
            </Link>
          </div>
        </div>

        {/* Bottom Lines */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-1" />
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-b border-metal">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
            {[
              { icon: "🏎️", num: cars.length.toString(), label: locale === "ar" ? "سيارة معروضة" : "Cars Listed" },
              { icon: "⚙️", num: parts.length.toString(), label: locale === "ar" ? "قطعة غيار" : "Parts Available" },
              { icon: "📋", num: requests.length.toString(), label: locale === "ar" ? "طلب نشط" : "Active Requests" },
              { icon: "💬", num: "WhatsApp", label: locale === "ar" ? "تواصل مباشر" : "Direct Contact" },
            ].map((s) => (
              <div key={s.label} className="text-center p-4">
                <span className="text-3xl block mb-2">{s.icon}</span>
                <span className="text-primary text-2xl font-black font-english block">{s.num}</span>
                <span className="text-silver/50 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="animate-fadeInUp">
            <h2 className="section-title !mb-1 flex items-center gap-3">
              🏎️ {t.home.featuredCars}
            </h2>
            <div className="h-0.5 w-20 bg-primary rounded-full mt-2 animate-revEngine" />
          </div>
          <Link href={`/${locale}/cars`} className="text-primary hover:text-primary-dark text-sm font-bold transition-colors flex items-center gap-1">
            {t.common.viewAll} {locale === "ar" ? "←" : "→"}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-80 animate-pulse">
                <div className="h-48 bg-metal" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-metal rounded w-3/4" />
                  <div className="h-3 bg-metal rounded w-1/2" />
                  <div className="h-6 bg-metal rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="card p-16 text-center">
            <span className="text-6xl block mb-4 animate-float">🏎️</span>
            <p className="text-silver/50 text-lg mb-4">{locale === "ar" ? "لا توجد سيارات حالياً" : "No cars listed yet"}</p>
            <Link href={`/${locale}/dashboard`} className="btn-primary text-sm inline-block">
              {locale === "ar" ? "كن أول من يضيف سيارة!" : "Be the first to list a car!"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {cars.map((car) => (
              <div key={car.id} className="hover-lift">
                <CarCard car={car} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-metal to-transparent" />
      </div>

      {/* Latest Parts */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title !mb-1 flex items-center gap-3">
              ⚙️ {t.home.latestParts}
            </h2>
            <div className="h-0.5 w-20 bg-primary rounded-full mt-2 animate-revEngine" />
          </div>
          <Link href={`/${locale}/parts`} className="text-primary hover:text-primary-dark text-sm font-bold transition-colors flex items-center gap-1">
            {t.common.viewAll} {locale === "ar" ? "←" : "→"}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card h-64 animate-pulse">
                <div className="h-40 bg-metal" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-metal rounded w-3/4" />
                  <div className="h-6 bg-metal rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : parts.length === 0 ? (
          <div className="card p-16 text-center">
            <span className="text-6xl block mb-4 animate-float">⚙️</span>
            <p className="text-silver/50 text-lg mb-4">{locale === "ar" ? "لا توجد قطع غيار حالياً" : "No parts listed yet"}</p>
            <Link href={`/${locale}/dashboard`} className="btn-primary text-sm inline-block">
              {locale === "ar" ? "أضف قطعة غيار!" : "Add a part!"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {parts.map((part) => (
              <div key={part.id} className="hover-lift">
                <PartCard part={part} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-metal to-transparent" />
      </div>

      {/* Latest Requests */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title !mb-1 flex items-center gap-3">
              📋 {t.home.latestRequests}
            </h2>
            <div className="h-0.5 w-20 bg-primary rounded-full mt-2 animate-revEngine" />
          </div>
          <Link href={`/${locale}/requests`} className="text-primary hover:text-primary-dark text-sm font-bold transition-colors flex items-center gap-1">
            {t.common.viewAll} {locale === "ar" ? "←" : "→"}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="card p-6 animate-pulse space-y-3">
                <div className="h-4 bg-metal rounded w-1/4" />
                <div className="h-5 bg-metal rounded w-3/4" />
                <div className="h-3 bg-metal rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="card p-16 text-center">
            <span className="text-6xl block mb-4 animate-float">📋</span>
            <p className="text-silver/50 text-lg mb-4">{locale === "ar" ? "لا توجد طلبات حالياً" : "No requests yet"}</p>
            <Link href={`/${locale}/dashboard`} className="btn-primary text-sm inline-block">
              {locale === "ar" ? "أضف طلبك!" : "Add your request!"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
            {requests.map((req) => (
              <div key={req.id} className="card p-5 hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`badge ${req.status === "open" ? "badge-active" : "badge-sold"} mb-2`}>
                      {req.status === "open" ? t.common.open : t.common.closed}
                    </span>
                    <h3 className="text-white font-bold text-lg">{req.title[locale]}</h3>
                  </div>
                  <span className="text-xs text-silver/40 bg-metal px-2 py-1 rounded">
                    {req.category === "car" ? "🏎️" : req.category === "part" ? "⚙️" : "📦"} {t.requests[req.category as keyof typeof t.requests] || req.category}
                  </span>
                </div>
                <p className="text-silver/60 text-sm mb-4 line-clamp-2">{req.description[locale]}</p>
                {req.budget && (
                  <p className="text-primary font-bold mb-3">{t.requests.budget}: {req.budget.toLocaleString()} {t.common.kwd}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-metal">
                  <span className="text-silver/40 text-sm">{req.userName}</span>
                  <a
                    href={`https://wa.me/${req.userWhatsapp?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحبا، بخصوص طلبك: ${req.title.ar}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn !py-2 !px-4 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {t.common.contactWhatsapp}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-dark to-primary/10" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <span className="text-5xl block mb-6 animate-float">🏁</span>
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            {locale === "ar" ? "عندك سيارة سبورت؟" : "Got a Sport Car?"}
          </h2>
          <p className="text-silver/60 text-lg mb-8">
            {locale === "ar" ? "أضف سيارتك الحين وتواصل مع المشترين مباشرة عبر الواتساب" : "List your car now and connect with buyers directly via WhatsApp"}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/auth/register`} className="btn-primary text-lg !py-4 !px-10">
              {locale === "ar" ? "سجّل الحين" : "Register Now"} 🚀
            </Link>
            <Link href={`/${locale}/requests`} className="btn-secondary text-lg !py-4 !px-10">
              {locale === "ar" ? "تصفح الطلبات" : "Browse Requests"} 📋
            </Link>
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="border-t border-metal py-10 overflow-hidden">
        <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
          {["Porsche", "Ferrari", "Lamborghini", "McLaren", "BMW", "Mercedes", "Audi", "Nissan GTR", "Dodge", "Chevrolet", "Aston Martin", "Maserati", "Bugatti", "Porsche", "Ferrari", "Lamborghini", "McLaren", "BMW"].map((brand, i) => (
            <span key={i} className="text-silver/20 text-2xl font-black font-english tracking-wider">{brand}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
