"use client";
import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/hooks/useLocale";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

type SearchResult = {
  id: string;
  type: "car" | "part" | "request";
  title: string;
  subtitle: string;
  image?: string;
};

export default function SearchBar() {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allItems, setAllItems] = useState<SearchResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadData = async () => {
    if (loaded) return;
    try {
      const [carsSnap, partsSnap, reqSnap] = await Promise.all([
        getDocs(collection(db, "cars")),
        getDocs(collection(db, "parts")),
        getDocs(collection(db, "requests")),
      ]);

      const items: SearchResult[] = [
        ...carsSnap.docs.map((d) => {
          const data = d.data();
          return { id: d.id, type: "car" as const, title: data.title?.[locale] || data.title?.ar, subtitle: `${data.brand} ${data.model} ${data.year}`, image: data.images?.[0] };
        }),
        ...partsSnap.docs.map((d) => {
          const data = d.data();
          return { id: d.id, type: "part" as const, title: data.title?.[locale] || data.title?.ar, subtitle: `${data.price} ${t.common.kwd}`, image: data.images?.[0] };
        }),
        ...reqSnap.docs.map((d) => {
          const data = d.data();
          return { id: d.id, type: "request" as const, title: data.title?.[locale] || data.title?.ar, subtitle: data.userName || "" };
        }),
      ];
      setAllItems(items);
      setLoaded(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(allItems.filter((item) =>
      item.title?.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)
    ).slice(0, 8));
  }, [query, allItems]);

  const getLink = (item: SearchResult) => {
    if (item.type === "car") return `/${locale}/cars/${item.id}`;
    if (item.type === "part") return `/${locale}/parts/${item.id}`;
    return `/${locale}/requests`;
  };

  const getIcon = (type: string) => type === "car" ? "🏎️" : type === "part" ? "⚙️" : "📋";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); loadData(); }}
        className="text-silver hover:text-white p-2 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full end-0 mt-2 w-80 md:w-96 glass rounded-xl shadow-2xl shadow-black/50 animate-scaleIn z-50">
          <div className="p-3">
            <input
              type="text"
              placeholder={t.common.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field text-sm"
              autoFocus
            />
          </div>

          {results.length > 0 && (
            <div className="max-h-80 overflow-y-auto border-t border-metal">
              {results.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={getLink(item)}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 p-3 hover:bg-metal/50 transition-colors"
                >
                  {item.image ? (
                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <span className="text-xl w-10 h-10 flex items-center justify-center">{getIcon(item.type)}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-silver/50 text-xs truncate">{item.subtitle}</p>
                  </div>
                  <span className="text-xs text-silver/30">{getIcon(item.type)}</span>
                </Link>
              ))}
            </div>
          )}

          {query && results.length === 0 && (
            <div className="p-6 text-center text-silver/50 text-sm border-t border-metal">
              {t.common.noResults}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
