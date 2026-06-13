"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
        <button onClick={() => setLightbox(true)} className="relative h-72 w-full overflow-hidden rounded-2xl border border-[var(--metal-border)] cursor-zoom-in sm:h-80">
          <Image src={images[active]} alt={`${title} - ${active + 1}`} fill className="object-cover transition-all duration-300" unoptimized />
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              {active + 1} / {images.length}
            </div>
          )}
          <div className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
            🔍 اضغط للتكبير
          </div>
        </button>

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
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <ZoomLightbox
          images={images}
          title={title}
          active={active}
          setActive={setActive}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}

function ZoomLightbox({ images, title, active, setActive, onClose }: {
  images: string[]; title: string; active: number; setActive: (i: number) => void; onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const lastDist = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [active]);

  // Double click/tap to zoom
  const handleDoubleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

  // Mouse wheel zoom (desktop)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setScale((s) => {
      const next = Math.min(5, Math.max(1, s + delta));
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Touch: pinch zoom + pan
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (scale > 1) setDragging(true);
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastDist.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const diff = dist - lastDist.current;
      lastDist.current = dist;
      setScale((s) => {
        const next = Math.min(5, Math.max(1, s + diff * 0.01));
        if (next === 1) setTranslate({ x: 0, y: 0 });
        return next;
      });
    } else if (e.touches.length === 1 && lastTouch.current && scale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
      setDragging(true);
    }
  }, [scale]);

  const handleTouchEnd = useCallback(() => {
    lastDist.current = null;
    lastTouch.current = null;
    setDragging(false);
  }, []);

  // Mouse drag (desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      lastTouch.current = { x: e.clientX, y: e.clientY };
      setDragging(true);
    }
  }, [scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging && lastTouch.current && scale > 1) {
      const dx = e.clientX - lastTouch.current.x;
      const dy = e.clientY - lastTouch.current.y;
      lastTouch.current = { x: e.clientX, y: e.clientY };
      setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
    }
  }, [dragging, scale]);

  const handleMouseUp = useCallback(() => {
    lastTouch.current = null;
    setDragging(false);
  }, []);

  const goNext = (e: React.MouseEvent) => { e.stopPropagation(); setActive((active + 1) % images.length); };
  const goPrev = (e: React.MouseEvent) => { e.stopPropagation(); setActive((active - 1 + images.length) % images.length); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95" onClick={() => { if (scale === 1) onClose(); }}>
      {/* Close */}
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white text-xl backdrop-blur-sm hover:bg-white/20 transition">
        ✕
      </button>

      {/* Zoom indicator */}
      {scale > 1 && (
        <div className="absolute top-5 left-5 z-20 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Navigation arrows */}
      {images.length > 1 && scale === 1 && (
        <>
          <button onClick={goPrev} className="absolute left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-xl backdrop-blur-sm hover:bg-white/20 transition">←</button>
          <button onClick={goNext} className="absolute right-16 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-xl backdrop-blur-sm hover:bg-white/20 transition">→</button>
        </>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative h-[85vh] w-[92vw] max-w-5xl select-none"
        style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in", touchAction: "none" }}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: dragging ? "none" : "transform 0.2s ease-out",
            transformOrigin: "center center",
          }}
        >
          <Image src={images[active]} alt={title} fill className="object-contain pointer-events-none" unoptimized />
        </div>
      </div>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
          {active + 1} / {images.length}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-sm hidden sm:block">
        دبل كلك للتكبير • اسحب للتحرك • سكرول للزوم
      </div>
    </div>
  );
}
