'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDateLong } from '@/utils/dateUtils';
import { 
  User, Search, Filter, Star, Award, Calendar, MapPin,
  Eye, MessageCircle, TrendingUp, Package, ShoppingBag,
  CheckCircle, Car, ArrowLeft
} from 'lucide-react';

interface UserCard {
  id: string;
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
  initials: string;
  avatarColor: string;
}

type UsersApiUser = {
  id: string;
  name: string;
  avatar?: string | null;
  role: string;
  status: string;
  rating: number;
  verified: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  shopName?: string | null;
  shopAddress?: string | null;
  businessType?: string | null;
  counts?: { products: number; auctions: number; requests: number };
};

const initialUsers: UserCard[] = [];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || 'U';
  const second = parts.length > 1 ? parts[1]?.[0] : '';
  return `${first}${second}`.toUpperCase();
}

function isOnlineFromLastLogin(lastLoginAt?: string | null) {
  if (!lastLoginAt) return false;
  const diff = Date.now() - new Date(lastLoginAt).getTime();
  return diff >= 0 && diff <= 15 * 60 * 1000;
}

function pickAvatarColor(index: number) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
  return colors[index % colors.length];
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserCard[]>(initialUsers);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const res = await fetch('/api/users?role=SELLER,SHOP_OWNER&status=ACTIVE&limit=200');
        const data = (await res.json()) as { success?: boolean; users?: UsersApiUser[]; error?: string };

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'فشل تحميل قائمة البائعين');
        }

        const mapped = (data.users || []).map((u, idx): UserCard => {
          const lastActive = u.lastLoginAt || u.createdAt;
          return {
            id: u.id,
            name: u.name,
            location: u.shopAddress || 'الكويت',
            rating: Number(u.rating || 0),
            totalRatings: 0,
            verified: !!u.verified,
            joinDate: u.createdAt,
            stats: {
              totalSales: 0,
              totalItems: u.counts?.products || 0,
              completedDeals: 0,
              responseRate: 0
            },
            specialties: [u.businessType || (u.role === 'SHOP_OWNER' ? 'محل' : 'بائع')].filter(Boolean),
            lastActive,
            isOnline: isOnlineFromLastLogin(u.lastLoginAt),
            initials: getInitials(u.name),
            avatarColor: pickAvatarColor(idx)
          };
        });

        setUsers(mapped);
      } catch (e) {
        setUsers([]);
        setLoadError(e instanceof Error ? e.message : 'فشل تحميل قائمة البائعين');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filter and sort users
  const filteredUsers = useMemo(() => users.filter(user => {
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
  }), [users, searchTerm, selectedLocation, selectedSpecialty, minRating, verifiedOnly, onlineOnly]);

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 gap-4">
            {/* Logo and Back */}
            <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
              <Link href="/" className="flex items-center ml-6 hover:text-red-500 transition-colors text-white">
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة</span>
              </Link>
              <div className="bg-red-600 rounded-full p-2 ml-3">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="text-center sm:text-right">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">البائعون والمتخصصون</h1>
                <p className="text-gray-400 text-xs sm:text-sm">Q8 Motors</p>
              </div>
            </div>
            
            <div className="hidden sm:flex space-x-6">
              <Link href="/auctions" className="text-white hover:text-red-500 font-medium transition-colors px-4 py-2 rounded-full hover:bg-gray-900">
                المزادات
              </Link>
              <Link href="/auth" className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full font-medium transition-all text-white">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
        {loading && (
          <div className="text-center py-12 text-gray-400">جاري تحميل البائعين...</div>
        )}

        {!loading && loadError && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3 rounded mb-6">
            {loadError}
          </div>
        )}

        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-right">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">أفضل البائعين والمتخصصين</h2>
          <p className="text-gray-400 font-medium">اكتشف أفضل البائعين وتواصل مع المتخصصين في قطع غيار السيارات الرياضية</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن البائعين أو التخصصات..."
                  className="w-full pr-10 pl-4 py-3 border border-gray-700 bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400 font-medium"
                />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 text-white font-bold"
            >
              <Filter className="h-5 w-5 ml-2" />
              الفلاتر
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 text-white font-bold"
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
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">المنطقة</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-2 border border-gray-700 bg-black rounded-lg focus:ring-2 focus:ring-red-600 text-white font-medium"
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
                  <label className="block text-sm font-medium text-white mb-1">التخصص</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full p-2 border border-gray-700 bg-black rounded-lg focus:ring-2 focus:ring-red-600 text-white font-medium"
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
                  <label className="block text-sm font-medium text-white mb-1">التقييم الأدنى</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-700 bg-black rounded-lg focus:ring-2 focus:ring-red-600 text-white font-medium"
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
                  <label className="block text-sm font-medium text-white mb-1">فلاتر سريعة</label>
                  <div className="space-y-2">
                    <label className="flex items-center text-white">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="ml-2"
                      />
                      <span className="text-sm text-white">موثقون فقط</span>
                    </label>
                    <label className="flex items-center text-white">
                      <input
                        type="checkbox"
                        checked={onlineOnly}
                        onChange={(e) => setOnlineOnly(e.target.checked)}
                        className="ml-2"
                      />
                      <span className="text-sm text-white">متصلون الآن</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            عرض {sortedUsers.length} من أصل {users.length} بائع
          </p>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedUsers.map((user) => (
            <div key={user.id} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-red-600 transition-all">
              {/* Header */}
              <div className="p-4 sm:p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 ${user.avatarColor} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm sm:text-lg">{user.initials}</span>
                      </div>
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{user.name}</h3>
                        {user.verified && (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 ml-1 flex-shrink-0" />
                        <span className="truncate">{user.location}</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 ml-1" />
                          <span className="font-bold text-white">{user.rating}</span>
                          <span className="text-gray-400">({user.totalRatings})</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.isOnline ? 'متصل' : getTimeAgo(user.lastActive)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 ml-1" />
                      <span className="font-bold text-white text-sm sm:text-base">{user.stats.totalSales}</span>
                    </div>
                    <p className="text-xs text-gray-400">مبيعات</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 ml-1" />
                      <span className="font-bold text-white text-sm sm:text-base">{user.stats.totalItems}</span>
                    </div>
                    <p className="text-xs text-gray-400">منتجات</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 ml-1" />
                      <span className="font-bold text-white text-sm sm:text-base">{user.stats.completedDeals}</span>
                    </div>
                    <p className="text-xs text-gray-400">صفقات</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 ml-1" />
                      <span className="font-bold text-white text-sm sm:text-base">{user.stats.responseRate}%</span>
                    </div>
                    <p className="text-xs text-gray-400">استجابة</p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <p className="text-sm font-bold text-white mb-2">التخصصات:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full font-medium border border-red-600/30"
                      >
                        {specialty}
                      </span>
                    ))}
                    {user.specialties.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full font-medium border border-gray-700">
                        +{user.specialties.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-4">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  <span>عضو منذ {formatDateLong(user.joinDate)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/users/${user.id}`}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center px-4 py-2.5 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 text-xs sm:text-sm"
                  >
                    عرض الملف الشخصي
                  </Link>
                  <button 
                    className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    title="راسل البائع"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                  </button>
                  <button 
                    className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    title="عرض المنتجات"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedUsers.length === 0 && (
          <div className="text-center py-16">
            <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد نتائج</h3>
            <p className="text-gray-400">لم يتم العثور على بائعين يطابقون معايير البحث</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('');
                setSelectedSpecialty('');
                setMinRating(0);
                setVerifiedOnly(false);
                setOnlineOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
            >
              مسح الفلاتر
            </button>
          </div>
        )}

        {/* Load More */}
        {sortedUsers.length > 0 && sortedUsers.length < users.length && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 text-white font-medium">
              عرض المزيد من البائعين
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
