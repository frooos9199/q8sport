"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="mb-6 flex h-72 w-full items-center justify-center rounded-2xl border border-metal-border bg-metal">
        <span className="text-5xl">🏎️</span>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Main Image */}
      <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-metal-border sm:h-80">
        <Image
          src={images[active]}
          alt={`${title} - ${active + 1}`}
          fill
          className="object-cover transition-all duration-300"
          unoptimized
        />
        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === active ? "border-brand" : "border-metal-border hover:border-sand/50"
              }`}
            >
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
