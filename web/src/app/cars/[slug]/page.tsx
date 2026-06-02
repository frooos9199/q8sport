import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCar, getSeller } from "@/lib/market-data";
import { absoluteUrl, siteConfig } from "@/lib/site";
import ImageGallery from "@/components/ImageGallery";
import ListingViewsBadge from "@/components/ListingViewsBadge";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) return { title: "إعلان غير موجود" };

  const canonical = absoluteUrl(`/cars/${car.slug}`);
  const imageUrl = car.images[0] || absoluteUrl(siteConfig.ogImage);

  return {
    title: car.title,
    description: car.summary,
    alternates: { canonical },
    keywords: [car.title, "سيارات سبورت الكويت", "سيارات للبيع الكويت", ...siteConfig.keywords],
    openGraph: {
      title: `${car.title} | ${siteConfig.name}`,
      description: car.summary,
      url: canonical,
      type: "article",
      images: [{ url: imageUrl, alt: car.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${car.title} | ${siteConfig.name}`,
      description: car.summary,
      images: [imageUrl],
    },
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) notFound();

  const seller = await getSeller(car.sellerSlug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "السيارات", item: absoluteUrl("/cars") },
      { "@type": "ListItem", position: 3, name: car.title, item: absoluteUrl(`/cars/${car.slug}`) },
    ],
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-20 pt-6 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Link href="/cars" className="mb-6 text-sm font-bold text-sand transition hover:text-foreground">← رجوع للسيارات</Link>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left - Details */}
        <div className="min-w-0 space-y-6">
          {/* Gallery */}
          <div className="rounded-2xl border border-metal-border bg-panel p-5">
            <ImageGallery images={car.images} title={car.title} />
          </div>

          {/* Title & Price */}
          <div className="rounded-2xl border border-metal-border bg-panel p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">{car.year}</span>
              {car.featuredAt ? (
                <span className="rounded-full border-2 border-gold bg-background/60 px-3 py-1.5 text-xs font-black text-gold backdrop-blur-sm">
                  إعلان مميز
                </span>
              ) : null}
              <ListingViewsBadge kind="cars" slug={car.slug} initialViews={car.views ?? 0} />
              <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${car.status === "مباع" ? "bg-brand/10 text-brand border border-brand/20" : "bg-mint/10 text-mint border border-mint/20"}`}>
                {car.status}
              </span>
            </div>
            <h1 className="text-3xl font-black text-foreground">{car.title}</h1>
            <div className="mt-4 flex items-baseline gap-3 rounded-xl border border-brand/20 bg-brand-glow p-5">
              <span className="text-3xl font-black text-brand">{car.price}</span>
            </div>
          </div>

          {/* Specs */}
          <div className="rounded-2xl border border-metal-border bg-panel p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">المواصفات</h2>
            <div className="grid grid-cols-2 gap-3">
              <SpecCard icon="📅" label="السنة" value={car.year} />
              <SpecCard icon="📏" label="الممشى" value={car.mileage} />
              <SpecCard icon="📍" label="الموقع" value={car.location} />
              {car.specs.map((spec) => (
                <SpecCard key={spec} icon="⚙️" label="مواصفة" value={spec} />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-metal-border bg-panel p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">الوصف</h2>
            <p className="text-sm leading-8 text-sand whitespace-pre-wrap">{car.summary}</p>
          </div>
        </div>

        {/* Right - Seller & CTA */}
  <div className="min-w-0 space-y-6">
          {/* WhatsApp CTA */}
          {seller?.whatsapp && (
            <a
              href={`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحبا، أبي أستفسر عن: ${car.title}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-whatsapp p-5 text-center text-lg font-black text-white transition hover:opacity-90"
            >
              💬 تواصل واتساب
            </a>
          )}

          {/* Seller Card */}
          {seller && (
            <div className="rounded-2xl border border-metal-border bg-panel p-6">
              <p className="text-xs font-bold text-sand mb-3">المعلن</p>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-xl font-black text-white">
                  {seller.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{seller.name}</h3>
                  <p className="text-xs text-sand">{seller.city} • {seller.joinedLabel}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-sand">{seller.bio}</p>
              <Link href={`/sellers/${seller.slug}`} className="mt-4 block rounded-xl border border-metal-border bg-metal py-3 text-center text-sm font-bold text-foreground transition hover:bg-panel-soft">
                عرض ملف المعلن
              </Link>
            </div>
          )}

          {/* Quick Info */}
          <div className="rounded-2xl border border-metal-border bg-panel p-6">
            <p className="text-xs font-bold text-sand mb-4">معلومات سريعة</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-sand">السعر</span><span className="font-bold text-foreground">{car.price}</span></div>
              <div className="flex justify-between"><span className="text-sand">السنة</span><span className="font-bold text-foreground">{car.year}</span></div>
              <div className="flex justify-between"><span className="text-sand">الممشى</span><span className="font-bold text-foreground">{car.mileage}</span></div>
              <div className="flex justify-between"><span className="text-sand">الحالة</span><span className="font-bold text-foreground">{car.status}</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SpecCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-metal-border bg-panel-soft p-4">
      <span className="text-lg">{icon}</span>
      <p className="mt-1 text-xs text-sand">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
