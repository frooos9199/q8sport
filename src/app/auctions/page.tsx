'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Clock, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

interface AuctionListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  carModel: string;
  carYear: number | null;
  condition: string | null;
  startingPrice: number;
  currentPrice: number;
  currentBid: number;
  endTime: string;
  images: string[];
  status: string;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  totalBids: number;
}

interface AuctionsApiResponse {
  auctions: AuctionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function getApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  if (!('error' in payload)) return null;
  const errorValue = (payload as { error?: unknown }).error;
  return typeof errorValue === 'string' ? errorValue : null;
}

function formatTimeRemaining(endTime: string, nowMs: number): string {
  const diff = new Date(endTime).getTime() - nowMs;
  const ms = Math.max(0, diff);
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

export default function AuctionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctions, setAuctions] = useState<AuctionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/auctions?status=ACTIVE&page=${page}&limit=12`);
        const data = (await res.json()) as unknown;

        if (!res.ok) {
          setError(getApiErrorMessage(data) || 'حدث خطأ في جلب المزادات');
          setAuctions([]);
          setPages(1);
          return;
        }

        const payload = data as AuctionsApiResponse;
        setAuctions(payload.auctions || []);
        setPages(payload.pagination?.pages || 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'حدث خطأ في جلب المزادات');
        setAuctions([]);
        setPages(1);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400 text-lg">جاري تحميل المزادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center ml-6 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة للرئيسية</span>
              </button>
              <Car className="h-8 w-8 text-red-600 ml-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">المزادات النشطة</h1>
                <p className="text-gray-400">قطع غيار السيارات الرياضية</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3 rounded mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">تعذر تحميل المزادات</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={() => {
                setPage(1);
                setError(null);
                setLoading(true);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              title="إعادة المحاولة"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-400 text-sm">عدد المزادات: {auctions.length}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg border border-gray-800 text-gray-300 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <div className="text-gray-400 text-sm">
              صفحة {page} من {pages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-3 py-2 rounded-lg border border-gray-800 text-gray-300 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <div
              key={auction.id}
              className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-red-600 transition-all"
            >
              <div className="h-48 bg-black flex items-center justify-center border-b border-gray-800">
                {auction.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Car className="h-16 w-16 text-red-600" />
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{auction.title}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-1">
                  {auction.category} • {auction.carModel}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">السعر الحالي</p>
                    <p className="text-lg font-bold text-green-500">{auction.currentBid} د.ك</p>
                    <p className="text-xs text-gray-500">مزايدات: {auction.totalBids}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">متبقي</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      <p className="text-lg font-bold text-red-500">{formatTimeRemaining(auction.endTime, now)}</p>
                    </div>
                    <p className="text-xs text-gray-500">البائع: {auction.seller?.name || '—'}</p>
                  </div>
                </div>

                <Link
                  href={`/auctions/${auction.id}`}
                  className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-lg font-bold transition-colors"
                >
                  شارك في المزاد
                </Link>
              </div>
            </div>
          ))}
        </div>

        {auctions.length === 0 && !error && (
          <div className="text-center mt-12">
            <p className="text-gray-400">لا توجد مزادات نشطة حالياً.</p>
            <Link href="/" className="inline-block mt-4 text-red-500 hover:text-red-400 underline">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}