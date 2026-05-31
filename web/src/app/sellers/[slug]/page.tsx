import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSeller, getSellerFeed } from "@/lib/market-data";
import { absoluteUrl, siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seller = await getSeller(slug);

  if (!seller) {
    return {
      title: 'معلن غير موجود',
    };
  }

  const canonical = absoluteUrl(`/sellers/${seller.slug}`);

  return {
    title: seller.name,
    description: seller.bio,
    alternates: {
      canonical,
    },
    keywords: [seller.name, "معلن سيارات الكويت", "سوق سيارات الكويت", ...siteConfig.keywords],
    openGraph: {
      title: `${seller.name} | ${siteConfig.name}`,
      description: seller.bio,
      url: canonical,
      type: 'profile',
      images: [{ url: absoluteUrl(siteConfig.ogImage), width: 512, height: 512, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${seller.name} | ${siteConfig.name}`,
      description: seller.bio,
      images: [absoluteUrl(siteConfig.ogImage)],
    },
  };
}

export default async function SellerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seller = await getSeller(slug);
  if (!seller) notFound();

  const feed = await getSellerFeed(slug);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-20 pt-6 sm:px-8 lg:px-10">
      <Link href="/market" className="mb-6 text-sm font-bold text-sand">← رجوع إلى السوق</Link>

      <section className="rounded-[2rem] border border-line bg-panel px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[1.75rem] border border-brand/20 bg-brand/10 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/20 text-3xl font-black text-brand">
              {seller.name[0]}
            </div>
            <h1 className="mt-5 text-4xl font-black text-foreground">{seller.name}</h1>
            <p className="mt-3 text-sm leading-8 text-zinc-300">{seller.bio}</p>
            <div className="mt-6 space-y-2 text-sm text-zinc-400">
              <p>{seller.city}</p>
              <p>{seller.joinedLabel}</p>
              <p>{seller.responseLabel}</p>
            </div>
            {seller.whatsapp ? (
              <a
                href={`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, "")}`}
                className="mt-8 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff5b4e]"
              >
                تواصل واتساب
              </a>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="سيارات" value={String(feed.cars.length)} />
            <Stat label="قطع" value={String(feed.parts.length)} />
            <Stat label="مطلوبات" value={String(feed.wanted.length)} />
          </div>
        </div>
      </section>

      <Section title="سياراته" items={feed.cars.map((item) => ({ href: `/cars/${item.slug}`, title: item.title, meta: `${item.year} • ${item.mileage}`, price: item.price, image: item.images[0] }))} />
      <Section title="قطعه" items={feed.parts.map((item) => ({ href: `/parts/${item.slug}`, title: item.title, meta: `${item.category} • ${item.fitment}`, price: item.price, image: item.images[0] }))} />
      <Section title="مطلوباته" items={feed.wanted.map((item) => ({ href: `/wanted/${item.slug}`, title: item.title, meta: item.urgency, price: item.budget }))} />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-panel p-5">
      <div className="text-3xl font-black text-foreground">{value}</div>
      <div className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">{label}</div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: Array<{ href: string; title: string; meta: string; price: string; image?: string }> }) {
  return (
    <section className="mt-8">
      <h2 className="mb-5 text-3xl font-black text-foreground">{title}</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-[1.5rem] border border-white/8 bg-panel p-5 transition hover:-translate-y-0.5 hover:border-brand/30">
            {item.image ? (
              <div className="relative mb-4">
                <Image src={item.image} alt={item.title} width={960} height={640} className="h-44 w-full rounded-[1.25rem] object-cover" unoptimized />
                <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-white backdrop-blur-sm">
                  <span className="text-brand">Q8</span>
                  SPORTCAR
                  <span className="text-brand">.COM</span>
                </div>
              </div>
            ) : null}
            <h3 className="text-xl font-black text-foreground">{item.title}</h3>
            <p className="mt-3 text-sm text-zinc-400">{item.meta}</p>
            <p className="mt-5 font-black text-brand">{item.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}