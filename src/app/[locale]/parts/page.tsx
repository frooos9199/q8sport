"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Part, PART_CATEGORIES } from "@/types";
import PartCard from "@/components/parts/PartCard";
import Link from "next/link";

export default function PartsPage() {
  const { locale, t } = useLocale();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [condFilter, setCondFilter] = useState("");

  useEffect(() => {
    async function fetchParts() {
      try {
        const q = query(collection(db, "parts"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setParts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Part)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchParts();
  }, []);

  const filtered = parts.filter((p) => {
    if (catFilter && p.category !== catFilter) return false;
    if (condFilter && p.condition !== condFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title flex items-center gap-3">⚙️ {t.parts.title}</h1>
        <Link href={`/${locale}/dashboard`} className="btn-primary text-sm">{t.parts.addPart}</Link>
      </div>

      <div className="card p-4 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input-field text-sm">
            <option value="">{t.parts.category} - {t.common.all}</option>
            {PART_CATEGORIES.map((c) => <option key={c} value={c}>{t.parts[c as keyof typeof t.parts] || c}</option>)}
          </select>
          <select value={condFilter} onChange={(e) => setCondFilter(e.target.value)} className="input-field text-sm">
            <option value="">{t.common.condition} - {t.common.all}</option>
            <option value="new">{t.common.new}</option>
            <option value="used">{t.common.used}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-silver/50">{t.common.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-silver/50">{t.common.noResults}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((part) => <PartCard key={part.id} part={part} />)}
        </div>
      )}
    </div>
  );
}
