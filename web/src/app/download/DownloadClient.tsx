"use client";

import { useEffect, useMemo } from "react";

type Props = {
  device: "ios" | "android" | "desktop";
  appStoreUrl: string;
  playStoreUrl: string;
};

const REDIRECT_DELAY_MS = 1000;

export default function DownloadClient({ device, appStoreUrl, playStoreUrl }: Props) {
  const targetUrl = useMemo(() => {
    if (device === "ios") return appStoreUrl;
    if (device === "android") return playStoreUrl;
    return null;
  }, [device, appStoreUrl, playStoreUrl]);

  useEffect(() => {
    if (!targetUrl) return;

    const timeoutId = window.setTimeout(() => {
      window.location.href = targetUrl;
    }, REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [targetUrl]);

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
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a
            href={appStoreUrl}
            className="flex items-center justify-center rounded-xl bg-brand px-6 py-4 text-sm font-black text-white transition hover:bg-brand-dark"
          >
            Download on App Store
          </a>
          <a
            href={playStoreUrl}
            className="flex items-center justify-center rounded-xl border border-metal-border bg-metal px-6 py-4 text-sm font-bold text-foreground transition hover:bg-panel-soft"
          >
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
