'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Car, 
  Clock, 
  Zap, 
  Heart, 
  Share2, 
  Eye,
  DollarSign,
  User,
  Calendar,
  Package
} from 'lucide-react';
import { formatDateShort } from '@/utils/dateUtils';

interface AuctionDetail {
  id: string;
  title: string;
  description: string;
  carModel: string;
  category: string;
  condition: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: string;
  timeRemaining: string;
  status: 'active' | 'ending_soon' | 'hot';
  seller: {
    name: string;
    rating: number;
    joinDate: string;
    totalSales: number;
    location: string;
  };
  images: string[];
  specifications: {
    [key: string]: string;
  };
  bidHistory: {
    id: string;
    bidder: string;
    amount: number;
    time: string;
  }[];
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAuction({
        id: params.id as string,
        title: 'محرك فورد موستانج V8 5.0L',
        description: 'محرك V8 5.0L Coyote من فورد موستانج GT موديل 2020. المحرك في حالة ممتازة مع صيانة دورية مكتملة. تم تشغيله لمسافة 45,000 كيلومتر فقط. يشمل المحرك جميع الملحقات الأساسية.',
        carModel: 'Ford Mustang GT 2020',
        category: 'محركات',
        condition: 'مستعمل - حالة ممتازة',
        currentBid: 2850,
        startingBid: 1500,
        bidCount: 12,
        endTime: '2025-09-30T15:30:00',
        timeRemaining: '2:15:30',
        status: 'active',
        seller: {
          name: 'أحمد الصالح',
          rating: 4.8,
          joinDate: '2023-01-15',
          totalSales: 24,
          location: 'الكويت، حولي'
        },
        images: ['/placeholder-engine.jpg'],
        specifications: {
          'نوع المحرك': 'V8 Coyote',
          'السعة': '5.0 لتر',
          'القوة': '450 حصان',
          'العزم': '410 lb-ft',
          'المسافة المقطوعة': '45,000 كم',
          'سنة الصنع': '2020',
          'حالة المحرك': 'ممتازة',
          'الضمان': '6 أشهر'
        },
        bidHistory: [
          { id: '1', bidder: 'محمد الكندري', amount: 2850, time: '2025-09-29T14:30:00' },
          { id: '2', bidder: 'فهد العجمي', amount: 2700, time: '2025-09-29T13:15:00' },
          { id: '3', bidder: 'سالم العتيبي', amount: 2500, time: '2025-09-29T12:00:00' },
          { id: '4', bidder: 'ياسر المطيري', amount: 2300, time: '2025-09-29T10:45:00' },
          { id: '5', bidder: 'عبدالله النصار', amount: 2000, time: '2025-09-29T09:30:00' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleBid = () => {
    if (!auction) return;
    
    const amount = parseFloat(bidAmount);
    if (amount <= auction.currentBid) {
      alert('يجب أن يكون المبلغ أعلى من السعر الحالي');
      return;
    }

    // Simulate bid submission
    alert(`تم تسجيل مزايدتك بمبلغ ${amount} د.ك بنجاح!`);
    setShowBidForm(false);
    setBidAmount('');
    
    // Update auction data
    setAuction(prev => prev ? {
      ...prev,
      currentBid: amount,
      bidCount: prev.bidCount + 1,
      bidHistory: [
        { id: Date.now().toString(), bidder: 'أنت', amount, time: new Date().toISOString() },
        ...prev.bidHistory
      ]
    } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">لم يتم العثور على المزاد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center ml-6 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة للمزادات</span>
              </button>
              <Car className="h-8 w-8 text-blue-600 ml-2" />
              <h1 className="text-xl font-bold text-gray-900">تفاصيل المزاد</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                title="إضافة للمفضلة"
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
              >
                <Heart className="h-5 w-5" />
              </button>
              <button 
                title="مشاركة المزاد"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <Car className="h-24 w-24 text-gray-400" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Car className="h-6 w-6 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{auction.title}</h1>
              <p className="text-blue-600 font-medium mb-4">{auction.carModel}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {auction.category}
                </span>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {auction.condition}
                </span>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">الوصف</h3>
                <p className="text-gray-700 leading-relaxed">{auction.description}</p>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">المواصفات التقنية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(auction.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{key}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">معلومات البائع</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{auction.seller.name}</h4>
                  <p className="text-yellow-600 font-medium">⭐ {auction.seller.rating}</p>
                  <p className="text-gray-600">📍 {auction.seller.location}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">انضم في:</span>
                      <span className="font-medium mr-2">{formatDateShort(auction.seller.joinDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">إجمالي المبيعات:</span>
                      <span className="font-medium mr-2">{auction.seller.totalSales}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bidding */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-red-600 ml-2" />
                  <span className="text-2xl font-bold text-red-600">{auction.timeRemaining}</span>
                </div>
                <p className="text-gray-600">ينتهي المزاد</p>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">السعر الحالي</span>
                  <span className="text-3xl font-bold text-green-600">{auction.currentBid} د.ك</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">سعر البداية</span>
                  <span className="text-gray-700">{auction.startingBid} د.ك</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600">عدد المزايدات</span>
                  <span className="text-gray-700">{auction.bidCount}</span>
                </div>

                {!showBidForm ? (
                  <button 
                    onClick={() => setShowBidForm(true)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">تاريخ المزايدات</h3>
              <div className="space-y-3">
                {auction.bidHistory.slice(0, 5).map((bid) => (
                  <div key={bid.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{bid.bidder}</p>
                      <p className="text-xs text-gray-500">{formatDateShort(bid.time)}</p>
                    </div>
                    <span className="font-bold text-green-600">{bid.amount} د.ك</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}