"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Car, PRESET_RATINGS } from "@/types";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import Link from "next/link";

export default function CarDetailsPage({ params }: { params: { id: string; locale: string } }) {
  const { locale, t } = useLocale();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    async function fetchCar() {
      try {
        const snap = await getDoc(doc(db, "cars", params.id));
        if (snap.exists()) setCar({ id: snap.id, ...snap.data() } as Car);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchCar();
  }, [params.id]);

  if (loading) return <div className="text-center py-20 text-silver/50 animate-pulse">{t.common.loading}</div>;
  if (!car) return <div className="text-center py-20 text-silver/50">{t.common.noResults}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Back */}
      <Link href={`/${locale}/cars`} className="text-silver/60 hover:text-primary text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        {locale === "ar" ? "→ رجوع للسيارات" : "← Back to Cars"}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Images */}
        <div className="space-y-3">
          <div
            className="relative h-80 md:h-[450px] bg-metal rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setLightbox(true)}
          >
            {car.images?.[selectedImg] ? (
              <img
                src={car.images[selectedImg]}
                alt={car.title[locale]}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-silver/20">
                <span className="text-8xl">🏎️</span>
              </div>
            )}
            {car.status === "sold" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-primary text-4xl font-black animate-pulse">{t.common.sold}</span>
              </div>
            )}
            <div className="absolute bottom-3 end-3 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              {locale === "ar" ? "اضغط للتكبير" : "Click to zoom"}
            </div>
          </div>

          {/* Thumbnails */}
          {car.images && car.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImg === i ? "border-primary" : "border-metal hover:border-metal-light"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded">{car.year}</span>
              <span className={`badge ${car.status === "active" ? "badge-active" : "badge-sold"}`}>{car.status === "active" ? t.common.active : t.common.sold}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">{car.title[locale]}</h1>
            <p className="text-silver/60">{car.brand} • {car.model}</p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <span className="text-primary font-black text-4xl">{car.price?.toLocaleString()}</span>
            <span className="text-silver/60 text-lg ms-2">{t.common.kwd}</span>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "📅", label: t.common.year, value: car.year },
              { icon: "🏷️", label: t.common.brand, value: car.brand },
              { icon: "🚗", label: t.common.model, value: car.model },
              { icon: "📏", label: t.common.mileage, value: car.mileage ? `${car.mileage.toLocaleString()} ${t.common.km}` : "—" },
              { icon: "🎨", label: t.common.color, value: car.color || "—" },
              { icon: "⚙️", label: t.common.transmission, value: car.transmission === "automatic" ? t.common.automatic : t.common.manual },
              { icon: "⛽", label: t.common.fuelType, value: t.common[car.fuelType as keyof typeof t.common] || car.fuelType },
            ].map((spec) => (
              <div key={spec.label} className="bg-dark-card border border-metal rounded-lg p-3">
                <span className="text-lg me-2">{spec.icon}</span>
                <span className="text-silver/50 text-xs block mt-1">{spec.label}</span>
                <span className="text-white font-bold text-sm">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {car.description?.[locale] && (
            <div>
              <h3 className="text-white font-bold mb-2">{locale === "ar" ? "الوصف" : "Description"}</h3>
              <p className="text-silver/70 leading-relaxed">{car.description[locale]}</p>
            </div>
          )}

          {/* Ratings */}
          <div>
            <h3 className="text-white font-bold mb-3">{t.ratings.title}</h3>
            <div className="flex flex-wrap gap-2">
              {PRESET_RATINGS.map((r) => (
                <span key={r.label} className="bg-metal border border-metal-light rounded-full px-3 py-1.5 text-xs text-silver/70 flex items-center gap-1">
                  {"⭐".repeat(Math.min(r.value, 5))} {r.label}
                </span>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
          <div className="pt-4 border-t border-metal">
            <p className="text-silver/50 text-sm mb-3">{locale === "ar" ? `البائع: ${car.userName}` : `Seller: ${car.userName}`}</p>
            <WhatsAppButton
              phone={car.userWhatsapp}
              message={`مرحبا، أبي أستفسر عن: ${car.title.ar} - ${car.brand} ${car.model} ${car.year}`}
            />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && car.images && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 end-4 text-white text-3xl hover:text-primary z-10" onClick={() => setLightbox(false)}>✕</button>
          {car.images.length > 1 && (
            <>
              <button
                className="absolute start-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-primary z-10"
                onClick={(e) => { e.stopPropagation(); setSelectedImg((p) => (p - 1 + car.images.length) % car.images.length); }}
              >
                {locale === "ar" ? "›" : "‹"}
              </button>
              <button
                className="absolute end-16 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-primary z-10"
                onClick={(e) => { e.stopPropagation(); setSelectedImg((p) => (p + 1) % car.images.length); }}
              >
                {locale === "ar" ? "‹" : "›"}
              </button>
            </>
          )}
          <img src={car.images[selectedImg]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
