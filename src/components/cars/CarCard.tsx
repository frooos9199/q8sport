"use client";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import { Car } from "@/types";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function CarCard({ car }: { car: Car }) {
  const { locale, t } = useLocale();
  const carTitle = car.title?.[locale] || car.title?.ar;

  return (
    <div className="card group">
      <div className="relative h-48 bg-metal overflow-hidden">
        {car.images?.[0] ? (
          <img src={car.images[0]} alt={car.title[locale]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-silver/30">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {car.status === "sold" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-primary text-2xl font-black">{t.common.sold}</span>
          </div>
        )}
        <div className="absolute top-3 start-3">
          <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">{car.year}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1 truncate">{car.title[locale]}</h3>
        <p className="text-silver/60 text-sm mb-3">{car.brand} • {car.model}</p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-primary font-black text-xl">{car.price.toLocaleString()} <span className="text-xs text-silver/60">{t.common.kwd}</span></span>
          <span className="text-silver/50 text-xs">{car.mileage?.toLocaleString()} {t.common.km}</span>
        </div>

        <div className="flex gap-2">
          <Link href={`/${locale}/cars/${car.id}`} className="btn-secondary text-sm !py-2 flex-1 text-center">
            {t.cars.details}
          </Link>
          <div className="relative -top-1">
            <WhatsAppButton phone={car.userWhatsapp} message={`${t.common.whatsappMsgCar} ${carTitle || ""}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
