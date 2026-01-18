'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDateLong } from '@/utils/dateUtils';
import ProductImage from '@/components/ProductImage';
import { 
  User, Star, Award, Calendar, MapPin, CheckCircle, 
  MessageCircle, Eye, Heart, Clock, DollarSign, Car,
  Package, ShoppingBag, TrendingUp, Search,
  ArrowLeft, Gavel, Share2
} from 'lucide-react';

interface SellerProfile {
  id: string;
  name: string;
  location: string;
  rating: number;
  totalRatings: number;
  verified: boolean;
  joinDate: string;
  bio: string;
  avatar?: string;
  stats: {
    totalSales: number;
    totalItems: number;
    completedDeals: number;
    responseRate: number;
    avgResponseTime: string;
    totalEarnings: number;
  };
  specialties: string[];
  lastActive: string;
  isOnline: boolean;
  badges: string[];
  socialMedia?: {
    instagram?: string;
    whatsapp?: string;
  };
}

interface SellerItem {
  id: string;
  title: string;
  titleArabic: string;
  price: number;
  buyNowPrice?: number;
  type: 'auction' | 'buy-now' | 'both';
  condition: string;
  category: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  images: string[];
  description: string;
  status: 'active' | 'sold' | 'ended';
  views: number;
  watchers: number;
  bidsCount?: number;
  timeLeft?: string;
  createdAt: string;
  featured: boolean;
  sold?: boolean;
  soldPrice?: number;
}

type SellerApiResponse = {
  success?: boolean;
  error?: string;
  seller?: {
    id: string;
    name: string;
    avatar?: string | null;
    rating: number;
    verified: boolean;
    joinDate: string;
    totalProducts: number;
    activeProducts: number;
    soldProducts: number;
    role?: string;
    status?: string;
    lastLoginAt?: string | null;
    shopAddress?: string | null;
    businessType?: string | null;
    whatsapp?: string | null;
  };
  products?: any[];
};

function safeParseImages(images: unknown): string[] {
  if (Array.isArray(images)) return images.filter((x) => typeof x === 'string') as string[];
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string') as string[];
    } catch {
      return images ? [images] : [];
    }
  }
  return [];
}

function isOnlineFromLastLogin(lastLoginAt?: string | null) {
  if (!lastLoginAt) return false;
  const diff = Date.now() - new Date(lastLoginAt).getTime();
  return diff >= 0 && diff <= 15 * 60 * 1000;
}

export default function SellerProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [items, setItems] = useState<SellerItem[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const normalizeStatus = (raw: unknown): SellerItem['status'] => {
    const v = String(raw || '').toUpperCase();
    if (v === 'SOLD') return 'sold';
    if (v === 'ACTIVE') return 'active';
    return 'ended';
  };

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await fetch(`/api/users/${params.id}`);
        const data = (await response.json()) as SellerApiResponse;

        if (!response.ok || !data.success || !data.seller) {
          throw new Error(data.error || 'تعذر تحميل بيانات البائع');
        }

        const sellerData: SellerProfile = {
          id: data.seller.id,
          name: data.seller.name,
          location: data.seller.shopAddress || 'غير محدد',
          rating: Number(data.seller.rating || 0),
          totalRatings: 0,
          verified: !!data.seller.verified,
          joinDate: data.seller.joinDate,
          bio: data.seller.businessType
            ? `متخصص في: ${data.seller.businessType}`
            : `لديه ${data.seller.totalProducts} منتج.`,
          avatar: data.seller.avatar || undefined,
          stats: {
            totalSales: data.seller.soldProducts,
            totalItems: data.seller.activeProducts,
            completedDeals: data.seller.soldProducts,
            responseRate: 0,
            avgResponseTime: 'غير متوفر',
            totalEarnings: 0
          },
          specialties: [data.seller.businessType || ''].filter(Boolean),
          lastActive: data.seller.lastLoginAt || data.seller.joinDate,
          isOnline: isOnlineFromLastLogin(data.seller.lastLoginAt),
          badges: data.seller.verified ? ['بائع موثق'] : [],
          socialMedia: data.seller.whatsapp ? { whatsapp: data.seller.whatsapp } : undefined
        };

        setSeller(sellerData);

        const itemsData: SellerItem[] = (data.products || []).map((product: any) => ({
          id: String(product.id),
          title: product.title,
          titleArabic: product.title,
          price: product.price,
          buyNowPrice: product.price,
          type: 'buy-now' as const,
          condition: product.condition,
          category: product.category,
          carBrand: product.carBrand || 'غير محدد',
          carModel: product.carModel || 'غير محدد',
          carYear: product.carYear ? String(product.carYear) : 'غير محدد',
          images: safeParseImages(product.images),
          description: product.description,
          status: normalizeStatus(product.status),
          views: product.views || 0,
          watchers: 0,
          createdAt: product.createdAt,
          featured: false,
          sold: normalizeStatus(product.status) === 'sold',
          soldPrice: product.soldPrice || undefined
        }));

        setItems(itemsData);
      } catch (error) {
        console.error('Error fetching seller data:', error);
        setSeller(null);
        setItems([]);
        setLoadError(error instanceof Error ? error.message : 'تعذر تحميل بيانات البائع');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSellerData();
    
    // إذا تم تمرير معرف المنتج، قم بتمييزه
    if (productId) {
      setHighlightedProduct(productId);
      // التمرير للمنتج المحدد بعد تحميل الصفحة
      setTimeout(() => {
        const element = document.getElementById(`product-${productId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000);
    }
  }, [params.id, productId]);

  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && item.status === 'active') ||
                      (activeTab === 'sold' && item.status === 'sold') ||
                      (activeTab === 'ended' && item.status === 'ended');
    const matchesSearch = item.titleArabic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-high':
        return (b.buyNowPrice || b.price) - (a.buyNowPrice || a.price);
      case 'price-low':
        return (a.buyNowPrice || a.price) - (b.buyNowPrice || b.price);
      case 'views':
        return b.views - a.views;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter((c) => typeof c === 'string' && c.trim().length > 0))
  ) as string[];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-600 rounded-full p-4 inline-flex mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <p className="text-gray-300 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-gray-900 border border-gray-800 rounded-full p-4 inline-flex mb-4">
            <User className="h-10 w-10 text-gray-200" />
          </div>
          <p className="text-white font-semibold mb-2">تعذر عرض ملف البائع</p>
          <p className="text-gray-400 mb-4">{loadError || 'المستخدم غير موجود'}</p>
          <Link href="/users" className="inline-flex items-center px-5 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 font-bold">
            <ArrowLeft className="h-4 w-4" />
            <span className="mr-2">العودة للبائعين</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
              <Link href="/users" className="flex items-center ml-6 hover:text-red-500 transition-colors text-white">
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة للبائعين</span>
              </Link>
              <div className="bg-red-600 rounded-full p-2 ml-3">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="text-center sm:text-right">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">{seller.name}</h1>
                <p className="text-gray-400 text-xs sm:text-sm">ملف البائع</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-2 bg-gray-900 border border-gray-700 rounded-full hover:bg-gray-800"
                title="مشاركة الملف الشخصي"
              >
                <Share2 className="h-5 w-5 text-gray-200" />
              </button>
              <Link
                href="/messages"
                className="hidden sm:inline-flex items-center bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full font-bold transition-all text-white"
                title="الرسائل"
              >
                <MessageCircle className="h-5 w-5 ml-2" />
                الرسائل
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Profile Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-black border border-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                {seller.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-14 w-14 sm:h-16 sm:w-16 text-gray-200" />
                )}
              </div>
              {seller.isOnline && (
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-gray-900 rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{seller.name}</h2>
                    {seller.verified && (
                      <div className="bg-red-600/20 text-red-200 px-3 py-1 rounded-full text-sm flex items-center border border-red-600/30">
                        <CheckCircle className="h-4 w-4 ml-1" />
                        موثق
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      seller.isOnline ? 'bg-green-600/20 text-green-200 border border-green-600/30' : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}>
                      {seller.isOnline ? 'متصل الآن' : 'آخر ظهور منذ ساعة'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-gray-300 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 ml-1" />
                      <span>{seller.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 ml-1" />
                      <span className="text-gray-400">عضو منذ {formatDateLong(seller.joinDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center bg-yellow-600/10 border border-yellow-600/20 px-3 py-2 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-500 ml-1" />
                      <span className="font-bold text-lg text-white">{seller.rating}</span>
                      <span className="text-gray-400 mr-1">({seller.totalRatings} تقييم)</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      معدل الاستجابة: <span className="font-semibold text-green-400">{seller.stats.responseRate}%</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      متوسط وقت الرد: <span className="font-semibold text-gray-200">{seller.stats.avgResponseTime}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex space-x-3">
                  <button className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center font-bold">
                    <MessageCircle className="h-5 w-5 ml-2" />
                    راسل البائع
                  </button>
                  <button className="px-6 py-3 border border-gray-700 text-gray-200 rounded-full hover:bg-gray-800 font-bold">
                    متابعة
                  </button>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{seller.bio}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {seller.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-600/20 text-green-200 text-sm rounded-full flex items-center border border-green-600/30"
                  >
                    <Award className="h-4 w-4 ml-1" />
                    {badge}
                  </span>
                ))}
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">التخصصات:</h3>
                <div className="flex flex-wrap gap-2">
                  {seller.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gray-800 text-gray-200 rounded-lg font-medium border border-gray-700"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow text-center hover:border-red-600/40 transition-colors">
            <ShoppingBag className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{seller.stats.totalSales}</p>
            <p className="text-sm text-gray-400">مبيعات مكتملة</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow text-center hover:border-red-600/40 transition-colors">
            <Package className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{seller.stats.totalItems}</p>
            <p className="text-sm text-gray-400">منتجات نشطة</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow text-center hover:border-red-600/40 transition-colors">
            <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{seller.stats.completedDeals}</p>
            <p className="text-sm text-gray-400">صفقات مكتملة</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow text-center hover:border-red-600/40 transition-colors">
            <MessageCircle className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{seller.stats.responseRate}%</p>
            <p className="text-sm text-gray-400">معدل الاستجابة</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow text-center hover:border-red-600/40 transition-colors">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{seller.rating}</p>
            <p className="text-sm text-gray-400">متوسط التقييم</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow text-center hover:border-red-600/40 transition-colors">
            <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{seller.stats.totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-gray-400">د.ك إجمالي</p>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
          {/* Tabs and Filters */}
          <div className="border-b border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
              <nav className="-mb-px flex space-x-8 mb-4 lg:mb-0">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'active'
                      ? 'border-red-600 text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  نشط ({items.filter(item => item.status === 'active').length})
                </button>
                <button
                  onClick={() => setActiveTab('sold')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sold'
                      ? 'border-red-600 text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  مباع ({items.filter(item => item.status === 'sold').length})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-red-600 text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  الكل ({items.length})
                </button>
              </nav>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="بحث في المنتجات..."
                    className="pr-9 pl-4 py-3 border border-gray-700 bg-black rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm text-white placeholder-gray-400 font-medium"
                  />
                </div>

                {/* Filters */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 text-sm text-white font-bold"
                  title="اختر الفئة"
                >
                  <option value="">جميع الفئات</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 text-sm text-white font-bold"
                  title="ترتيب النتائج"
                >
                  <option value="newest">الأحدث</option>
                  <option value="price-high">السعر: عالي لمنخفض</option>
                  <option value="price-low">السعر: منخفض لعالي</option>
                  <option value="views">الأكثر مشاهدة</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => (
                <div 
                  key={item.id} 
                  id={`product-${item.id}`}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
                    highlightedProduct === item.id.toString() 
                      ? 'bg-gray-900 border-red-600/60 shadow-xl' 
                      : 'bg-gray-900 border-gray-800 hover:border-red-600/40 hover:shadow-xl'
                  }`}
                >
                  {/* Image */}
                  <div className="h-48 bg-black relative">
                    {item.featured && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        مميز
                      </div>
                    )}
                    {item.sold && (
                      <div className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded text-xs font-semibold border border-gray-700">
                        مباع
                      </div>
                    )}
                    <ProductImage 
                      images={item.images || []}
                      title={item.titleArabic || item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-bold text-white mb-2 line-clamp-2">
                      {item.titleArabic}
                    </h4>
                    
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <span>{item.carBrand} {item.carModel}</span>
                      <span className="mx-2">•</span>
                      <span>{item.carYear}</span>
                    </div>

                    {/* Pricing */}
                    <div className="mb-3">
                      {item.sold ? (
                        <div>
                          <p className="text-sm text-gray-400">سعر البيع النهائي</p>
                          <p className="text-xl font-bold text-red-500">{item.soldPrice} د.ك</p>
                        </div>
                      ) : (
                        <>
                          {item.type === 'auction' && (
                            <div>
                              <p className="text-sm text-gray-400">السعر الحالي</p>
                              <p className="text-xl font-bold text-green-400">{item.price} د.ك</p>
                              {item.timeLeft && (
                                <p className="text-sm text-red-400 flex items-center">
                                  <Clock className="h-4 w-4 ml-1" />
                                  {item.timeLeft}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {item.type === 'buy-now' && (
                            <div>
                              <p className="text-sm text-gray-400">اشتري الآن</p>
                              <p className="text-xl font-bold text-red-500">{item.buyNowPrice} د.ك</p>
                            </div>
                          )}
                          
                          {item.type === 'both' && (
                            <div>
                              <p className="text-sm text-gray-400">مزايدة: {item.price} د.ك</p>
                              <p className="text-lg font-bold text-red-500">
                                اشتري الآن: {item.buyNowPrice} د.ك
                              </p>
                              {item.timeLeft && (
                                <p className="text-sm text-red-400 flex items-center">
                                  <Clock className="h-4 w-4 ml-1" />
                                  {item.timeLeft}
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 ml-1" />
                        {item.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 ml-1" />
                        {item.watchers}
                      </span>
                      {item.bidsCount && (
                        <span className="flex items-center">
                          <Gavel className="h-4 w-4 ml-1" />
                          {item.bidsCount}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {!item.sold && (
                        <Link
                          href={item.type === 'auction' ? `/auctions/${item.id}` : `/products/${item.id}`}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm text-center font-bold"
                        >
                          {item.type === 'buy-now' ? 'اشتري الآن' : 
                           item.type === 'auction' ? 'شارك في المزاد' : 'عرض المنتج'}
                        </Link>
                      )}
                      <button 
                        className="px-3 py-2 border border-gray-700 rounded-lg hover:bg-gray-800"
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-4 w-4 text-gray-200" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {sortedItems.length === 0 && (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد منتجات</h3>
                <p className="text-gray-400">لم يتم العثور على منتجات تطابق معايير البحث</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}