import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPart, getSeller } from "@/lib/market-data";
import { absoluteUrl, siteConfig } from "@/lib/site";
import ImageGallery from "@/components/ImageGallery";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const part = await getPart(slug);
  if (!part) return { title: "إعلان غير موجود" };

  const canonical = absoluteUrl(`/parts/${part.slug}`);
  const imageUrl = part.images[0] || absoluteUrl(siteConfig.ogImage);

  return {
    title: part.title,
    description: part.summary,
    alternates: { canonical },
    keywords: [part.title, "قطع غيار الكويت", "قطع سبورت", ...siteConfig.keywords],
    openGraph: {
      title: `${part.title} | ${siteConfig.name}`,
      description: part.summary,
      url: canonical,
      type: "article",
      images: [{ url: imageUrl, alt: part.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${part.title} | ${siteConfig.name}`,
      description: part.summary,
      images: [imageUrl],
    },
  };
}

export default async function PartDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const part = await getPart(slug);
  if (!part) notFound();

  const seller = await getSeller(part.sellerSlug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "قطع الغيار", item: absoluteUrl("/parts") },
      { "@type": "ListItem", position: 3, name: part.title, item: absoluteUrl(`/parts/${part.slug}`) },
    ],
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-20 pt-6 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Link href="/parts" className="mb-6 text-sm font-bold text-sand transition hover:text-foreground">← رجوع لقطع الغيار</Link>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 space-y-6">
          {/* Gallery */}
          <div className="rounded-2xl border border-metal-border bg-panel p-5">
            <ImageGallery images={part.images} title={part.title} />
          </div>

          {/* Title & Price */}
          <div className="rounded-2xl border border-metal-border bg-panel p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="rounded-lg bg-sand/10 border border-sand/20 px-3 py-1.5 text-xs font-bold text-sand">{part.category}</span>
              {part.featuredAt ? (
                <span className="rounded-full border-2 border-gold bg-background/60 px-3 py-1.5 text-xs font-black text-gold backdrop-blur-sm">
                  إعلان مميز
                </span>
              ) : null}
              <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${part.condition === "جديد" ? "bg-mint/10 text-mint border border-mint/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"}`}>
                {part.condition}
              </span>
            </div>
            <h1 className="text-3xl font-black text-foreground">{part.title}</h1>
            <div className="mt-4 flex items-baseline gap-3 rounded-xl border border-brand/20 bg-brand-glow p-5">
              <span className="text-3xl font-black text-brand">{part.price}</span>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-2xl border border-metal-border bg-panel p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">التفاصيل</h2>
            <div className="grid grid-cols-2 gap-3">
              <SpecCard icon="📂" label="التصنيف" value={part.category} />
              <SpecCard icon="🔧" label="التوافق" value={part.fitment} />
              <SpecCard icon="✅" label="الحالة" value={part.condition} />
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-metal-border bg-panel p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">الوصف</h2>
            <p className="text-sm leading-8 text-sand whitespace-pre-wrap">{part.summary}</p>
          </div>
        </div>

        {/* Right */}
  <div className="min-w-0 space-y-6">
          {seller?.whatsapp && (
            <a
              href={`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحبا، أبي أستفسر عن: ${part.title}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-whatsapp p-5 text-center text-lg font-black text-white transition hover:opacity-90"
            >
              💬 تواصل واتساب
            </a>
          )}

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
