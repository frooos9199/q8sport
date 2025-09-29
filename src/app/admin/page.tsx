'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import AdvertisementBanner from '@/components/ui/AdvertisementBanner';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateShort, formatDateLong, getCurrentDateGregorian } from '@/utils/dateUtils';
import { 
  Car, 
  LogOut, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Activity,
  Settings,
  BarChart3,
  Package,
  MessageCircle,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Calendar,
  UserCheck,
  UserX,
  Store,
  Monitor,
  Shield,
  ArrowLeft
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeAuctions: number;
  totalRevenue: number;
  totalParts: number;
}

interface RecentAuction {
  id: string;
  partName: string;
  carModel: string;
  currentBid: number;
  endTime: string;
  status: 'active' | 'ended' | 'pending';
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    totalParts: 0
  });
  const [recentAuctions, setRecentAuctions] = useState<RecentAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => {
      setStats({
        totalUsers: 247,
        activeAuctions: 15,
        totalRevenue: 12500,
        totalParts: 1250
      });
      setRecentAuctions([
        {
          id: '1',
          partName: 'محرك مستعمل',
          carModel: 'Ford Mustang 2018',
          currentBid: 2500,
          endTime: '2025-09-29T15:30:00',
          status: 'active'
        },
        {
          id: '2',
          partName: 'جنوط رياضية',
          carModel: 'Chevrolet Corvette 2020',
          currentBid: 800,
          endTime: '2025-09-30T10:00:00',
          status: 'active'
        },
        {
          id: '3',
          partName: 'نظام عادم كامل',
          carModel: 'Ford F-150 2019',
          currentBid: 1200,
          endTime: '2025-09-28T20:00:00',
          status: 'ended'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} د.ك`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'ended': return 'text-gray-800 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'ended': return 'منتهي';
      case 'pending': return 'معلق';
      default: return 'غير معروف';
    }
  };

  if (loading) {
    return (
      <AuthWrapper requireAuth={true} requireAdmin={true}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800">جاري تحميل لوحة الإدارة...</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href="/" 
                  className="flex items-center text-white/80 hover:text-white ml-4 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 ml-1" />
                  العودة للرئيسية
                </Link>
                <Shield className="h-10 w-10 ml-4" />
                <div>
                  <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
                  <p className="text-blue-100 mt-1">Q8 MAZAD SPORT - إدارة النظام</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="h-6 w-6 cursor-pointer hover:text-blue-200 transition-colors" />
                  <span className="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
                </div>
                <span className="text-white/90 font-medium">مرحباً، {user?.name || 'الأدمن'}</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <LogOut className="h-5 w-5 ml-2" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
          <AdvertisementBanner className="mt-4" />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Date Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">اليوم</h3>
                <p className="text-lg font-bold text-blue-900">{getCurrentDateGregorian()}</p>
              </div>
              <div className="text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-12 w-12 text-blue-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-800">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Activity className="h-12 w-12 text-green-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-800">المزادات النشطة</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAuctions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="h-12 w-12 text-yellow-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-800 font-medium">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="h-12 w-12 text-purple-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-800">إجمالي قطع الغيار</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalParts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">أوامر إدارية رئيسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Link href="/admin/users" className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Users className="h-6 w-6 text-blue-600 ml-2" />
                <span className="text-blue-700 font-medium">إدارة المستخدمين</span>
              </Link>
              
              <Link href="/admin/ads" className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <Settings className="h-6 w-6 text-red-600 ml-2" />
                <span className="text-red-700 font-medium">إعلانات Google</span>
              </Link>
              
              <Link href="/admin/advertisements" className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Monitor className="h-6 w-6 text-green-600 ml-2" />
                <span className="text-green-700 font-medium">إدارة الإعلانات</span>
              </Link>
              
              <Link href="/admin/shops" className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Store className="h-6 w-6 text-purple-600 ml-2" />
                <span className="text-purple-700 font-medium">إدارة أصحاب المحلات</span>
              </Link>
              
              <Link href="/admin/reports" className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <BarChart3 className="h-6 w-6 text-orange-600 ml-2" />
                <span className="text-orange-700 font-medium">عرض التقارير</span>
              </Link>
              
              <Link href="/admin/categories" className="flex items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                <Package className="h-6 w-6 text-indigo-600 ml-2" />
                <span className="text-indigo-700 font-medium">إدارة الكاتيجوري</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Management Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">إدارة المستخدمين</h2>
                  <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    عرض الكل
                    <ChevronRight className="h-4 w-4 inline mr-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-green-600 ml-2" />
                      <span className="text-gray-700">مستخدمين نشطين</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">237</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserX className="h-5 w-5 text-red-600 ml-2" />
                      <span className="text-gray-700">مستخدمين معطلين</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 text-purple-600 ml-2" />
                      <span className="text-gray-700">أصحاب محلات</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">45</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link href="/admin/users" className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    إدارة جميع المستخدمين
                  </Link>
                </div>
              </div>
            </div>

            {/* Advertisements Management Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">إدارة الإعلانات</h2>
                  <Link href="/admin/advertisements" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    عرض الكل
                    <ChevronRight className="h-4 w-4 inline mr-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-green-600 ml-2" />
                      <span className="text-gray-700">إعلانات نشطة</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-yellow-600 ml-2" />
                      <span className="text-gray-700">مجدولة للنشر</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-red-600 ml-2" />
                      <span className="text-gray-700">منتهية الصلاحية</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">3</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link href="/admin/advertisements" className="block w-full text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    إدارة جميع الإعلانات
                  </Link>
                </div>
              </div>
            </div>
            {/* Recent Auctions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">المزادات الأخيرة</h2>
                  <Link href="/auctions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    عرض الكل
                    <ChevronRight className="h-4 w-4 inline mr-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentAuctions.map((auction) => (
                    <div key={auction.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{auction.partName}</h3>
                          <p className="text-sm text-gray-800">{auction.carModel}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(auction.status)}`}>
                          {getStatusText(auction.status)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(auction.currentBid)}
                        </div>
                        <div className="flex space-x-2">
                          <button title="عرض تفاصيل المزاد" className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button title="تحرير المزاد" className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button title="حذف المزاد" className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Actions - moved below the 3-column layout */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">أوامر النظام</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">إعدادات المزادات</h3>
                  <p className="text-sm text-gray-800 mb-3">تحكم في إعدادات المزادات العامة والمدة الافتراضية</p>
                  <Link href="/admin/settings" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    إدارة الإعدادات
                    <ChevronRight className="h-4 w-4 inline mr-1" />
                  </Link>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">إشعارات واتساب</h3>
                  <p className="text-sm text-gray-800 mb-3">إدارة الإشعارات المرسلة عبر واتساب</p>
                  <Link href="/admin/messages" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    إدارة الإشعارات
                    <ChevronRight className="h-4 w-4 inline mr-1" />
                  </Link>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">الإعدادات المتقدمة</h3>
                  <p className="text-sm text-gray-800 mb-3">إعدادات قاعدة البيانات والأمان</p>
                  <Link href="/admin/advanced" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    الوصول للإعدادات
                    <ChevronRight className="h-4 w-4 inline mr-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}