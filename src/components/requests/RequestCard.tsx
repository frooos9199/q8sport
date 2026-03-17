"use client";
import { useLocale } from "@/hooks/useLocale";
import { Request } from "@/types";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function RequestCard({ request }: { request: Request }) {
  const { locale, t } = useLocale();

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`badge ${request.status === "open" ? "badge-active" : "badge-sold"} mb-2`}>
            {request.status === "open" ? t.common.open : t.common.closed}
          </span>
          <h3 className="text-white font-bold text-lg">{request.title[locale]}</h3>
        </div>
        <span className="text-xs text-silver/40 bg-metal px-2 py-1 rounded">
          {t.requests[request.category as keyof typeof t.requests] || request.category}
        </span>
      </div>

      <p className="text-silver/70 text-sm mb-4 line-clamp-2">{request.description[locale]}</p>

      {request.budget && (
        <p className="text-primary font-bold mb-4">
          {t.requests.budget}: {request.budget.toLocaleString()} {t.common.kwd}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-silver/50 text-sm">{request.userName}</span>
        <WhatsAppButton phone={request.userWhatsapp} message={`مرحبا، بخصوص طلبك: ${request.title.ar}`} />
      </div>
    </div>
  );
}
