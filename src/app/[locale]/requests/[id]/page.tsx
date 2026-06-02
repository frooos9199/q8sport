"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";

import { useLocale } from "@/hooks/useLocale";
import { db } from "@/lib/firebase";
import { Request } from "@/types";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function RequestDetailsPage({ params }: { params: { id: string; locale: string } }) {
  const { locale, t } = useLocale();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const snap = await getDoc(doc(db, "requests", params.id));
        if (snap.exists()) setRequest({ id: snap.id, ...snap.data() } as Request);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchRequest();
  }, [params.id]);

  const requestTitle = useMemo(() => request?.title?.[locale] || request?.title?.ar || "", [locale, request?.title]);

  if (loading) return <div className="text-center py-20 text-silver/50 animate-pulse">{t.common.loading}</div>;
  if (!request) return <div className="text-center py-20 text-silver/50">{t.common.noResults}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href={`/${locale}/requests`} className="text-silver/60 hover:text-primary text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        {locale === "ar" ? "→ رجوع للطلبات" : "← Back to Requests"}
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`badge ${request.status === "open" ? "badge-active" : "badge-sold"}`}>
                {request.status === "open" ? t.common.open : t.common.closed}
              </span>
              <span className="text-xs text-silver/40 bg-metal px-2 py-1 rounded">
                {t.requests[request.category as keyof typeof t.requests] || request.category}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">{requestTitle}</h1>
            <p className="mt-2 text-sm text-silver/60">{request.userName}</p>
          </div>
        </div>

        <p className="mt-6 text-silver/80 leading-8">{request.description?.[locale] || request.description?.ar}</p>

        {request.budget ? (
          <p className="mt-6 text-primary font-black">
            {t.requests.budget}: {Number(request.budget).toLocaleString()} {t.common.kwd}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-silver/50 text-sm">{t.common.contactWhatsapp}</span>
          <WhatsAppButton phone={request.userWhatsapp} message={`${t.common.whatsappMsgRequest} ${requestTitle || ""}`} />
        </div>
      </div>
    </div>
  );
}
