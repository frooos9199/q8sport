'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Car, 
  Clock, 
  Zap, 
  Heart, 
  Share2, 
  User
} from 'lucide-react';
import { formatDateShort } from '@/utils/dateUtils';

interface ApiAuctionBid {
  id: string;
  amount: number;
  createdAt: string;
  bidder: {
    id: string;
    name: string;
  };
}

interface ApiAuctionDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  carModel: string;
  carYear: number | null;
  partNumber: string | null;
  condition: string | null;
  startingPrice: number;
  currentPrice: number;
  reservePrice: number | null;
  endTime: string;
  images: string[];
  status: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    phone: string | null;
    whatsapp: string | null;
  };
  bids: ApiAuctionBid[];
  totalBids: number;
  currentBid: number;
  timeRemaining: number;
  isExpired: boolean;
}

function getApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  if (!('error' in payload)) return null;
  const errorValue = (payload as { error?: unknown }).error;
  return typeof errorValue === 'string' ? errorValue : null;
}

function formatMsToHms(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const [auction, setAuction] = useState<ApiAuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = params.id as string;
        const res = await fetch(`/api/auctions/${id}`);
        const data = (await res.json()) as unknown;

        if (!res.ok) {
          setAuction(null);
          setError(getApiErrorMessage(data) || 'حدث خطأ في جلب بيانات المزاد');
          return;
        }

        setAuction(data as ApiAuctionDetail);
      } catch (e) {
        setAuction(null);
        setError(e instanceof Error ? e.message : 'حدث خطأ في جلب بيانات المزاد');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBid = async () => {
    if (!auction) return;

    if (!token) {
      alert('يجب تسجيل الدخول للمزايدة');
      router.push('/auth');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (amount <= auction.currentBid) {
      alert('يجب أن يكون المبلغ أعلى من السعر الحالي');
      return;
    }

    try {
      const res = await fetch(`/api/auctions/${auction.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = (await res.json()) as { message?: string; bid?: ApiAuctionBid; error?: string };

      if (!res.ok) {
        alert(data.error || 'فشل تسجيل المزايدة');
        return;
      }

      setShowBidForm(false);
      setBidAmount('');

      // Update UI optimistically
      setAuction((prev) => {
        if (!prev) return prev;
        const newBid = data.bid;
        return {
          ...prev,
          currentBid: amount,
          currentPrice: amount,
          totalBids: prev.totalBids + 1,
          bids: newBid ? [newBid, ...prev.bids] : prev.bids
        };
      });

      alert(data.message || 'تم قبول المزايدة بنجاح');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل تسجيل المزايدة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">{error || 'لم يتم العثور على المزاد'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-800 hover:border-red-600"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const remainingMs = new Date(auction.endTime).getTime() - now;
  const timeRemaining = formatMsToHms(remainingMs);
  const isExpired = remainingMs <= 0 || auction.isExpired || auction.status !== 'ACTIVE';

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center ml-6 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة للمزادات</span>
              </button>
              <Car className="h-8 w-8 text-red-600 ml-2" />
              <h1 className="text-xl font-bold text-white">تفاصيل المزاد</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                title="إضافة للمفضلة"
                className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-full"
              >
                <Heart className="h-5 w-5" />
              </button>
              <button 
                title="مشاركة المزاد"
                className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-full"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="h-64 bg-black rounded-lg flex items-center justify-center mb-4 overflow-hidden border border-gray-800">
                {auction.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover" />
                ) : (
                  <Car className="h-24 w-24 text-gray-600" />
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(auction.images?.length ? auction.images.slice(0, 4) : [null, null, null, null]).map((img, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded flex items-center justify-center">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="w-full h-full object-cover rounded" />
                    ) : (
                      <Car className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h1 className="text-2xl font-bold text-white mb-2">{auction.title}</h1>
              <p className="text-gray-400 font-medium mb-4">
                {auction.carModel}{auction.carYear ? ` • ${auction.carYear}` : ''}
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-red-900/30 text-red-300 text-sm font-medium px-3 py-1 rounded-full border border-red-700/40">
                  {auction.category}
                </span>
                <span className="bg-gray-800 text-gray-200 text-sm font-medium px-3 py-1 rounded-full border border-gray-700">
                  {auction.condition || '—'}
                </span>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-semibold mb-3 text-white">الوصف</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{auction.description}</p>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">تفاصيل إضافية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">رقم القطعة</span>
                  <span className="font-medium text-white">{auction.partNumber || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">حالة المزاد</span>
                  <span className="font-medium text-white">{auction.status}</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">معلومات البائع</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-white">{auction.seller.name}</h4>
                  <p className="text-yellow-400 font-medium">⭐ {auction.seller.rating}</p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">هاتف:</span>
                      <span className="font-medium mr-2 text-white">{auction.seller.phone || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">واتساب:</span>
                      <span className="font-medium mr-2 text-white">{auction.seller.whatsapp || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bidding */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-red-600 ml-2" />
                  <span className="text-2xl font-bold text-red-500">{timeRemaining}</span>
                </div>
                <p className="text-gray-400">ينتهي المزاد</p>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">السعر الحالي</span>
                  <span className="text-3xl font-bold text-green-500">{auction.currentBid} د.ك</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">سعر البداية</span>
                  <span className="text-gray-200">{auction.startingPrice} د.ك</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400">عدد المزايدات</span>
                  <span className="text-gray-200">{auction.totalBids}</span>
                </div>

                {isExpired ? (
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-center">
                    المزاد منتهي
                  </div>
                ) : !showBidForm ? (
                  <button
                    onClick={() => setShowBidForm(true)}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center"
                    disabled={!token || user?.id === auction.seller.id}
                    title={!token ? 'سجّل دخولك للمزايدة' : user?.id === auction.seller.id ? 'لا يمكنك المزايدة على مزادك' : 'شارك في المزاد'}
                  >
                    <Zap className="h-5 w-5 ml-2" />
                    شارك في المزاد
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`أدخل مبلغ أعلى من ${auction.currentBid}`}
                      className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleBid}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        تأكيد المزايدة
                      </button>
                      <button 
                        onClick={() => setShowBidForm(false)}
                        className="flex-1 bg-gray-800 text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-700 transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">تاريخ المزايدات</h3>
              <div className="space-y-3">
                {auction.bids.slice(0, 10).map((bid) => (
                  <div key={bid.id} className="flex justify-between items-center py-2 border-b border-gray-800">
                    <div>
                      <p className="font-medium text-white">{bid.bidder?.name || '—'}</p>
                      <p className="text-xs text-gray-500">{formatDateShort(bid.createdAt)}</p>
                    </div>
                    <span className="font-bold text-green-500">{bid.amount} د.ك</span>
                  </div>
                ))}
                {auction.bids.length === 0 && (
                  <p className="text-gray-400 text-sm">لا توجد مزايدات بعد.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}