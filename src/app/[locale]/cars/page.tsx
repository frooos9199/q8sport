"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Car, CAR_BRANDS } from "@/types";
import CarCard from "@/components/cars/CarCard";
import Link from "next/link";

export default function CarsPage() {
  const { locale, t } = useLocale();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  useEffect(() => {
    async function fetchCars() {
      try {
        const q = query(collection(db, "cars"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setCars(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Car)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchCars();
  }, []);

  const filtered = cars.filter((car) => {
    if (brandFilter && car.brand !== brandFilter) return false;
    if (yearFrom && car.year < Number(yearFrom)) return false;
    if (yearTo && car.year > Number(yearTo)) return false;
    if (priceFrom && car.price < Number(priceFrom)) return false;
    if (priceTo && car.price > Number(priceTo)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title flex items-center gap-3">🏎️ {t.cars.title}</h1>
        <Link href={`/${locale}/dashboard`} className="btn-primary text-sm">{t.cars.addCar}</Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="input-field text-sm">
            <option value="">{t.common.brand} - {t.common.all}</option>
            {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <input type="number" placeholder={`${t.common.year} ${t.common.from}`} value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} className="input-field text-sm" />
          <input type="number" placeholder={`${t.common.year} ${t.common.to}`} value={yearTo} onChange={(e) => setYearTo(e.target.value)} className="input-field text-sm" />
          <input type="number" placeholder={`${t.common.price} ${t.common.from}`} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} className="input-field text-sm" />
          <input type="number" placeholder={`${t.common.price} ${t.common.to}`} value={priceTo} onChange={(e) => setPriceTo(e.target.value)} className="input-field text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-silver/50">{t.common.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-silver/50">{t.common.noResults}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((car) => <CarCard key={car.id} car={car} />)}
        </div>
      )}
    </div>
  );
}
