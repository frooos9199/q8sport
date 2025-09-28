'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDateLong } from '@/utils/dateUtils';
import { 
  User, Search, Filter, Star, Award, Calendar, MapPin,
  Eye, MessageCircle, TrendingUp, Package, ShoppingBag,
  CheckCircle, Car
} from 'lucide-react';

interface UserCard {
  id: number;
  name: string;
  location: string;
  rating: number;
  totalRatings: number;
  verified: boolean;
  joinDate: string;
  avatar?: string;
  stats: {
    totalSales: number;
    totalItems: number;
    completedDeals: number;
    responseRate: number;
  };
  specialties: string[];
  lastActive: string;
  isOnline: boolean;
}

const sampleUsers: UserCard[] = [
  {
    id: 1,
    name: 'أحمد محمد الخليفي',
    location: 'الكويت، حولي',
    rating: 4.9,
    totalRatings: 234,
    verified: true,
    joinDate: '2022-03-15',
    stats: {
      totalSales: 45,
      totalItems: 23,
      completedDeals: 67,
      responseRate: 98
    },
    specialties: ['Ford Mustang', 'محركات V8', 'قطع أصلية'],
    lastActive: '2024-12-28T10:30:00',
    isOnline: true
  },
  {
    id: 2,
    name: 'فاطمة علي الصباح',
    location: 'الكويت، الجهراء',
    rating: 4.7,
    totalRatings: 156,
    verified: true,
    joinDate: '2022-07-22',
    stats: {
      totalSales: 32,
      totalItems: 18,
      completedDeals: 48,
      responseRate: 95
    },
    specialties: ['Chevrolet Corvette', 'فرامل رياضية', 'تيونينق'],
    lastActive: '2024-12-28T08:15:00',
    isOnline: false
  },
  {
    id: 3,
    name: 'محمد سالم الرشيد',
    location: 'الكويت، الفروانية',
    rating: 4.8,
    totalRatings: 189,
    verified: false,
    joinDate: '2023-01-10',
    stats: {
      totalSales: 28,
      totalItems: 31,
      completedDeals: 35,
      responseRate: 92
    },
    specialties: ['Ford F-150', 'إكسسوارات', 'قطع مستعملة'],
    lastActive: '2024-12-27T16:45:00',
    isOnline: false
  },
  {
    id: 4,
    name: 'سارة أحمد المطيري',
    location: 'الكويت، الأحمدي',
    rating: 4.6,
    totalRatings: 98,
    verified: true,
    joinDate: '2023-05-18',
    stats: {
      totalSales: 19,
      totalItems: 14,
      completedDeals: 27,
      responseRate: 89
    },
    specialties: ['Camaro SS', 'تعديلات رياضية', 'عوادم'],
    lastActive: '2024-12-28T12:20:00',
    isOnline: true
  },
  {
    id: 5,
    name: 'خالد عبدالله النصار',
    location: 'الكويت، مبارك الكبير',
    rating: 4.5,
    totalRatings: 142,
    verified: false,
    joinDate: '2022-11-08',
    stats: {
      totalSales: 38,
      totalItems: 26,
      completedDeals: 52,
      responseRate: 94
    },
    specialties: ['محركات', 'علب تروس', 'صيانة شاملة'],
    lastActive: '2024-12-28T09:10:00',
    isOnline: false
  },
  {
    id: 6,
    name: 'نورا يوسف العنزي',
    location: 'الكويت، الجهراء',
    rating: 4.9,
    totalRatings: 203,
    verified: true,
    joinDate: '2021-12-03',
    stats: {
      totalSales: 56,
      totalItems: 19,
      completedDeals: 78,
      responseRate: 99
    },
    specialties: ['قطع أصلية', 'كورفيت كلاسيك', 'ترميم'],
    lastActive: '2024-12-28T11:55:00',
    isOnline: true
  }
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserCard[]>(sampleUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = !selectedLocation || user.location.includes(selectedLocation);
    const matchesSpecialty = !selectedSpecialty || 
                            user.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    const matchesRating = user.rating >= minRating;
    const matchesVerified = !verifiedOnly || user.verified;
    const matchesOnline = !onlineOnly || user.isOnline;
    
    return matchesSearch && matchesLocation && matchesSpecialty && 
           matchesRating && matchesVerified && matchesOnline;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'sales':
        return b.stats.totalSales - a.stats.totalSales;
      case 'newest':
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      case 'active':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      default:
        return 0;
    }
  });

  const locations = ['حولي', 'الجهراء', 'الفروانية', 'الأحمدي', 'مبارك الكبير'];
  const specialties = ['Ford Mustang', 'Chevrolet Corvette', 'Ford F-150', 'محركات', 'فرامل', 'قطع أصلية'];

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ أقل من ساعة';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `منذ ${diffInDays} يوم`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `منذ ${diffInMonths} شهر`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center ml-6 text-blue-600 hover:text-blue-700">
                <Car className="h-8 w-8" />
                <span className="mr-2 text-xl font-bold">Q8 MAZAD SPORT</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/auctions" className="text-gray-800 hover:text-gray-900">المزادات</Link>
              <Link href="/users" className="text-blue-600 font-semibold">البائعون</Link>
              <Link href="/auth" className="text-gray-800 hover:text-gray-900">تسجيل الدخول</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">البائعون والمتخصصون</h1>
          <p className="text-gray-800">اكتشف أفضل البائعين وتواصل مع المتخصصين في قطع غيار السيارات</p>
        </div>

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
                  placeholder="ابحث عن البائعين أو التخصصات..."
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

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold"
              title="ترتيب النتائج"
            >
              <option value="rating">الأعلى تقييماً</option>
              <option value="sales">الأكثر مبيعاً</option>
              <option value="newest">الأحدث انضماماً</option>
              <option value="active">الأكثر نشاطاً</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">المنطقة</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    title="اختر المنطقة"
                  >
                    <option value="">جميع المناطق</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Specialty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">التخصص</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    title="اختر التخصص"
                  >
                    <option value="">جميع التخصصات</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">التقييم الأدنى</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    title="اختر التقييم الأدنى"
                  >
                    <option value={0}>جميع التقييمات</option>
                    <option value={4}>4+ نجوم</option>
                    <option value={4.5}>4.5+ نجوم</option>
                    <option value={4.8}>4.8+ نجوم</option>
                  </select>
                </div>

                {/* Quick Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">فلاتر سريعة</label>
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-800">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="ml-2"
                      />
                      <span className="text-sm text-gray-800">موثقون فقط</span>
                    </label>
                    <label className="flex items-center text-gray-800">
                      <input
                        type="checkbox"
                        checked={onlineOnly}
                        onChange={(e) => setOnlineOnly(e.target.checked)}
                        className="ml-2"
                      />
                      <span className="text-sm text-gray-800">متصلون الآن</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            عرض {sortedUsers.length} من أصل {users.length} بائع
          </p>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                        {user.verified && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 ml-1" />
                        <span>{user.location}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 ml-1" />
                          <span className="font-semibold">{user.rating}</span>
                          <span className="text-gray-600">({user.totalRatings})</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.isOnline ? 'متصل' : getTimeAgo(user.lastActive)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ShoppingBag className="h-4 w-4 text-blue-600 ml-1" />
                      <span className="font-bold text-gray-900">{user.stats.totalSales}</span>
                    </div>
                    <p className="text-xs text-gray-600">مبيعات</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Package className="h-4 w-4 text-green-600 ml-1" />
                      <span className="font-bold text-gray-900">{user.stats.totalItems}</span>
                    </div>
                    <p className="text-xs text-gray-600">منتجات</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-purple-600 ml-1" />
                      <span className="font-bold text-gray-900">{user.stats.completedDeals}</span>
                    </div>
                    <p className="text-xs text-gray-600">صفقات</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MessageCircle className="h-4 w-4 text-orange-600 ml-1" />
                      <span className="font-bold text-gray-900">{user.stats.responseRate}%</span>
                    </div>
                    <p className="text-xs text-gray-600">استجابة</p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">التخصصات:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {user.specialties.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{user.specialties.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 ml-1" />
                  <span>عضو منذ {formatDateLong(user.joinDate)}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center text-sm font-medium"
                  >
                    عرض الملف الشخصي
                  </Link>
                  <button 
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="راسل البائع"
                  >
                    <MessageCircle className="h-4 w-4 text-gray-600" />
                  </button>
                  <button 
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="عرض المنتجات"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedUsers.length === 0 && (
          <div className="text-center py-16">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-600">لم يتم العثور على بائعين يطابقون معايير البحث</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('');
                setSelectedSpecialty('');
                setMinRating(0);
                setVerifiedOnly(false);
                setOnlineOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
            >
              مسح الفلاتر
            </button>
          </div>
        )}

        {/* Load More */}
        {sortedUsers.length > 0 && sortedUsers.length < users.length && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              عرض المزيد من البائعين
            </button>
          </div>
        )}
      </div>
    </div>
  );
}