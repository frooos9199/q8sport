'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Search, Filter, Clock, DollarSign, Eye, Heart, ArrowLeft } from 'lucide-react';
import GlobalAdvertisementBanner from '@/components/ui/GlobalAdvertisementBanner';

interface Auction {
  id: number;
  title: string;
  titleArabic: string;
  currentPrice: number;
  timeLeft: string;
  bidsCount: number;
  carBrand: string;
  carModel: string;
  category: string;
  condition: string;
  image: string;
  featured: boolean;
}

const sampleAuctions: Auction[] = [
  {
    id: 1,
    title: 'V8 5.0L Engine - Ford Mustang GT 2018',
    titleArabic: 'محرك V8 5.0 لتر - فورد موستنق GT 2018',
    currentPrice: 2500,
    timeLeft: '2h 15m',
    bidsCount: 12,
    carBrand: 'Ford',
    carModel: 'Mustang',
    category: 'المحرك',
    condition: 'مستعمل',
    image: '/placeholder-engine.jpg',
    featured: true
  },
  {
    id: 2,
    title: 'Brembo Brake Kit - Corvette Z06',
    titleArabic: 'طقم فرامل Brembo - كورفيت Z06',
    currentPrice: 800,
    timeLeft: '5h 30m',
    bidsCount: 8,
    carBrand: 'Chevrolet',
    carModel: 'Corvette',
    category: 'الفرامل',
    condition: 'جديد',
    image: '/placeholder-brakes.jpg',
    featured: false
  },
  {
    id: 3,
    title: 'Supercharger Kit - F-150 Raptor',
    titleArabic: 'طقم شاحن هواء - F-150 رابتور',
    currentPrice: 1200,
    timeLeft: '1d 3h',
    bidsCount: 15,
    carBrand: 'Ford',
    carModel: 'F-150',
    category: 'المحرك',
    condition: 'مستعمل',
    image: '/placeholder-supercharger.jpg',
    featured: true
  },
  {
    id: 4,
    title: 'Racing Seats - Camaro SS',
    titleArabic: 'مقاعد رياضية - كامارو SS',
    currentPrice: 450,
    timeLeft: '8h 45m',
    bidsCount: 6,
    carBrand: 'Chevrolet',
    carModel: 'Camaro',
    category: 'الداخلية',
    condition: 'جيد جداً',
    image: '/placeholder-seats.jpg',
    featured: false
  },
  {
    id: 5,
    title: 'Performance Exhaust - Mustang Shelby',
    titleArabic: 'عادم رياضي - موستنق شيلبي',
    currentPrice: 650,
    timeLeft: '12h 20m',
    bidsCount: 9,
    carBrand: 'Ford',
    carModel: 'Mustang',
    category: 'العادم',
    condition: 'مستعمل',
    image: '/placeholder-exhaust.jpg',
    featured: false
  },
  {
    id: 6,
    title: 'Carbon Fiber Hood - Corvette C8',
    titleArabic: 'غطاء محرك كربون فايبر - كورفيت C8',
    currentPrice: 1800,
    timeLeft: '2d 5h',
    bidsCount: 20,
    carBrand: 'Chevrolet',
    carModel: 'Corvette',
    category: 'الهيكل',
    condition: 'جديد',
    image: '/placeholder-hood.jpg',
    featured: true
  }
];

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>(sampleAuctions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [sortBy, setSortBy] = useState('ending-soon');
  const [showFilters, setShowFilters] = useState(false);

  // Filter auctions based on search and filters
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.titleArabic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          auction.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !selectedBrand || auction.carBrand === selectedBrand;
    const matchesModel = !selectedModel || auction.carModel === selectedModel;
    const matchesCategory = !selectedCategory || auction.category === selectedCategory;
    const matchesCondition = !selectedCondition || auction.condition === selectedCondition;
    
    return matchesSearch && matchesBrand && matchesModel && matchesCategory && matchesCondition;
  });

  // Sort auctions
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.currentPrice - b.currentPrice;
      case 'price-high':
        return b.currentPrice - a.currentPrice;
      case 'most-bids':
        return b.bidsCount - a.bidsCount;
      case 'ending-soon':
      default:
        return a.timeLeft.localeCompare(b.timeLeft);
    }
  });

  const brands = ['Ford', 'Chevrolet'];
  const models = ['Mustang', 'F-150', 'Corvette', 'Camaro'];
  const categories = ['المحرك', 'الفرامل', 'الداخلية', 'العادم', 'الهيكل'];
  const conditions = ['جديد', 'جيد جداً', 'مستعمل'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center ml-6">
                <ArrowLeft className="h-5 w-5 text-gray-800" />
                <span className="mr-2 text-gray-800">العودة</span>
              </Link>
              <Car className="h-8 w-8 text-blue-600 ml-2" />
              <h1 className="text-2xl font-bold text-gray-900">Q8 MAZAD SPORT</h1>
            </div>
            <Link href="/auth" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن قطع الغيار..."
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium"
                />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-bold"
            >
              <Filter className="h-5 w-5 ml-2" />
              الفلاتر
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">الماركة</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                  >
                    <option value="">جميع الماركات</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Model Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">الموديل</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                  >
                    <option value="">جميع الموديلات</option>
                    {models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">الفئة</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                  >
                    <option value="">جميع الفئات</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">الحالة</label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                  >
                    <option value="">جميع الحالات</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">ترتيب حسب</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                  >
                    <option value="ending-soon">ينتهي قريباً</option>
                    <option value="price-low">السعر: من الأقل للأعلى</option>
                    <option value="price-high">السعر: من الأعلى للأقل</option>
                    <option value="most-bids">الأكثر مزايدة</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-800">
            عرض {sortedAuctions.length} من أصل {auctions.length} مزاد
          </p>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAuctions.map((auction, index) => (
            <div key={auction.id}>
              {/* إضافة البنر كل 4 عناصر */}
              {index > 0 && index % 4 === 0 && (
                <div className="col-span-full mb-6">
                  <GlobalAdvertisementBanner className="rounded-lg" />
                </div>
              )}
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  {auction.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      مميز
                    </div>
                  )}
                  <div className="h-full flex items-center justify-center">
                    <Car className="h-16 w-16 text-gray-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {auction.titleArabic}
                  </h3>
                  
                  {/* Car Info */}
                  <div className="flex items-center text-sm text-gray-800 mb-3">
                    <span>{auction.carBrand} {auction.carModel}</span>
                    <span className="mx-2">•</span>
                    <span>{auction.category}</span>
                    <span className="mx-2">•</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      auction.condition === 'جديد' ? 'bg-green-100 text-green-800' :
                      auction.condition === 'جيد جداً' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {auction.condition}
                    </span>
                  </div>

                  {/* Price and Time */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-700">السعر الحالي</p>
                      <p className="text-2xl font-bold text-green-600">{auction.currentPrice} د.ك</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-700">ينتهي خلال</p>
                      <p className="font-bold text-red-600 flex items-center">
                        <Clock className="h-4 w-4 ml-1" />
                        {auction.timeLeft}
                      </p>
                    </div>
                  </div>

                  {/* Bids Count */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-800">
                      {auction.bidsCount} مزايدة
                    </p>
                    <button className="text-gray-800 hover:text-red-500" title="إضافة للمفضلة">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold">
                      شارك في المزاد
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition" title="عرض التفاصيل">
                      <Eye className="h-5 w-5 text-gray-800" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedAuctions.length === 0 && (
          <div className="text-center py-16">
            <Car className="h-16 w-16 text-gray-800 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد مزادات</h3>
            <p className="text-gray-800">لم يتم العثور على مزادات تطابق معايير البحث</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBrand('');
                setSelectedModel('');
                setSelectedCategory('');
                setSelectedCondition('');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}