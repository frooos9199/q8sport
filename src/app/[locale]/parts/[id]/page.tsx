"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Part } from "@/types";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import Link from "next/link";

export default function PartDetailsPage({ params }: { params: { id: string; locale: string } }) {
  const { locale, t } = useLocale();
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    async function fetchPart() {
      try {
        const snap = await getDoc(doc(db, "parts", params.id));
        if (snap.exists()) setPart({ id: snap.id, ...snap.data() } as Part);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchPart();
  }, [params.id]);

  if (loading) return <div className="text-center py-20 text-silver/50 animate-pulse">{t.common.loading}</div>;
  if (!part) return <div className="text-center py-20 text-silver/50">{t.common.noResults}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href={`/${locale}/parts`} className="text-silver/60 hover:text-primary text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        {locale === "ar" ? "→ رجوع لقطع الغيار" : "← Back to Parts"}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative h-80 md:h-[400px] bg-metal rounded-xl overflow-hidden cursor-pointer group" onClick={() => setLightbox(true)}>
            {part.images?.[selectedImg] ? (
              <img src={part.images[selectedImg]} alt={part.title[locale]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-silver/20">
                <span className="text-8xl">⚙️</span>
              </div>
            )}
            {part.status === "sold" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-primary text-4xl font-black animate-pulse">{t.common.sold}</span>
              </div>
            )}
          </div>

          {part.images && part.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {part.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImg === i ? "border-primary" : "border-metal hover:border-metal-light"}`}>
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
              <span className={`badge ${part.condition === "new" ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"}`}>
                {part.condition === "new" ? t.common.new : t.common.used}
              </span>
              <span className={`badge ${part.status === "active" ? "badge-active" : "badge-sold"}`}>
                {part.status === "active" ? t.common.active : t.common.sold}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">{part.title[locale]}</h1>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <span className="text-primary font-black text-4xl">{part.price?.toLocaleString()}</span>
            <span className="text-silver/60 text-lg ms-2">{t.common.kwd}</span>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-card border border-metal rounded-lg p-3">
              <span className="text-lg me-2">📂</span>
              <span className="text-silver/50 text-xs block mt-1">{t.parts.category}</span>
              <span className="text-white font-bold text-sm">{t.parts[part.category as keyof typeof t.parts] || part.category}</span>
            </div>
            <div className="bg-dark-card border border-metal rounded-lg p-3">
              <span className="text-lg me-2">✅</span>
              <span className="text-silver/50 text-xs block mt-1">{t.common.condition}</span>
              <span className="text-white font-bold text-sm">{part.condition === "new" ? t.common.new : t.common.used}</span>
            </div>
          </div>

          {/* Compatible Brands */}
          {part.compatibleBrands && part.compatibleBrands.length > 0 && (
            <div>
              <h3 className="text-white font-bold mb-2">{t.parts.compatibleWith}</h3>
              <div className="flex flex-wrap gap-2">
                {part.compatibleBrands.map((b) => (
                  <span key={b} className="bg-metal border border-metal-light rounded-full px-3 py-1.5 text-xs text-silver/70">{b}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {part.description?.[locale] && (
            <div>
              <h3 className="text-white font-bold mb-2">{locale === "ar" ? "الوصف" : "Description"}</h3>
              <p className="text-silver/70 leading-relaxed">{part.description[locale]}</p>
            </div>
          )}

          {/* WhatsApp */}
          <div className="pt-4 border-t border-metal">
            <p className="text-silver/50 text-sm mb-3">{locale === "ar" ? `البائع: ${part.userName}` : `Seller: ${part.userName}`}</p>
            <WhatsAppButton phone={part.userWhatsapp} message={`مرحبا، أبي أستفسر عن: ${part.title.ar}`} />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && part.images && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 end-4 text-white text-3xl hover:text-primary z-10" onClick={() => setLightbox(false)}>✕</button>
          {part.images.length > 1 && (
            <>
              <button className="absolute start-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-primary z-10"
                onClick={(e) => { e.stopPropagation(); setSelectedImg((p) => (p - 1 + part.images.length) % part.images.length); }}>
                {locale === "ar" ? "›" : "‹"}
              </button>
              <button className="absolute end-16 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-primary z-10"
                onClick={(e) => { e.stopPropagation(); setSelectedImg((p) => (p + 1) % part.images.length); }}>
                {locale === "ar" ? "‹" : "›"}
              </button>
            </>
          )}
          <img src={part.images[selectedImg]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
