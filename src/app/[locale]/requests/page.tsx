"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Request } from "@/types";
import RequestCard from "@/components/requests/RequestCard";
import Link from "next/link";

export default function RequestsPage() {
  const { locale, t } = useLocale();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Request)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchRequests();
  }, []);

  const filtered = requests.filter((r) => {
    if (catFilter && r.category !== catFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title flex items-center gap-3">📋 {t.requests.title}</h1>
        <Link href={`/${locale}/dashboard`} className="btn-primary text-sm">{t.requests.addRequest}</Link>
      </div>

      <div className="card p-4 mb-8">
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input-field text-sm max-w-xs">
          <option value="">{t.common.all}</option>
          <option value="car">{t.requests.car}</option>
          <option value="part">{t.requests.part}</option>
          <option value="other">{t.parts.other}</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-silver/50">{t.common.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-silver/50">{t.common.noResults}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((req) => <RequestCard key={req.id} request={req} />)}
        </div>
      )}
    </div>
  );
}
