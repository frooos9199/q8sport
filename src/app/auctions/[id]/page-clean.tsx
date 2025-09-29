'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Car, ArrowLeft, Clock, DollarSign, Eye, Heart, 
  Share2, AlertCircle, CheckCircle, User, MessageCircle,
  Zap, Shield, Truck, Award, Loader2
} from 'lucide-react';
import { formatDateLong, formatDateShort } from '@/utils/dateUtils';

interface AuctionDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  carModel: string;
  carYear: number | null;
  partNumber: string | null;
  condition: string;
  startingPrice: number;
  reservePrice: number | null;
  currentPrice: number;
  endTime: string;
  status: string;
  images: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    rating: number | null;
    phone: string | null;
    whatsapp: string | null;
  };
  bids: Array<{
    id: string;
    amount: number;
    createdAt: string;
    bidder: {
      id: string;
      name: string;
    };
  }>;
  totalBids: number;
  timeRemaining: number;
  isExpired: boolean;
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/auctions/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          setAuction(data);
          setBidAmount((data.currentPrice + 50).toString());
        } else {
          setError(data.error || 'حدث خطأ في جلب المزاد');
        }
      } catch (err) {
        setError('حدث خطأ في الاتصال');
        console.error('Error fetching auction:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAuction();
    }
  }, [params.id]);

  const handleBid = () => {
    if (!bidAmount || !auction || parseFloat(bidAmount) <= auction.currentPrice) {
      alert('يجب أن يكون المبلغ أكبر من السعر الحالي');
      return;
    }
    // Handle bid submission
    setShowBidModal(false);
    alert('تم تقديم المزايدة بنجاح!');
  };

  const shareAuction = () => {
    if (navigator.share) {
      navigator.share({
        title: auction?.title,
        text: `شاهد هذا المزاد: ${auction?.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-800 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700"
          >
            العودة للمزادات
          </button>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-800 font-medium">المزاد غير موجود</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            العودة للمزادات
          </button>
        </div>
      </div>
    );
  }

  const images = auction.images ? auction.images.split(',') : [];

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
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => setIsWatching(!isWatching)}
                className={`p-2 rounded-full ${isWatching ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80`}
                title={isWatching ? 'إزالة من المراقبة' : 'إضافة للمراقبة'}
              >
                <Heart className={`h-5 w-5 ${isWatching ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={shareAuction}
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                title="مشاركة"
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
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-96">
                <div className="h-full bg-gray-200 flex items-center justify-center">
                  <Car className="h-24 w-24 text-gray-400" />
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex p-4 space-x-2 space-x-reverse overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Car className="h-6 w-6 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auction Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {auction.title}
                  </h1>
                  <div className="flex items-center text-gray-600 space-x-4 space-x-reverse mb-2">
                    <span>{auction.carModel}</span>
                    <span>•</span>
                    <span>{auction.carYear}</span>
                    <span>•</span>
                    <span>{auction.category}</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    auction.condition === 'جديد' ? 'bg-green-100 text-green-800' :
                    auction.condition === 'جيد جداً' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {auction.condition}
                  </span>
                </div>
                <div className="text-left">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-red-600 ml-1" />
                    <span className="text-lg font-bold text-red-600">
                      {auction.status === 'ACTIVE' ? 'نشط' : 'منتهي'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                                      <span className="text-sm text-gray-600 font-medium">
                    {formatDateShort(auction.endTime)}
                  </span>
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">الوصف</h3>
                <p className="text-gray-700 leading-relaxed">
                  {auction.description}
                </p>
              </div>

              {/* Specifications */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-3">التفاصيل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">سعر البداية</span>
                    <span className="text-gray-700">{auction.startingPrice} د.ك</span>
                  </div>
                  {auction.reservePrice && (
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">السعر المحجوز</span>
                      <span className="text-gray-700">{auction.reservePrice} د.ك</span>
                    </div>
                  )}
                  {auction.partNumber && (
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">رقم القطعة</span>
                      <span className="text-gray-700">{auction.partNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">تاريخ النشر</span>
                    <span className="text-gray-700">
                      {formatDateLong(auction.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">معلومات البائع</h3>
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <h4 className="font-semibold text-gray-900">{auction.seller.name}</h4>
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 ml-1" />
                      <span>{auction.seller.rating || 0}/5</span>
                    </div>
                    {auction.seller.whatsapp && (
                      <>
                        <span>•</span>
                        <span>واتساب متوفر</span>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      <MessageCircle className="h-4 w-4 ml-2" />
                      راسل البائع
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      عرض الملف الشخصي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Bid */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-6 w-6 text-green-600 ml-2" />
                  <span className="text-3xl font-bold text-green-600">{auction.currentPrice} د.ك</span>
                </div>
                <p className="text-gray-600">السعر الحالي</p>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">سعر البداية</span>
                  <span className="text-gray-700">{auction.startingPrice} د.ك</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600">عدد المزايدات</span>
                  <span className="text-gray-700">{auction.bids.length}</span>
                </div>

                <button
                  onClick={() => setShowBidModal(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center"
                  disabled={auction.status !== 'ACTIVE'}
                >
                  <Zap className="h-5 w-5 ml-2" />
                  شارك في المزاد
                </button>
              </div>
            </div>

            {/* Recent Bids */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">المزايدات الأخيرة</h3>
              <div className="space-y-3">
                {auction.bids.slice(0, 5).map((bid) => (
                  <div key={bid.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{bid.amount} د.ك</p>
                      <p className="text-sm text-gray-600">{bid.bidder.name}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDateShort(bid.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
              {auction.bids.length > 5 && (
                <button className="w-full mt-3 text-blue-600 hover:text-blue-700 text-sm">
                  عرض جميع المزايدات ({auction.bids.length})
                </button>
              )}
            </div>

            {/* Trust & Safety */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">الأمان والثقة</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 ml-3" />
                  <span className="text-sm text-gray-700">ضمان حماية المشتري</span>
                </div>
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-blue-600 ml-3" />
                  <span className="text-sm text-gray-700">توصيل آمن متاح</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 ml-3" />
                  <span className="text-sm text-gray-700">بائع موثق</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">تقديم مزايدة</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">السعر الحالي: {auction.currentPrice} د.ك</p>
              <p className="text-sm text-gray-600 mb-4">الحد الأدنى للمزايدة: {auction.currentPrice + 50} د.ك</p>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ المزايدة</label>
              <div className="relative">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل مبلغ المزايدة"
                  min={auction.currentPrice + 50}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">د.ك</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-600 ml-2" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">تنبيه مهم</p>
                  <p>المزايدة ملزمة وغير قابلة للإلغاء. تأكد من المبلغ قبل التأكيد.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => setShowBidModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleBid}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                تأكيد المزايدة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}