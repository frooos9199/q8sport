import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { loadMarketData } from "@/lib/market-data";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "السيارات",
  description: "تصفح سيارات السبورت المعروضة للبيع في الكويت مع تواصل مباشر عبر واتساب.",
  alternates: { canonical: absoluteUrl("/cars") },
  openGraph: {
    title: `السيارات | ${siteConfig.name}`,
    description: "تصفح سيارات السبورت المعروضة للبيع في الكويت.",
    url: absoluteUrl("/cars"),
    type: "website",
    images: [{ url: absoluteUrl(siteConfig.ogImage), width: 512, height: 512, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `السيارات | ${siteConfig.name}`,
    description: "تصفح سيارات السبورت المعروضة للبيع في الكويت.",
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  keywords: ["سيارات سبورت الكويت", "سيارات للبيع الكويت", "سوق سيارات الكويت", ...siteConfig.keywords],
};

export default async function CarsPage() {
  const { carListings } = await loadMarketData();

  const MAX_ITEMS = 100;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `السيارات | ${siteConfig.name}`,
    itemListElement: carListings.slice(0, MAX_ITEMS).map((car, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/cars/${car.slug}`),
      name: car.title,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-6 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-brand" />
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">🏎️ السيارات</h1>
        </div>
        <p className="mt-2 text-sm text-sand">{carListings.length} سيارة معروضة</p>
      </div>

      {carListings.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl">🏎️</p>
          <p className="mt-4 text-sand">لا توجد سيارات حالياً</p>
        </div>
      ) : (
        <div className="grid gap-4 min-[380px]:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {carListings.map((car) => (
            <Link
              key={car.slug}
              href={`/cars/${car.slug}`}
              className={`group rounded-2xl bg-panel overflow-hidden transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_8px_30px_rgba(227,30,36,0.1)] ${car.featuredAt ? "border-2 border-gold" : "border border-metal-border"}`}
            >
              <div className="relative h-44 bg-metal min-[380px]:h-32 sm:h-44 lg:h-48">
                {car.images[0] ? (
                  <>
                    <Image src={car.images[0]} alt={car.title} fill className="object-cover" unoptimized />
                    <div className="absolute bottom-3 right-3 hidden rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-white backdrop-blur-sm sm:block">
                      <span className="text-brand">Q8</span>
                      SPORTCAR
                      <span className="text-brand">.COM</span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">🏎️</div>
                )}

                <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-white backdrop-blur-sm">
                </div>
                {car.featuredAt ? (
                  <span className="absolute top-2 left-2 rounded-full border-2 border-gold bg-background/60 px-2.5 py-1 text-[10px] font-black text-gold backdrop-blur-sm sm:top-3 sm:left-3 sm:px-3 sm:text-[11px]">
                    إعلان مميز
                  </span>
                ) : null}
                <span className="absolute top-2 right-2 rounded-lg bg-brand px-2 py-1 text-[11px] font-bold text-white sm:top-3 sm:right-3 sm:px-2.5 sm:text-xs">{car.year}</span>
                {car.status === "مباع" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="rounded-lg bg-brand px-4 py-2 text-sm font-black text-white">مباع</span>
                  </div>
                )}
              </div>
              <div className="p-4 min-[380px]:p-3 sm:p-4">
                <h3 className="text-base font-bold text-foreground truncate sm:text-lg">{car.title}</h3>
                <p className="mt-1 text-xs text-sand block min-[380px]:hidden sm:block">{car.mileage} • {car.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-black text-brand sm:text-lg">{car.price}</span>
                  <span className="rounded-lg bg-whatsapp/10 px-2.5 py-1.5 text-[11px] font-bold text-whatsapp sm:px-3 sm:text-xs">💬 تواصل</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
