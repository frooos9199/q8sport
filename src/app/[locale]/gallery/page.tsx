"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { GalleryItem } from "@/types";

export default function GalleryPage() {
  const { locale, t } = useLocale();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchGallery();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="section-title flex items-center gap-3">📸 {t.common.gallery}</h1>

      {loading ? (
        <div className="text-center py-20 text-silver/50">{t.common.loading}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-silver/50">{t.common.noResults}</div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {items.map((item) =>
            item.images?.map((img, i) => (
              <div key={`${item.id}-${i}`} className="mb-4 break-inside-avoid">
                <div className="card overflow-hidden cursor-pointer group" onClick={() => setSelectedImg(img)}>
                  <img src={img} alt={item.title[locale]} className="w-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="p-3">
                    <p className="text-white text-sm font-medium">{item.title[locale]}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lightbox */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
          <button className="absolute top-4 end-4 text-white text-3xl hover:text-primary" onClick={() => setSelectedImg(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
