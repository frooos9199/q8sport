'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, MapPin, Store, Star } from 'lucide-react';

type ShopUser = {
  id: string;
  name: string;
  shopName?: string | null;
  shopAddress?: string | null;
  rating: number;
  verified: boolean;
  lastLoginAt?: string | null;
  counts?: { products: number; auctions: number; requests: number };
};

type ShopsApiResponse = {
  success?: boolean;
  error?: string;
  users?: ShopUser[];
};

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/users?role=SHOP_OWNER&status=ACTIVE&limit=200');
        const data = (await res.json()) as ShopsApiResponse;

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'فشل تحميل قائمة المحلات');
        }

        setShops(data.users || []);
      } catch (e) {
        setShops([]);
        setError(e instanceof Error ? e.message : 'فشل تحميل قائمة المحلات');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-7 w-7 text-red-600" />
              <h1 className="text-2xl font-bold text-white">المحلات</h1>
            </div>

            <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
              <span>الرئيسية</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading && <div className="text-center text-gray-300 py-12">جاري تحميل المحلات...</div>}

        {!loading && error && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && shops.length === 0 && (
          <div className="text-center text-gray-300 py-12">لا توجد محلات متاحة حالياً</div>
        )}

        {!loading && !error && shops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => {
              const title = shop.shopName || shop.name;
              const address = shop.shopAddress || 'العنوان غير محدد';
              return (
                <Link
                  key={shop.id}
                  href={`/users/${shop.id}`}
                  className="block bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-red-600/60 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-white font-bold text-lg">{title}</h2>
                        {shop.verified && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-200">
                            <CheckCircle className="h-4 w-4" />
                            موثق
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4" />
                      <span className="font-semibold text-sm">{Number(shop.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                    <span>المنتجات: {shop.counts?.products ?? 0}</span>
                    <span>المزادات: {shop.counts?.auctions ?? 0}</span>
                    <span>المطلوبات: {shop.counts?.requests ?? 0}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
