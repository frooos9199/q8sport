import Image from "next/image";
import Link from "next/link";

import { loadMarketData } from "@/lib/market-data";

export default async function MarketPage() {
  const { carListings, partListings, sellers, source, wantedListings } = await loadMarketData();
  const sellerMap = new Map(sellers.map((seller) => [seller.slug, seller]));

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-20 pt-6 sm:px-8 lg:px-10">
      <section className="rounded-[2rem] border border-line bg-panel px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Browse Market</p>
            <h1 className="mt-3 text-4xl font-black text-foreground sm:text-5xl">استكشف السوق بالكامل</h1>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-zinc-300 sm:text-base">
              السوق هنا يقرأ من نفس مسارات التطبيق عند توفر اتصال Firebase، ويرجع تلقائيًا إلى محتوى عرض احتياطي إذا كانت البيانات غير متاحة.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-zinc-300">
              {source === "firebase" ? "متصل ببيانات السوق الحقيقية" : "وضع العرض الاحتياطي مفعل حتى يكتمل اتصال Firebase"}
            </div>
          </div>
          <Link href="/sell" className="rounded-full bg-brand px-6 py-4 text-center text-sm font-black text-white transition hover:bg-[#ff5b4e]">
            انشر إعلان جديد
          </Link>
        </div>
      </section>

      <Section title="السيارات" eyebrow="Cars">
        <div className="grid gap-4 lg:grid-cols-3">
          {carListings.map((car) => (
            <Link key={car.slug} href={`/cars/${car.slug}`} className="rounded-[1.5rem] border border-white/8 bg-panel p-5 transition hover:-translate-y-0.5 hover:border-brand/30">
              <ListingMedia title={car.title} image={car.images[0]} tone="brand" />
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-brand/25 bg-brand/10 px-3 py-2 text-xs font-bold text-brand">{car.status}</span>
                <span className="text-xs font-bold text-zinc-500">{car.location}</span>
              </div>
              <h2 className="mt-5 text-2xl font-black text-foreground">{car.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{car.summary}</p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="font-black text-brand">{car.price}</span>
                <span className="text-zinc-400">{car.year} • {car.mileage}</span>
              </div>
              <p className="mt-4 text-sm font-bold text-zinc-300">{sellerMap.get(car.sellerSlug)?.name || "معلن السوق"}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="قطع الغيار" eyebrow="Parts">
        <div className="grid gap-4 lg:grid-cols-3">
          {partListings.map((part) => (
            <Link key={part.slug} href={`/parts/${part.slug}`} className="rounded-[1.5rem] border border-white/8 bg-panel p-5 transition hover:-translate-y-0.5 hover:border-brand/30">
              <ListingMedia title={part.title} image={part.images[0]} tone="sand" />
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-sand">{part.category}</p>
              <h2 className="mt-4 text-2xl font-black text-foreground">{part.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{part.summary}</p>
              <div className="mt-5 space-y-2 text-sm text-zinc-400">
                <p>{part.fitment}</p>
                <p>{part.condition}</p>
              </div>
              <p className="mt-5 font-black text-brand">{part.price}</p>
              <p className="mt-4 text-sm font-bold text-zinc-300">{sellerMap.get(part.sellerSlug)?.name || "معلن السوق"}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="المطلوب الآن" eyebrow="Wanted">
        <div className="grid gap-4 lg:grid-cols-3">
          {wantedListings.map((wanted) => (
            <Link key={wanted.slug} href={`/wanted/${wanted.slug}`} className="rounded-[1.5rem] border border-mint/20 bg-[linear-gradient(180deg,rgba(94,226,182,0.09),rgba(17,17,17,0.95))] p-5 transition hover:-translate-y-0.5 hover:border-mint/40">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-mint/25 bg-mint/10 px-3 py-2 text-xs font-bold text-mint">{wanted.category}</span>
                <span className="text-xs font-bold text-zinc-300">{wanted.urgency}</span>
              </div>
              <h2 className="mt-5 text-2xl font-black text-foreground">{wanted.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{wanted.summary}</p>
              <p className="mt-5 font-black text-mint">{wanted.budget}</p>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}

function ListingMedia({ image, title, tone }: { image?: string; title: string; tone: "brand" | "sand" }) {
  if (image) {
    return <Image src={image} alt={title} width={960} height={640} className="mb-5 h-52 w-full rounded-[1.25rem] object-cover" unoptimized />;
  }

  const accent = tone === "brand" ? "from-brand/30" : "from-sand/20";

  return (
    <div className={`mb-5 flex h-52 w-full items-end rounded-[1.25rem] border border-white/8 bg-gradient-to-br ${accent} to-black/20 p-4`}>
      <span className="text-sm font-black text-foreground">{title}</span>
    </div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-black text-foreground">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}