import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSeller, getWanted } from "@/lib/market-data";
import { absoluteUrl, siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const wanted = await getWanted(slug);

  if (!wanted) {
    return {
      title: 'مطلوب غير موجود',
    };
  }

  return {
    title: wanted.title,
    description: wanted.summary,
    alternates: {
      canonical: absoluteUrl(`/wanted/${wanted.slug}`),
    },
    openGraph: {
      title: `${wanted.title} | ${siteConfig.name}`,
      description: wanted.summary,
      url: absoluteUrl(`/wanted/${wanted.slug}`),
      type: 'article',
    },
  };
}

export default async function WantedDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wanted = await getWanted(slug);
  if (!wanted) notFound();

  const seller = await getSeller(wanted.sellerSlug);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-20 pt-6 sm:px-8 lg:px-10">
      <Link href="/wanted" className="mb-6 text-sm font-bold text-sand">← رجوع للمطلوبات</Link>
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-mint/20 bg-[linear-gradient(180deg,rgba(94,226,182,0.08),rgba(17,17,17,0.95))] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Wanted Detail</p>
          <h1 className="mt-3 text-4xl font-black text-foreground">{wanted.title}</h1>
          <p className="mt-5 text-sm leading-8 text-zinc-200 sm:text-base">{wanted.summary}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Info label="الميزانية" value={wanted.budget} />
            <Info label="النوع" value={wanted.category} />
            <Info label="الحالة" value={wanted.urgency} />
          </div>
        </div>

        <aside className="rounded-[2rem] border border-line bg-panel p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Owner</p>
          <h2 className="mt-3 text-3xl font-black text-foreground">{seller?.name}</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-300">{seller?.bio}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {seller?.whatsapp ? (
              <a href={`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, "")}`} className="inline-flex rounded-full bg-mint px-5 py-3 text-sm font-black text-black transition hover:bg-[#82f0ca]">
                تواصل واتساب
              </a>
            ) : null}
            {seller ? (
              <Link href={`/sellers/${seller.slug}`} className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">
                افتح ملف المعلن
              </Link>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-black/20 p-4">
      <p className="text-xs font-bold text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-black text-foreground">{value}</p>
    </div>
  );
}