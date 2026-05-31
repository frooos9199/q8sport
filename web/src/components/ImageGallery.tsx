"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return (
      <div className="mb-6 flex h-72 w-full items-center justify-center rounded-2xl border border-[var(--metal-border)] bg-[var(--metal)]">
        <span className="text-5xl">🏎️</span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 space-y-3">
        {/* Main Image - clickable */}
        <button onClick={() => setLightbox(true)} className="relative h-72 w-full overflow-hidden rounded-2xl border border-[var(--metal-border)] cursor-zoom-in sm:h-80">
          <Image src={images[active]} alt={`${title} - ${active + 1}`} fill className="object-cover transition-all duration-300" unoptimized />

          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-white backdrop-blur-sm">
            <span className="text-brand">Q8</span>
            SPORTCAR
            <span className="text-brand">.COM</span>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              {active + 1} / {images.length}
            </div>
          )}
          <div className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
            🔍 اضغط للتكبير
          </div>
        </button>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  i === active ? "border-[var(--brand)]" : "border-[var(--metal-border)] hover:border-[var(--sand)]"
                }`}
              >
                <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" unoptimized />
                <div className="absolute bottom-1.5 right-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white backdrop-blur-sm">
                  <span className="text-brand">Q8</span>
                  SPORTCAR
                  <span className="text-brand">.COM</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setLightbox(false)}>
          {/* Close */}
          <button onClick={() => setLightbox(false)} className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20">
            ✕
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((active + 1) % images.length); }}
                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
              >
                ←
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((active - 1 + images.length) % images.length); }}
                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
              >
                →
              </button>
            </>
          )}

          {/* Image */}
          <div className="relative h-[85vh] w-[90vw] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active]} alt={title} fill className="object-contain" unoptimized />

            <div className="absolute bottom-5 right-5 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-white backdrop-blur-sm">
              <span className="text-brand">Q8</span>
              SPORTCAR
              <span className="text-brand">.COM</span>
            </div>
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
              {active + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
