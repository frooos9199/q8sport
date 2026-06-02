'use client';

import { useEffect, useMemo, useState } from 'react';

type ListingKind = 'cars' | 'parts' | 'requests';

function formatViews(value: number) {
  return value.toLocaleString('ar-KW');
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function ListingViewsBadge({
  kind,
  slug,
  initialViews,
  className,
}: {
  kind: ListingKind;
  slug: string;
  initialViews?: number;
  className?: string;
}) {
  const safeInitial = Number.isFinite(initialViews) ? Number(initialViews) : 0;
  const [views, setViews] = useState<number>(safeInitial);
  const storageKey = useMemo(() => `q8:listings:views:${kind}:${slug}:${todayKey()}`, [kind, slug]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (typeof window === 'undefined') return;
        if (window.localStorage.getItem(storageKey)) return;
        window.localStorage.setItem(storageKey, '1');

        const response = await fetch('/api/listing-views', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ kind, slug }),
        });

        if (!response.ok) return;
        const payload = (await response.json()) as { views?: unknown };
        const nextViews = typeof payload.views === 'number' && Number.isFinite(payload.views) ? payload.views : undefined;
        if (nextViews == null) return;

        if (cancelled) return;
        setViews((current) => (nextViews > current ? nextViews : current));
      } catch {
        // ignore
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [kind, slug, storageKey]);

  return (
    <span
      className={
        className ||
        'inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-white backdrop-blur-sm'
      }
    >
      <span aria-hidden>👁️</span>
      <span>{formatViews(views)}</span>
      <span className="opacity-90">مشاهدة</span>
    </span>
  );
}
