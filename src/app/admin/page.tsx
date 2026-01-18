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
  activeUsers: number;
  disabledUsers: number;
  shopOwners: number;
  activeAuctions: number;
  totalRevenue: number;
  totalBids: number;
}

interface RecentAuction {
  id: string;
  title: string;
  seller: string;
  currentPrice: number;
  totalBids: number;
  endTime: string;
  status: 'ACTIVE' | 'ENDED' | 'PENDING';
}

interface AdminStatsApiResponse {
  overview?: {
    totalUsers?: number;
    activeUsers?: number;
    disabledUsers?: number;
    shopOwners?: number;
    activeAuctions?: number;
    totalRevenue?: number;
    totalBids?: number;
  };
  recentAuctions?: Array<{
    id: string;
    title: string;
    seller: string;
    currentPrice: number;
    totalBids: number;
    status: 'ACTIVE' | 'ENDED' | 'PENDING';
    endTime: string;
  }>;
  error?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    disabledUsers: 0,
    shopOwners: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    totalBids: 0
  });
  const [recentAuctions, setRecentAuctions] = useState<RecentAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        if (!token) {
          // AuthWrapper سيمنع الدخول بدون تسجيل، لكن نخليها آمنة
          setLoading(false);
          return;
        }

        const res = await fetch('/api/admin/stats?period=30', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = (await res.json()) as AdminStatsApiResponse;

        if (!res.ok) {
          console.error('Admin stats error:', data);
          throw new Error(data?.error || 'فشل جلب بيانات لوحة الإدارة');
        }

        setStats({
          totalUsers: data.overview?.totalUsers || 0,
          activeUsers: data.overview?.activeUsers || 0,
          disabledUsers: data.overview?.disabledUsers || 0,
          shopOwners: data.overview?.shopOwners || 0,
          activeAuctions: data.overview?.activeAuctions || 0,
          totalRevenue: data.overview?.totalRevenue || 0,
          totalBids: data.overview?.totalBids || 0
        });

        setRecentAuctions(
          (data.recentAuctions || []).map((a) => ({
            id: a.id,
            title: a.title,
            seller: a.seller,
            currentPrice: a.currentPrice,
            totalBids: a.totalBids,
            status: a.status,
            endTime: a.endTime
          }))
        );
      } catch (e) {
        console.error('Failed to load admin dashboard:', e);
        setRecentAuctions([]);
        setStats({ totalUsers: 0, activeUsers: 0, disabledUsers: 0, shopOwners: 0, activeAuctions: 0, totalRevenue: 0, totalBids: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const handleDeleteAuction = async (auctionId: string) => {
    try {
      if (!token) return;

      const ok = confirm('تأكيد حذف المزاد؟');
      if (!ok) return;

      const res = await fetch(`/api/auctions/${auctionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'فشل حذف المزاد');
        return;
      }

      // حدّث القائمة محلياً + خفّض العدّاد (تقريبياً)
      setRecentAuctions((prev) => prev.filter((a) => a.id !== auctionId));
      setStats((prev) => ({
        ...prev,
        activeAuctions: Math.max(0, prev.activeAuctions - 1)
      }));
    } catch (e) {
      console.error('Delete auction failed:', e);
      alert('حدث خطأ أثناء حذف المزاد');
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} د.ك`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'ENDED': return 'text-gray-800 bg-gray-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'نشط';
      case 'ENDED': return 'منتهي';
      case 'PENDING': return 'معلق';
      default: return 'غير معروف';
    }
  };

  if (loading) {
    return (
      <AuthWrapper requireAuth={true} requireAdmin={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-white">جاري تحميل لوحة الإدارة...</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href="/" 
                  className="flex items-center text-gray-400 hover:text-white ml-4 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 ml-1" />
                  العودة للرئيسية
                </Link>
                <Shield className="h-10 w-10 ml-4 text-red-600" />
                <div>
                  <h1 className="text-3xl font-bold text-white">لوحة الإدارة</h1>
                  <p className="text-gray-400 mt-1">Q8 Motors - إدارة النظام</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="h-6 w-6 cursor-pointer hover:text-red-500 transition-colors text-white" />
                  <span className="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
                </div>
                <span className="text-white font-medium">مرحباً، {user?.name || 'الأدمن'}</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors"
                >
                  <LogOut className="h-5 w-5 ml-2" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Date Display */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400">اليوم</h3>
                <p className="text-lg font-bold text-white">{getCurrentDateGregorian()}</p>
              </div>
              <div className="text-red-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-12 w-12 text-red-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-400">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Activity className="h-12 w-12 text-green-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-400">المزادات النشطة</p>
                  <p className="text-2xl font-bold text-white">{stats.activeAuctions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="h-12 w-12 text-yellow-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-400 font-medium">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="h-12 w-12 text-red-600" />
                <div className="mr-4">
                  <p className="text-sm text-gray-400">إجمالي المزايدات</p>
                  <p className="text-2xl font-bold text-white">{stats.totalBids}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">أوامر إدارية رئيسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Link href="/admin/users" className="flex items-center justify-center p-4 bg-black border border-gray-800 hover:border-red-600 rounded-lg transition-colors">
                <Users className="h-6 w-6 text-red-600 ml-2" />
                <span className="text-white font-medium">إدارة المستخدمين</span>
              </Link>

              <Link href="/admin/auctions" className="flex items-center justify-center p-4 bg-black border border-gray-800 hover:border-red-600 rounded-lg transition-colors">
                <Car className="h-6 w-6 text-green-600 ml-2" />
                <span className="text-white font-medium">إدارة المزادات</span>
              </Link>

              <Link href="/admin/requests" className="flex items-center justify-center p-4 bg-black border border-gray-800 hover:border-red-600 rounded-lg transition-colors">
                <ShoppingCart className="h-6 w-6 text-yellow-600 ml-2" />
                <span className="text-white font-medium">إدارة المطلوبات</span>
              </Link>
              
              <Link href="/admin/ads" className="flex items-center justify-center p-4 bg-black border border-gray-800 hover:border-red-600 rounded-lg transition-colors">
                <Settings className="h-6 w-6 text-red-600 ml-2" />
                <span className="text-white font-medium">إعلانات Google</span>
              </Link>
              
              <Link href="/admin/advertisements" className="flex items-center justify-center p-4 bg-black border border-gray-800 hover:border-red-600 rounded-lg transition-colors">
                <Monitor className="h-6 w-6 text-green-600 ml-2" />
                <span className="text-white font-medium">إدارة الإعلانات</span>
              </Link>
              
              <Link href="/admin/shops" className="flex items-center justify-center p-4 bg-black border border-gray-800 hover:border-red-600 rounded-lg transition-colors">
                <Store className="h-6 w-6 text-red-600 ml-2" />
                <span className="text-white font-medium">إدارة أصحاب المحلات</span>
              </Link>
              
              <Link href="/admin/reports" className="flex items-center justify-center p-4 bg-black border border-gray-800 hover:border-red-600 rounded-lg transition-colors">
                <BarChart3 className="h-6 w-6 text-red-600 ml-2" />
                <span className="text-white font-medium">عرض التقارير</span>
              </Link>
              
              <Link href="/admin/categories" className="flex items-center justify-center p-4 bg-black border border-gray-800 hover:border-red-600 rounded-lg transition-colors">
                <Package className="h-6 w-6 text-red-600 ml-2" />
                <span className="text-white font-medium">إدارة الكاتيجوري</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Management Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">إدارة المستخدمين</h2>
                  <Link href="/admin/users" className="text-red-500 hover:text-red-400 text-sm font-medium">
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
                      <span className="text-gray-300">مستخدمين نشطين</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{stats.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserX className="h-5 w-5 text-red-600 ml-2" />
                      <span className="text-gray-300">مستخدمين معطلين</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{stats.disabledUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 text-red-600 ml-2" />
                      <span className="text-gray-300">أصحاب محلات</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{stats.shopOwners}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <Link href="/admin/users" className="block w-full text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
                    إدارة جميع المستخدمين
                  </Link>
                </div>
              </div>
            </div>

            {/* Advertisements Management Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">إدارة الإعلانات</h2>
                  <Link href="/admin/advertisements" className="text-red-500 hover:text-red-400 text-sm font-medium">
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
                      <span className="text-gray-300">إعلانات نشطة</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-yellow-600 ml-2" />
                      <span className="text-gray-300">مجدولة للنشر</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-red-600 ml-2" />
                      <span className="text-gray-300">منتهية الصلاحية</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">3</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <Link href="/admin/advertisements" className="block w-full text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    إدارة جميع الإعلانات
                  </Link>
                </div>
              </div>
            </div>
            {/* Recent Auctions */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">المزادات الأخيرة</h2>
                  <Link href="/auctions" className="text-red-500 hover:text-red-400 text-sm font-medium">
                    عرض الكل
                    <ChevronRight className="h-4 w-4 inline mr-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentAuctions.map((auction) => (
                    <div key={auction.id} className="border border-gray-800 rounded-lg p-4 bg-black">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{auction.title}</h3>
                          <p className="text-sm text-gray-400">البائع: {auction.seller}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(auction.status)}`}>
                          {getStatusText(auction.status)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(auction.currentPrice)}
                          <span className="text-xs text-gray-400 font-normal mr-2">({auction.totalBids} مزايدات)</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            title="عرض تفاصيل المزاد"
                            onClick={() => router.push(`/auctions/${auction.id}`)}
                            className="p-1 text-red-600 hover:bg-gray-800 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            title="فتح صفحة المزاد"
                            onClick={() => router.push(`/auctions/${auction.id}`)}
                            className="p-1 text-green-600 hover:bg-gray-800 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            title="حذف المزاد"
                            onClick={() => handleDeleteAuction(auction.id)}
                            className="p-1 text-red-600 hover:bg-gray-800 rounded"
                          >
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
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">أوامر النظام</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-800 rounded-lg p-4 bg-black">
                  <h3 className="font-semibold text-white mb-2">إعدادات المزادات</h3>
                  <p className="text-sm text-gray-400 mb-3">تحكم في إعدادات المزادات العامة والمدة الافتراضية</p>
                  <Link href="/admin/settings" className="text-red-500 hover:text-red-400 text-sm font-medium">
                    إدارة الإعدادات
                    <ChevronRight className="h-4 w-4 inline mr-1" />
                  </Link>
                </div>

                <div className="border border-gray-800 rounded-lg p-4 bg-black">
                  <h3 className="font-semibold text-white mb-2">إشعارات واتساب</h3>
                  <p className="text-sm text-gray-400 mb-3">إدارة الإشعارات المرسلة عبر واتساب</p>
                  <Link href="/admin/messages" className="text-red-500 hover:text-red-400 text-sm font-medium">
                    إدارة الإشعارات
                    <ChevronRight className="h-4 w-4 inline mr-1" />
                  </Link>
                </div>

                <div className="border border-gray-800 rounded-lg p-4 bg-black">
                  <h3 className="font-semibold text-white mb-2">الإعدادات المتقدمة</h3>
                  <p className="text-sm text-gray-400 mb-3">إعدادات قاعدة البيانات والأمان</p>
                  <Link href="/admin/advanced" className="text-red-500 hover:text-red-400 text-sm font-medium">
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