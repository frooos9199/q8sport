import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { loadMarketData } from "@/lib/market-data";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "قطع الغيار",
  description: "تصفح قطع غيار سيارات السبورت في الكويت مع تواصل مباشر عبر واتساب.",
  alternates: { canonical: absoluteUrl("/parts") },
  openGraph: {
    title: `قطع الغيار | ${siteConfig.name}`,
    description: "تصفح قطع غيار سيارات السبورت في الكويت.",
    url: absoluteUrl("/parts"),
    type: "website",
    images: [{ url: absoluteUrl(siteConfig.ogImage), width: 512, height: 512, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `قطع الغيار | ${siteConfig.name}`,
    description: "تصفح قطع غيار سيارات السبورت في الكويت.",
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  keywords: ["قطع غيار الكويت", "قطع سبورت", "قطع سيارات سبورت", ...siteConfig.keywords],
};

export default async function PartsPage() {
  const { partListings, sellers } = await loadMarketData();
  const sellerMap = new Map(sellers.map((s) => [s.slug, s]));

  const MAX_ITEMS = 100;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `قطع الغيار | ${siteConfig.name}`,
    itemListElement: partListings.slice(0, MAX_ITEMS).map((part, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/parts/${part.slug}`),
      name: part.title,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-6 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <h1 className="text-3xl font-black text-foreground">⚙️ قطع الغيار</h1>
        </div>
        <p className="mt-2 text-sm text-sand">{partListings.length} قطعة معروضة</p>
      </div>

      {partListings.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl">⚙️</p>
          <p className="mt-4 text-sand">لا توجد قطع غيار حالياً</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partListings.map((part) => {
            const seller = sellerMap.get(part.sellerSlug);
            return (
              <Link
                key={part.slug}
                href={`/parts/${part.slug}`}
                className={`group rounded-2xl bg-panel overflow-hidden transition hover:-translate-y-1 hover:border-brand/30 ${part.featuredAt ? "border-2 border-gold" : "border border-metal-border"}`}
              >
                <div className="relative h-40 bg-metal">
                  {part.images[0] ? (
                    <>
                      <Image src={part.images[0]} alt={part.title} fill className="object-cover" unoptimized />
                      <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-white backdrop-blur-sm">
                        <span className="text-brand">Q8</span>
                        SPORTCAR
                        <span className="text-brand">.COM</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">⚙️</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  {part.featuredAt ? (
                    <span className="absolute top-3 left-3 rounded-full border-2 border-gold bg-background/60 px-3 py-1 text-[11px] font-black text-gold backdrop-blur-sm">
                      إعلان مميز
                    </span>
                  ) : null}
                  {part.condition === "جديد" && (
                    <span className="absolute top-3 right-3 rounded-lg bg-mint px-2.5 py-1 text-xs font-bold text-white">جديد</span>
                  )}
                  {part.condition === "مستعمل" && (
                    <span className="absolute top-3 right-3 rounded-lg bg-yellow-500 px-2.5 py-1 text-xs font-bold text-white">مستعمل</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold text-sand">{part.category}</p>
                  <h3 className="mt-1 font-bold text-foreground truncate">{part.title}</h3>
                  <p className="mt-2 text-xs text-sand">{part.fitment}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-black text-brand">{part.price}</span>
                    <span className="rounded-lg bg-whatsapp/10 px-3 py-1.5 text-xs font-bold text-whatsapp">💬 تواصل</span>
                  </div>
                  {seller && <p className="mt-3 text-xs text-sand">{seller.name}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
