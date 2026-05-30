"use client";

import { useEffect, useMemo } from "react";

type Props = {
  device: "ios" | "android" | "desktop";
  appStoreUrl: string;
  playStoreUrl: string;
};

const REDIRECT_DELAY_MS = 1000;

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
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-sm font-black text-white transition hover:bg-brand-dark"
          >
            <AppleIcon className="h-5 w-5" />
            Download on App Store
          </a>
          <a
            href={playStoreUrl}
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
