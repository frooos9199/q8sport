import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCar, getSeller } from "@/lib/market-data";
import { absoluteUrl, siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCar(slug);

  if (!car) {
    return {
      title: 'إعلان غير موجود',
    };
  }

  return {
    title: car.title,
    description: car.summary,
    alternates: {
      canonical: absoluteUrl(`/cars/${car.slug}`),
    },
    openGraph: {
      title: `${car.title} | ${siteConfig.name}`,
      description: car.summary,
      url: absoluteUrl(`/cars/${car.slug}`),
      type: 'article',
      images: car.images[0]
        ? [
            {
              url: car.images[0],
              alt: car.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) notFound();

  const seller = await getSeller(car.sellerSlug);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-20 pt-6 sm:px-8 lg:px-10">
      <Link href="/market" className="mb-6 text-sm font-bold text-sand">← رجوع إلى السوق</Link>
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-line bg-panel p-6 sm:p-8">
          <ListingHero title={car.title} image={car.images[0]} />
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Car Details</p>
          <h1 className="mt-3 text-4xl font-black text-foreground">{car.title}</h1>
          <p className="mt-5 text-sm leading-8 text-zinc-300 sm:text-base">{car.summary}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Info label="السعر" value={car.price} />
            <Info label="السنة" value={car.year} />
            <Info label="الممشى" value={car.mileage} />
            <Info label="الموقع" value={car.location} />
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-panel-soft p-5">
            <p className="text-sm font-black text-foreground">المواصفات</p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {car.specs.map((spec) => (
                <li key={spec}>• {spec}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-line bg-[linear-gradient(180deg,#181818_0%,#0d0d0d_100%)] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Seller</p>
          <h2 className="mt-3 text-3xl font-black text-foreground">{seller?.name}</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-300">{seller?.bio}</p>
          <div className="mt-6 space-y-3 text-sm text-zinc-400">
            <p>{seller?.city}</p>
            <p>{seller?.joinedLabel}</p>
            <p>{seller?.responseLabel}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {seller?.whatsapp ? (
              <a href={`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, "")}`} className="inline-flex rounded-full bg-brand px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff5b4e]">
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

function ListingHero({ image, title }: { image?: string; title: string }) {
  if (image) {
    return <Image src={image} alt={title} width={1280} height={720} className="mb-6 h-72 w-full rounded-[1.5rem] object-cover" unoptimized />;
  }

  return (
    <div className="mb-6 flex h-72 w-full items-end rounded-[1.5rem] border border-white/8 bg-[linear-gradient(135deg,rgba(239,59,45,0.24),rgba(17,17,17,0.9))] p-5">
      <span className="text-lg font-black text-foreground">{title}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs font-bold text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-black text-foreground">{value}</p>
    </div>
  );
}