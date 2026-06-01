"use client";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import { Part } from "@/types";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function PartCard({ part }: { part: Part }) {
  const { locale, t } = useLocale();
  const partTitle = part.title?.[locale] || part.title?.ar;

  return (
    <div className="card group">
      <Link href={`/${locale}/parts/${part.id}`}>
        <div className="relative h-40 bg-metal overflow-hidden">
          {part.images?.[0] ? (
            <img src={part.images[0]} alt={part.title[locale]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-silver/30">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 start-3">
            <span className={`badge ${part.condition === "new" ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"}`}>
              {part.condition === "new" ? t.common.new : t.common.used}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/${locale}/parts/${part.id}`}>
          <h3 className="text-white font-bold mb-1 truncate hover:text-primary transition-colors">{part.title[locale]}</h3>
        </Link>
        <p className="text-silver/60 text-xs mb-3">{t.parts[part.category as keyof typeof t.parts] || part.category}</p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-primary font-black text-lg">{part.price.toLocaleString()} <span className="text-xs text-silver/60">{t.common.kwd}</span></span>
        </div>

        <div className="flex gap-2">
          <Link href={`/${locale}/parts/${part.id}`} className="btn-secondary text-sm !py-2 flex-1 text-center">
            {t.common.details}
          </Link>
          <WhatsAppButton phone={part.userWhatsapp} message={`${t.common.whatsappMsgPart} ${partTitle || ""}`} />
        </div>
      </div>
    </div>
  );
}
