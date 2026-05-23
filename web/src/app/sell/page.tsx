import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, siteConfig } from "@/lib/site";
import PublishForm from "./publish-form";

export const metadata: Metadata = {
  title: 'انشر إعلانك',
  description: 'انشر سيارة أو قطعة أو مطلوب مباشرة على Q8 Sport Market بدون طبقة موافقات.',
  alternates: {
    canonical: absoluteUrl('/sell'),
  },
  openGraph: {
    title: `انشر إعلانك | ${siteConfig.name}`,
    description: 'أضف إعلانك مباشرة إلى السوق الكويتي للسيارات السبورت وقطع الغيار.',
    url: absoluteUrl('/sell'),
    type: 'website',
  },
};

export default function SellPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-20 pt-6 sm:px-8 lg:px-10">
      <section className="rounded-[2rem] border border-line bg-panel px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Direct Publishing</p>
            <h1 className="mt-3 text-4xl font-black text-foreground sm:text-5xl">نزّل إعلانك من الموقع مباشرة</h1>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-zinc-300 sm:text-base">
              نفس فلسفة التطبيق: سيارة، قطعة، أو مطلوب. بدون موافقات، وملف معلن يتكوّن تلقائيًا على الموقع.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/market" className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">
              رجوع إلى السوق
            </Link>
            <Link href="/" className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </section>

      <PublishForm />
    </main>
  );
}