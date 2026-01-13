'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDateShort, formatDateLong } from '@/utils/dateUtils';
import ProductImage from '@/components/ProductImage';
import { 
  User, Star, Award, Calendar, MapPin, CheckCircle, 
  MessageCircle, Eye, Heart, Clock, DollarSign, Car,
  Package, ShoppingBag, TrendingUp, Filter, Search,
  ArrowLeft, Gavel, Share2
} from 'lucide-react';

interface SellerProfile {
  id: number;
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
  id: number;
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

const sampleSeller: SellerProfile = {
  id: 1,
  name: 'أحمد محمد الخليفي',
  location: 'الكويت، حولي',
  rating: 4.9,
  totalRatings: 234,
  verified: true,
  joinDate: '2022-03-15',
  bio: 'خبرة 15 سنة في قطع غيار السيارات الأمريكية. متخصص في Ford Mustang ومحركات V8. جميع القطع أصلية ومضمونة.',
  stats: {
    totalSales: 145,
    totalItems: 23,
    completedDeals: 167,
    responseRate: 98,
    avgResponseTime: '2 ساعات',
    totalEarnings: 45750
  },
  specialties: ['Ford Mustang', 'محركات V8', 'قطع أصلية', 'Shelby GT500', 'تيونينق'],
  lastActive: '2024-12-28T10:30:00',
  isOnline: true,
  badges: ['بائع موثق', 'متخصص Mustang', 'خدمة ممتازة', 'توصيل سريع']
};

const sampleItems: SellerItem[] = [
  {
    id: 1,
    title: 'V8 5.0L Coyote Engine - Ford Mustang GT 2018',
    titleArabic: 'محرك V8 5.0 لتر كويوت - فورد موستنق GT 2018',
    price: 2750,
    buyNowPrice: 3200,
    type: 'both',
    condition: 'مستعمل - ممتاز',
    category: 'المحرك',
    carBrand: 'Ford',
    carModel: 'Mustang GT',
    carYear: '2018',
    images: ['/engine1.jpg', '/engine2.jpg', '/engine3.jpg'],
    description: 'محرك أصلي بحالة ممتازة، مسافة 45,000 كم فقط. صيانة كاملة وجميع الإكسسوارات',
    status: 'active',
    views: 347,
    watchers: 28,
    bidsCount: 15,
    timeLeft: '2d 5h',
    createdAt: '2024-12-25T10:00:00',
    featured: true
  },
  {
    id: 2,
    title: 'Shelby GT500 Supercharger Kit',
    titleArabic: 'طقم شاحن هواء شيلبي GT500',
    price: 0,
    buyNowPrice: 4500,
    type: 'buy-now',
    condition: 'جديد',
    category: 'المحرك',
    carBrand: 'Ford',
    carModel: 'Mustang Shelby',
    carYear: '2020',
    images: ['/supercharger1.jpg', '/supercharger2.jpg'],
    description: 'طقم شاحن هواء أصلي جديد للشيلبي GT500',
    status: 'active',
    views: 289,
    watchers: 42,
    createdAt: '2024-12-20T14:00:00',
    featured: true
  },
  {
    id: 3,
    title: 'Performance Exhaust System - Mustang GT',
    titleArabic: 'نظام عادم رياضي - موستنق GT',
    price: 650,
    type: 'auction',
    condition: 'مستعمل - جيد جداً',
    category: 'العادم',
    carBrand: 'Ford',
    carModel: 'Mustang',
    carYear: '2019',
    images: ['/exhaust1.jpg'],
    description: 'نظام عادم Borla ATAK مستعمل بحالة ممتازة',
    status: 'sold',
    views: 198,
    watchers: 15,
    bidsCount: 8,
    createdAt: '2024-12-18T09:00:00',
    featured: false,
    sold: true,
    soldPrice: 750
  },
  {
    id: 4,
    title: 'Racing Brake Kit - Mustang GT350',
    titleArabic: 'طقم فرامل رياضي - موستنق GT350',
    price: 1200,
    buyNowPrice: 1500,
    type: 'both',
    condition: 'مستعمل - ممتاز',
    category: 'الفرامل',
    carBrand: 'Ford',
    carModel: 'Mustang GT350',
    carYear: '2017',
    images: ['/brakes1.jpg', '/brakes2.jpg'],
    description: 'طقم فرامل Brembo أصلي من GT350',
    status: 'active',
    views: 156,
    watchers: 19,
    bidsCount: 6,
    timeLeft: '1d 12h',
    createdAt: '2024-12-22T16:00:00',
    featured: false
  },
  {
    id: 5,
    title: 'Carbon Fiber Hood - Mustang Shelby',
    titleArabic: 'غطاء محرك كربون فايبر - موستنق شيلبي',
    price: 0,
    buyNowPrice: 2800,
    type: 'buy-now',
    condition: 'جديد',
    category: 'الهيكل',
    carBrand: 'Ford',
    carModel: 'Mustang Shelby',
    carYear: '2021',
    images: ['/hood1.jpg', '/hood2.jpg', '/hood3.jpg'],
    description: 'غطاء محرك كربون فايبر جديد أصلي',
    status: 'active',
    views: 234,
    watchers: 31,
    createdAt: '2024-12-15T11:00:00',
    featured: false
  }
];

export default function SellerProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [items, setItems] = useState<SellerItem[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          // تحويل البيانات للتنسيق المطلوب
          const sellerData: SellerProfile = {
            id: parseInt(data.seller.id),
            name: data.seller.name,
            location: 'الكويت', // افتراضي
            rating: data.seller.rating,
            totalRatings: 50, // افتراضي
            verified: data.seller.verified,
            joinDate: data.seller.joinDate,
            bio: `بائع محترف في قطع غيار السيارات. لديه ${data.seller.totalProducts} منتج.`,
            stats: {
              totalSales: data.seller.soldProducts,
              totalItems: data.seller.activeProducts,
              completedDeals: data.seller.soldProducts,
              responseRate: 95,
              avgResponseTime: '2 ساعات',
              totalEarnings: data.seller.soldProducts * 1000 // تقدير
            },
            specialties: ['قطع غيار أصلية', 'خدمة ممتازة'],
            lastActive: new Date().toISOString(),
            isOnline: true,
            badges: data.seller.verified ? ['بائع موثق'] : []
          };
          
          setSeller(sellerData);
          
          // تحويل المنتجات
          const itemsData: SellerItem[] = data.products.map((product: any) => ({
            id: parseInt(product.id),
            title: product.title,
            titleArabic: product.title,
            price: product.price,
            buyNowPrice: product.price,
            type: 'buy-now' as const,
            condition: product.condition,
            category: product.category,
            carBrand: 'مختلف',
            carModel: 'متنوع',
            carYear: '2020',
            images: JSON.parse(product.images || '[]'),
            description: product.description,
            status: product.status as 'active' | 'sold' | 'ended',
            views: product.views,
            watchers: Math.floor(Math.random() * 20),
            createdAt: product.createdAt,
            featured: false
          }));
          
          setItems(itemsData);
        } else {
          // استخدام البيانات التجريبية في حالة الخطأ
          setSeller(sampleSeller);
          setItems(sampleItems);
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
        // استخدام البيانات التجريبية في حالة الخطأ
        setSeller(sampleSeller);
        setItems(sampleItems);
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
    const matchesType = !selectedType || item.type === selectedType;
    
    return matchesTab && matchesSearch && matchesCategory && matchesType;
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

  const categories = ['المحرك', 'الفرامل', 'التعليق', 'العادم', 'الهيكل'];
  const types = ['auction', 'buy-now', 'both'];

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/users" className="flex items-center ml-6 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة للبائعين</span>
              </Link>
              <Car className="h-8 w-8 text-blue-600 ml-2" />
              <h1 className="text-xl font-bold text-gray-900">ملف البائع</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                title="مشاركة الملف الشخصي"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-blue-600" />
              </div>
              {seller.isOnline && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                    {seller.verified && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                        <CheckCircle className="h-4 w-4 ml-1" />
                        موثق
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      seller.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {seller.isOnline ? 'متصل الآن' : 'آخر ظهور منذ ساعة'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 ml-1" />
                      <span>{seller.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 ml-1" />
                      <span>عضو منذ {formatDateLong(seller.joinDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-500 ml-1" />
                      <span className="font-bold text-lg">{seller.rating}</span>
                      <span className="text-gray-600 mr-1">({seller.totalRatings} تقييم)</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      معدل الاستجابة: <span className="font-semibold text-green-600">{seller.stats.responseRate}%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      متوسط وقت الرد: <span className="font-semibold">{seller.stats.avgResponseTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                    <MessageCircle className="h-5 w-5 ml-2" />
                    راسل البائع
                  </button>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    متابعة
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{seller.bio}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {seller.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center"
                  >
                    <Award className="h-4 w-4 ml-1" />
                    {badge}
                  </span>
                ))}
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">التخصصات:</h3>
                <div className="flex flex-wrap gap-2">
                  {seller.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-blue-50 text-blue-800 rounded-lg font-medium"
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
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <ShoppingBag className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{seller.stats.totalSales}</p>
            <p className="text-sm text-gray-600">مبيعات مكتملة</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{seller.stats.totalItems}</p>
            <p className="text-sm text-gray-600">منتجات نشطة</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{seller.stats.completedDeals}</p>
            <p className="text-sm text-gray-600">صفقات مكتملة</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <MessageCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{seller.stats.responseRate}%</p>
            <p className="text-sm text-gray-600">معدل الاستجابة</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{seller.rating}</p>
            <p className="text-sm text-gray-600">متوسط التقييم</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{seller.stats.totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-gray-600">د.ك إجمالي</p>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs and Filters */}
          <div className="border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
              <nav className="-mb-px flex space-x-8 mb-4 lg:mb-0">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'active'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  نشط ({items.filter(item => item.status === 'active').length})
                </button>
                <button
                  onClick={() => setActiveTab('sold')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sold'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  مباع ({items.filter(item => item.status === 'sold').length})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  الكل ({items.length})
                </button>
              </nav>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="بحث في المنتجات..."
                    className="pr-9 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-600 font-medium"
                  />
                </div>

                {/* Filters */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 font-medium"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 font-medium"
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
                  className={`rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 ${
                    highlightedProduct === item.id.toString() 
                      ? 'bg-blue-50 border-2 border-blue-300 shadow-lg' 
                      : 'bg-gray-50'
                  }`}
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {item.featured && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        مميز
                      </div>
                    )}
                    {item.sold && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
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
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {item.titleArabic}
                    </h4>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span>{item.carBrand} {item.carModel}</span>
                      <span className="mx-2">•</span>
                      <span>{item.carYear}</span>
                    </div>

                    {/* Pricing */}
                    <div className="mb-3">
                      {item.sold ? (
                        <div>
                          <p className="text-sm text-gray-600">سعر البيع النهائي</p>
                          <p className="text-xl font-bold text-blue-600">{item.soldPrice} د.ك</p>
                        </div>
                      ) : (
                        <>
                          {item.type === 'auction' && (
                            <div>
                              <p className="text-sm text-gray-600">السعر الحالي</p>
                              <p className="text-xl font-bold text-green-600">{item.price} د.ك</p>
                              {item.timeLeft && (
                                <p className="text-sm text-red-600 flex items-center">
                                  <Clock className="h-4 w-4 ml-1" />
                                  {item.timeLeft}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {item.type === 'buy-now' && (
                            <div>
                              <p className="text-sm text-gray-600">اشتري الآن</p>
                              <p className="text-xl font-bold text-blue-600">{item.buyNowPrice} د.ك</p>
                            </div>
                          )}
                          
                          {item.type === 'both' && (
                            <div>
                              <p className="text-sm text-gray-600">مزايدة: {item.price} د.ك</p>
                              <p className="text-lg font-bold text-blue-600">
                                اشتري الآن: {item.buyNowPrice} د.ك
                              </p>
                              {item.timeLeft && (
                                <p className="text-sm text-red-600 flex items-center">
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
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
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
                          href={`/auctions/${item.id}`}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm text-center font-medium"
                        >
                          {item.type === 'buy-now' ? 'اشتري الآن' : 
                           item.type === 'auction' ? 'شارك في المزاد' : 'عرض المنتج'}
                        </Link>
                      )}
                      <button 
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {sortedItems.length === 0 && (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-600">لم يتم العثور على منتجات تطابق معايير البحث</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}