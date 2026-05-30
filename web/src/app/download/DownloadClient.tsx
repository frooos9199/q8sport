"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  device: "ios" | "android" | "desktop";
  appStoreUrl: string;
  playStoreUrl: string;
};

const REDIRECT_DELAY_MS = 1000;

type ClickCounts = {
  appStore: number;
  playStore: number;
};

function safeIncrement(target: "appStore" | "playStore") {
  const payload = JSON.stringify({ target });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/metrics/download-clicks", blob);
    return;
  }

  fetch("/api/metrics/download-clicks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.7 13.2c0 3.6 3.1 4.8 3.2 4.9-.1.3-.5 1.8-1.6 3.6-1 1.6-2.1 3.1-3.7 3.1-1.6 0-2-.9-3.8-.9-1.7 0-2.3.9-3.8.9-1.6 0-2.7-1.5-3.8-3.1-2.1-3.1-3.7-8.8-1.5-12.7 1.1-1.9 3.1-3.1 5.2-3.1 1.6 0 3.1 1.1 3.8 1.1.7 0 2.4-1.3 4.2-1.1.8 0 3.1.3 4.6 2.4-.1.1-2.7 1.6-2.7 4.9ZM14.6 4.3c.8-1 1.4-2.3 1.2-3.7-1.2.1-2.7.8-3.6 1.8-.8.9-1.5 2.3-1.2 3.6 1.3.1 2.7-.7 3.6-1.7Z" />
    </svg>
  );
}

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3.6 2.7c-.4.4-.6 1-.6 1.7v15.2c0 .7.2 1.3.6 1.7l10-10L3.6 2.7Zm12 9.2 2.5-2.5-11-6.2 8.5 8.7Zm0 .2-8.5 8.7 11-6.2-2.5-2.5Zm3.1-3.6-2.8 2.8 2.8 2.8 2.2-1.3c.8-.5 1.3-1.3 1.3-2.1 0-.9-.5-1.7-1.3-2.1l-2.2-1.3Z" />
    </svg>
  );
}

export default function DownloadClient({ device, appStoreUrl, playStoreUrl }: Props) {
  const [views, setViews] = useState<number | null>(null);
  const [clicks, setClicks] = useState<ClickCounts | null>(null);

  const targetUrl = useMemo(() => {
    if (device === "ios") return appStoreUrl;
    if (device === "android") return playStoreUrl;
    return null;
  }, [device, appStoreUrl, playStoreUrl]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/metrics/download-views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
    })
      .then(async res => {
        const data = (await res.json()) as { views?: unknown };
        const nextViews = typeof data.views === "number" ? data.views : null;
        if (!cancelled) setViews(nextViews);
      })
      .catch(() => {
        if (!cancelled) setViews(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/metrics/download-clicks", { method: "GET" })
      .then(async res => {
        const data = (await res.json()) as { clicks?: unknown };
        const raw = data.clicks as Partial<ClickCounts> | null | undefined;

        const appStore = typeof raw?.appStore === "number" ? raw.appStore : null;
        const playStore = typeof raw?.playStore === "number" ? raw.playStore : null;

        if (!cancelled && typeof appStore === "number" && typeof playStore === "number") {
          setClicks({ appStore, playStore });
        }
      })
      .catch(() => {
        if (!cancelled) setClicks(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!targetUrl) return;

    const timeoutId = window.setTimeout(() => {
      if (device === "ios") safeIncrement("appStore");
      if (device === "android") safeIncrement("playStore");
      window.location.href = targetUrl;
    }, REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [device, targetUrl]);

  function onAppStoreClick() {
    safeIncrement("appStore");
    setClicks(current => (current ? { ...current, appStore: current.appStore + 1 } : current));
  }

  function onPlayStoreClick() {
    safeIncrement("playStore");
    setClicks(current => (current ? { ...current, playStore: current.playStore + 1 } : current));
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-5 pb-20 pt-10 sm:px-8">
      <section className="w-full rounded-3xl border border-metal-border bg-panel p-6 sm:p-10">
        <div className="text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-2xl">⬇️</div>
          <h1 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">تحميل التطبيق</h1>

          {targetUrl ? (
            <p className="mt-3 text-sm leading-7 text-sand">جاري تحويلك للمتجر المناسب...</p>
          ) : (
            <p className="mt-3 text-sm leading-7 text-sand">
              اختر المتجر المناسب لجهازك
            </p>
          )}

          {typeof views === "number" ? (
            <p className="mt-3 text-xs font-bold text-foreground">
              المشاهدات: {views.toLocaleString("ar-KW")}
            </p>
          ) : null}

          {clicks ? (
            <p className="mt-2 text-xs text-sand">
              ضغطات App Store: {clicks.appStore.toLocaleString("ar-KW")} · ضغطات Google Play:{" "}
              {clicks.playStore.toLocaleString("ar-KW")}
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a
            href={appStoreUrl}
            onClick={onAppStoreClick}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-sm font-black text-white transition hover:bg-brand-dark"
          >
            <AppleIcon className="h-5 w-5" />
            Download on App Store
          </a>
          <a
            href={playStoreUrl}
            onClick={onPlayStoreClick}
            className="flex items-center justify-center gap-2 rounded-xl border border-metal-border bg-metal px-6 py-4 text-sm font-bold text-foreground transition hover:bg-panel-soft"
          >
            <GooglePlayIcon className="h-5 w-5" />
            Get it on Google Play
          </a>
        </div>

        {targetUrl ? (
          <p className="mt-6 text-center text-xs text-sand">
            إذا ما تم التحويل تلقائيًا، استخدم الأزرار أعلاه.
          </p>
        ) : null}
      </section>
    </main>
  );
}
