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
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ProgramStat value="10" label="أول المؤسسين" />
              <ProgramStat value="60+" label="نقطة نشاط" />
              <ProgramStat value="0 د.ك" label="إعلانات مجانية" />
            </div>
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

      <section className="mt-8 rounded-[2rem] border border-mint/20 bg-[linear-gradient(135deg,rgba(94,226,182,0.12),rgba(13,13,13,0.95))] px-6 py-8 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-mint">Founders Reward</p>
        <h2 className="mt-3 text-2xl font-black text-foreground sm:text-3xl">انشر مبكرًا وادخل قائمة المؤسسين</h2>
        <p className="mt-4 max-w-4xl text-sm leading-8 text-zinc-200 sm:text-base">
          أول 10 معلنين يتجاوزون حد النشاط من خلال سياراتهم وقطعهم ومطلوباتهم الفعالة يظهرون تلقائيًا في صفحة السوق، ويحصلون على امتياز الإعلانات المجانية بشكل مستمر.
        </p>
      </section>

      <PublishForm />
    </main>
  );
}

function ProgramStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">{label}</div>
    </div>
  );
}