'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PART_CONDITIONS_ARRAY } from '@/utils/partConditions'
import { Car, Search, Filter, Clock, DollarSign, Eye, Heart, ArrowLeft, User } from 'lucide-react'

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
  seller: string;
  sellerInitials: string;
  sellerColor: string;
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
    featured: true,
    seller: 'أحمد الصالح',
    sellerInitials: 'AS',
    sellerColor: 'bg-red-500'
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
    featured: false,
    seller: 'محمد الكندري',
    sellerInitials: 'MK',
    sellerColor: 'bg-blue-500'
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
    featured: true,
    seller: 'فهد العجمي',
    sellerInitials: 'FA',
    sellerColor: 'bg-yellow-500'
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
    featured: false,
    seller: 'سالم العتيبي',
    sellerInitials: 'SA',
    sellerColor: 'bg-orange-500'
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
    featured: false,
    seller: 'ياسر المطيري',
    sellerInitials: 'YM',
    sellerColor: 'bg-purple-500'
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
    featured: true,
    seller: 'خالد الرشيد',
    sellerInitials: 'KR',
    sellerColor: 'bg-green-500'
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
  const conditions = PART_CONDITIONS_ARRAY;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 gap-4">
            {/* Logo and Back */}
            <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
              <Link href="/" className="flex items-center ml-6 hover:text-gray-200 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة</span>
              </Link>
              <div className="bg-white/20 rounded-full p-2 ml-3">
                <Car className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="text-center sm:text-right">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">المزادات النشطة</h1>
                <p className="text-gray-200 text-xs sm:text-sm">Q8 MAZAD SPORT</p>
              </div>
            </div>
            
            <Link href="/auth" className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full font-medium transition-all">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </header>

      {/* Advertisement Banner - محذوف مؤقتاً */}
      {/* <AdvertisementBanner /> */}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن قطع الغيار..."
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium text-sm sm:text-base"
                />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-bold text-sm sm:text-base"
            >
              <Filter className="h-5 w-5 ml-2" />
              الفلاتر
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">الماركة</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-900 font-medium text-sm"
                    title="اختر الماركة"
                  >
                    <option value="">جميع الماركات</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Model Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">الموديل</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-900 font-medium text-sm"
                    title="اختر الموديل"
                  >
                    <option value="">جميع الموديلات</option>
                    {models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">الفئة</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-900 font-medium text-sm"
                    title="اختر الفئة"
                  >
                    <option value="">جميع الفئات</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">الحالة</label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-900 font-medium text-sm"
                    title="اختر الحالة"
                  >
                    <option value="">جميع الحالات</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">ترتيب حسب</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-900 font-medium text-sm"
                    title="اختر نوع الترتيب"
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
        <div className="mb-4 sm:mb-6">
          <p className="text-gray-900 font-medium text-sm sm:text-base">
            عرض {sortedAuctions.length} من أصل {auctions.length} مزاد
          </p>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedAuctions.map((auction, index) => (
            <div key={auction.id}>
              {/* إضافة البنر كل 6 عناصر - محذوف مؤقتاً */}
              {/* {index > 0 && index % 6 === 0 && (
                <div className="col-span-full mb-6">
                  <AdvertisementBanner className="rounded-lg" />
                </div>
              )} */}
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="h-40 sm:h-48 bg-gray-200 relative">
                  {auction.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      مميز
                    </div>
                  )}
                  {/* شعار صاحب المزاد */}
                  <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1.5 sm:p-2 shadow-md">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${auction.sellerColor} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs sm:text-sm">{auction.sellerInitials}</span>
                    </div>
                  </div>
                  <div className="h-full flex items-center justify-center">
                    <Car className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-6">
                  {/* Title with Seller Info */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                      {auction.titleArabic}
                    </h3>
                    <div className="text-right ml-2">
                      <p className="text-xs text-gray-600">بائع:</p>
                      <p className="text-xs font-bold text-blue-600">{auction.seller}</p>
                    </div>
                  </div>
                  
                  {/* Car Info */}
                  <div className="flex items-center text-xs sm:text-sm text-gray-800 mb-3 flex-wrap">
                    <span>{auction.carBrand} {auction.carModel}</span>
                    <span className="mx-1 sm:mx-2">•</span>
                    <span>{auction.category}</span>
                    <span className="mx-1 sm:mx-2">•</span>
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
                      <p className="text-xs sm:text-sm text-gray-700">السعر الحالي</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">{auction.currentPrice} د.ك</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs sm:text-sm text-gray-700">ينتهي خلال</p>
                      <p className="font-bold text-red-600 flex items-center text-sm sm:text-base">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                        {auction.timeLeft}
                      </p>
                    </div>
                  </div>

                  {/* Bids Count */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs sm:text-sm text-gray-800 font-medium">
                      {auction.bidsCount} مزايدة
                    </p>
                    <button className="text-gray-800 hover:text-red-500 transition-colors" title="إضافة للمفضلة">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2.5 sm:py-3 px-4 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md text-sm sm:text-base">
                      شارك في المزاد
                    </button>
                    <Link 
                      href={`/auctions/${auction.id}`}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center" 
                      title="عرض التفاصيل"
                    >
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedAuctions.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <Car className="h-12 w-12 sm:h-16 sm:w-16 text-gray-800 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">لا توجد مزادات</h3>
            <p className="text-gray-800 mb-4 text-sm sm:text-base">لم يتم العثور على مزادات تطابق معايير البحث</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBrand('');
                setSelectedModel('');
                setSelectedCategory('');
                setSelectedCondition('');
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-bold transition-all transform hover:scale-105 shadow-md text-sm sm:text-base"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
