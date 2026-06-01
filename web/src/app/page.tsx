import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { loadMarketData } from "@/lib/market-data";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Q8 Sport Market | سوق سيارات السبورت بالكويت",
  description: siteConfig.description,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: `${siteConfig.name} | سوق سيارات السبورت بالكويت`,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    type: "website",
    images: [{ url: absoluteUrl(siteConfig.ogImage), width: 512, height: 512, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | سوق سيارات السبورت بالكويت`,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  keywords: siteConfig.keywords,
};

export default async function Home() {
  const { carListings, partListings, wantedListings } = await loadMarketData();

  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.q8sportcar.app';
  const APP_STORE_URL = 'https://apps.apple.com/us/app/q8sportapp/id6757956229';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: siteConfig.name, url: siteConfig.url, description: siteConfig.description, inLanguage: 'ar-KW' },
      { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url, logo: absoluteUrl('/favicon.ico') },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-metal-border bg-panel mt-6 px-6 py-16 text-center sm:px-12 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,30,36,0.1),transparent_50%)]" />
        <div className="relative">
          <div className="animate-fade-up">
            <span className="text-5xl font-black text-brand sm:text-7xl">Q8</span>
            <span className="mr-3 text-2xl font-bold tracking-widest text-foreground sm:text-3xl">SPORT CAR</span>
          </div>
          <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-brand animate-fade-up" />
          <h1 className="mx-auto mt-8 max-w-2xl text-2xl font-black leading-relaxed text-foreground sm:text-4xl animate-fade-up-delay">
            اكتشف أقوى سيارات السبورت في الكويت
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-sand sm:text-base animate-fade-up-delay-2">
            بيع، شراء، وتبادل سيارات وقطع غيار السبورت مع تواصل مباشر
          </p>

          {/* Stats */}
          <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-6 rounded-2xl border border-metal-border bg-background/50 px-6 py-5 backdrop-blur-sm animate-fade-up-delay-2">
            <Stat value={`${carListings.length}+`} label="سيارة" />
            <div className="h-8 w-px bg-metal-border" />
            <Stat value={`${partListings.length}+`} label="قطعة" />
            <div className="h-8 w-px bg-metal-border" />
            <Stat value="24/7" label="متاح" />
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-up-delay-2">
            <Link href="/market" className="rounded-xl bg-brand px-8 py-4 text-sm font-black text-white transition hover:bg-brand-dark animate-pulse-glow">
              🏎️  تصفح السيارات
            </Link>
            <Link href="/parts" className="rounded-xl border border-metal-border bg-metal px-8 py-4 text-sm font-bold text-foreground transition hover:bg-panel-soft">
              ⚙️  قطع الغيار
            </Link>
          </div>

          {/* App download */}
          <div className="mt-8 flex flex-col items-center gap-3 animate-fade-up-delay-2">
            <div className="text-xs font-black text-sand">حمّل التطبيق وابدأ الآن</div>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-brand px-6 py-3 text-sm font-black text-white transition hover:bg-brand-dark"
              >
                 App Store
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-metal-border bg-metal px-6 py-3 text-sm font-bold text-foreground transition hover:bg-panel-soft"
              >
                ▶ Google Play
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cars Section */}
      <section className="mt-12">
        <SectionHeader title="السيارات" icon="🏎️" href="/cars" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {carListings.slice(0, 6).map((car) => (
            <Link
              key={car.slug}
              href={`/cars/${car.slug}`}
              className={`group rounded-2xl bg-panel overflow-hidden transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_8px_30px_rgba(227,30,36,0.1)] ${car.featuredAt ? "border-2 border-gold" : "border border-metal-border"}`}
            >
              <div className="relative h-48 bg-metal">
                {car.images[0] ? (
                  <>
                    <Image src={car.images[0]} alt={car.title} fill className="object-cover" unoptimized />
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-white backdrop-blur-sm">
                      <span className="text-brand">Q8</span>
                      SPORTCAR
                      <span className="text-brand">.COM</span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">🏎️</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {car.featuredAt ? (
                  <span className="absolute top-3 left-3 rounded-full border-2 border-gold bg-background/60 px-3 py-1 text-[11px] font-black text-gold backdrop-blur-sm">
                    إعلان مميز
                  </span>
                ) : null}
                <span className="absolute top-3 right-3 rounded-lg bg-brand px-2.5 py-1 text-xs font-bold text-white">{car.year}</span>
                {car.status === "مباع" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="rounded-lg bg-brand px-4 py-2 text-sm font-black text-white">مباع</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground truncate">{car.title}</h3>
                <p className="mt-1 text-xs text-sand">{car.mileage} • {car.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-black text-brand">{car.price}</span>
                  <span className="rounded-lg bg-whatsapp/10 px-3 py-1.5 text-xs font-bold text-whatsapp">💬 تواصل</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Parts Section */}
      <section className="mt-12">
        <SectionHeader title="قطع الغيار" icon="⚙️" href="/parts" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partListings.slice(0, 6).map((part) => (
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
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-sand">{part.category}</p>
                <h3 className="mt-1 font-bold text-foreground truncate">{part.title}</h3>
                <p className="mt-3 text-lg font-black text-brand">{part.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Wanted Section */}
      <section className="mt-12">
        <SectionHeader title="المطلوب الآن" icon="📋" href="/wanted" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wantedListings.slice(0, 6).map((wanted) => (
            <div key={wanted.slug} className="rounded-2xl border border-mint/20 bg-gradient-to-b from-mint/5 to-panel p-5 transition hover:-translate-y-1 hover:border-mint/40">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-bold text-mint">{wanted.category}</span>
                <span className="text-xs font-bold text-sand">{wanted.urgency}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{wanted.title}</h3>
              <p className="mt-2 text-sm leading-7 text-sand line-clamp-2">{wanted.summary}</p>
              <p className="mt-4 text-lg font-black text-mint">{wanted.budget}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-16 rounded-3xl border border-brand/20 bg-gradient-to-br from-brand-glow to-panel p-8 text-center sm:p-12">
        <h2 className="text-2xl font-black text-foreground sm:text-3xl">عندك سيارة سبورت؟</h2>
        <p className="mt-3 text-sm text-sand">أعرضها الحين وتواصل مع المهتمين مباشرة</p>
        <Link href="/sell" className="mt-8 inline-block rounded-xl bg-brand px-10 py-4 text-sm font-black text-white transition hover:bg-brand-dark">
          🚀 أضف سيارتك
        </Link>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-black text-brand">{value}</div>
      <div className="mt-1 text-xs text-sand">{label}</div>
    </div>
  );
}

function SectionHeader({ title, icon, href }: { title: string; icon: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-brand" />
        <h2 className="text-xl font-black text-foreground">{icon} {title}</h2>
      </div>
      <Link href={href} className="rounded-full bg-metal border border-metal-border px-4 py-2 text-xs font-bold text-brand transition hover:bg-panel-soft">
        الكل ←
      </Link>
    </div>
  );
}
