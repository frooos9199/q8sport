import type { Metadata } from "next";
import { loadMarketData } from "@/lib/market-data";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "المطلوب الآن",
  description: "تصفح المطلوبات المباشرة من المستخدمين - سيارات وقطع غيار مطلوبة في الكويت",
  alternates: { canonical: absoluteUrl("/wanted") },
};

export default async function WantedPage() {
  const { wantedListings, sellers } = await loadMarketData();
  const sellerMap = new Map(sellers.map((s) => [s.slug, s]));

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-6 sm:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-mint" />
          <h1 className="text-3xl font-black text-foreground">📋 المطلوب الآن</h1>
        </div>
        <p className="mt-2 text-sm text-sand">{wantedListings.length} طلب نشط</p>
      </div>

      {wantedListings.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-4 text-sand">لا توجد طلبات حالياً</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wantedListings.map((wanted) => {
            const seller = sellerMap.get(wanted.sellerSlug);
            return (
              <div key={wanted.slug} className="rounded-2xl border border-mint/20 bg-gradient-to-b from-mint/5 to-panel p-5 transition hover:-translate-y-1 hover:border-mint/40">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full border border-mint/20 bg-mint/10 px-3 py-1.5 text-xs font-bold text-mint">
                    <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                    {wanted.category}
                  </span>
                  <span className="text-xs font-bold text-sand">{wanted.urgency}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{wanted.title}</h3>
                <p className="mt-2 text-sm leading-7 text-sand line-clamp-3">{wanted.summary}</p>
                <div className="mt-4 flex items-center justify-between border-t border-metal-border pt-4">
                  <span className="text-lg font-black text-mint">{wanted.budget}</span>
                  {seller && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-metal text-xs font-bold text-foreground">
                        {seller.name[0]}
                      </div>
                      <span className="text-xs text-sand">{seller.name}</span>
                    </div>
                  )}
                </div>
                {seller?.whatsapp && (
                  <a
                    href={`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحبا، بخصوص طلبك: ${wanted.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block rounded-xl bg-whatsapp py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                  >
                    💬 تواصل عبر واتساب
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
