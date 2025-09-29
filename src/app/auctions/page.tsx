'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Car, 
  Clock, 
  ArrowLeft, 
  Filter, 
  Search, 
  Heart, 
  Eye,
  Zap,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatDateShort } from '@/utils/dateUtils';

interface Auction {
  id: string;
  title: string;
  description: string;
  carModel: string;
  category: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: string;
  timeRemaining: string;
  status: 'active' | 'ending_soon' | 'hot';
  seller: {
    name: string;
    rating: number;
    initials: string;
  };
  images: string[];
}

export default function AuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAuctions([
        {
          id: '1',
          title: 'محرك فورد موستانج V8',
          description: 'محرك V8 5.0L موديل 2020 في حالة ممتازة',
          carModel: 'Ford Mustang',
          category: 'محركات',
          currentBid: 2850,
          startingBid: 1500,
          bidCount: 12,
          endTime: '2025-09-30T15:30:00',
          timeRemaining: '2:15:30',
          status: 'active',
          seller: {
            name: 'أحمد الصالح',
            rating: 4.8,
            initials: 'AS'
          },
          images: ['/placeholder-engine.jpg']
        },
        {
          id: '2',
          title: 'علبة سرعة فورد F-150',
          description: 'علبة سرعة أوتوماتيك 10 سرعات موديل 2019',
          carModel: 'Ford F-150',
          category: 'علب السرعة',
          currentBid: 1250,
          startingBid: 800,
          bidCount: 8,
          endTime: '2025-09-30T18:00:00',
          timeRemaining: '4:45:20',
          status: 'active',
          seller: {
            name: 'محمد الكندري',
            rating: 4.6,
            initials: 'MK'
          },
          images: ['/placeholder-transmission.jpg']
        },
        {
          id: '3',
          title: 'مكابح كورفيت رياضية',
          description: 'مكابح Brembo رياضية من كورفيت Z06',
          carModel: 'Chevrolet Corvette',
          category: 'مكابح',
          currentBid: 3200,
          startingBid: 2000,
          bidCount: 18,
          endTime: '2025-09-29T22:00:00',
          timeRemaining: '0:45:15',
          status: 'ending_soon',
          seller: {
            name: 'فهد العجمي',
            rating: 4.9,
            initials: 'FA'
          },
          images: ['/placeholder-brakes.jpg']
        },
        {
          id: '4',
          title: 'عجلات كامارو SS',
          description: 'عجلات رياضية 20 بوصة أصلية من كامارو SS',
          carModel: 'Chevrolet Camaro',
          category: 'عجلات',
          currentBid: 980,
          startingBid: 600,
          bidCount: 22,
          endTime: '2025-10-01T14:00:00',
          timeRemaining: '1:12:45',
          status: 'hot',
          seller: {
            name: 'سالم العتيبي',
            rating: 4.7,
            initials: 'SA'
          },
          images: ['/placeholder-wheels.jpg']
        },
        {
          id: '5',
          title: 'محرك دودج تشارجر هيمي',
          description: 'محرك Hemi V8 6.4L من دودج تشارجر R/T',
          carModel: 'Dodge Charger',
          category: 'محركات',
          currentBid: 4500,
          startingBid: 3000,
          bidCount: 15,
          endTime: '2025-10-02T16:30:00',
          timeRemaining: '2:18:30',
          status: 'active',
          seller: {
            name: 'ياسر المطيري',
            rating: 4.5,
            initials: 'YM'
          },
          images: ['/placeholder-hemi.jpg']
        },
        {
          id: '6',
          title: 'مقاعد كورفيت جلد أحمر',
          description: 'مقاعد رياضية جلد أحمر أصلي من كورفيت C8',
          carModel: 'Chevrolet Corvette',
          category: 'مقاعد',
          currentBid: 1800,
          startingBid: 1200,
          bidCount: 9,
          endTime: '2025-10-03T12:00:00',
          timeRemaining: '3:06:15',
          status: 'active',
          seller: {
            name: 'عبدالله النصار',
            rating: 4.8,
            initials: 'AN'
          },
          images: ['/placeholder-seats.jpg']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAuctions = auctions.filter(auction => {
    const matchesCategory = filterCategory === 'all' || auction.category === filterCategory;
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.carModel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ending_soon':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">⏰ ينتهي قريباً</span>;
      case 'hot':
        return <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">🔥 مزاد ساخن</span>;
      default:
        return <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">✅ نشط</span>;
    }
  };

  const categories = ['all', 'محركات', 'علب السرعة', 'مكابح', 'عجلات', 'مقاعد'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 text-lg">جاري تحميل المزادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center ml-6 text-white hover:text-blue-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة للرئيسية</span>
              </button>
              <Car className="h-8 w-8 text-white ml-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">المزادات النشطة</h1>
                <p className="text-blue-100">قطع غيار السيارات الرياضية</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ابحث في المزادات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                title="اختيار فئة المزادات"
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'جميع الفئات' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            عرض {filteredAuctions.length} مزاد من أصل {auctions.length}
          </p>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <div key={auction.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                <Car className="h-16 w-16 text-gray-400" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(auction.status)}
                </div>

                {/* Seller Avatar */}
                <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow-md">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{auction.seller.initials}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title & Car Model */}
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{auction.title}</h3>
                  <p className="text-sm text-blue-600 font-medium">{auction.carModel}</p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{auction.description}</p>

                {/* Seller Info */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">البائع:</p>
                    <p className="text-sm font-medium text-gray-900">{auction.seller.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">التقييم:</p>
                    <p className="text-sm font-bold text-yellow-600">⭐ {auction.seller.rating}</p>
                  </div>
                </div>

                {/* Bidding Info */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">السعر الحالي</p>
                      <p className="text-lg font-bold text-green-600">{auction.currentBid} د.ك</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">عدد المزايدات</p>
                      <p className="text-lg font-bold text-blue-600">{auction.bidCount}</p>
                    </div>
                  </div>

                  {/* Time Remaining */}
                  <div className="flex items-center justify-center mb-4 bg-gray-50 rounded-lg p-3">
                    <Clock className="h-4 w-4 text-red-600 ml-2" />
                    <span className="text-red-600 font-bold">{auction.timeRemaining}</span>
                    <span className="text-gray-600 mr-2">متبقي</span>
                  </div>

                  {/* Action Button */}
                  <Link 
                    href={`/auctions/${auction.id}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-center py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md"
                  >
                    <Zap className="h-4 w-4 inline ml-2" />
                    شارك في المزاد
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAuctions.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">لا توجد مزادات</h3>
            <p className="text-gray-400">لم يتم العثور على مزادات تطابق البحث الحالي</p>
          </div>
        )}
      </div>
    </div>
  );
}