'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import { 
  Car, ArrowLeft, TrendingUp, Users, Package, DollarSign,
  Calendar, Download, Filter, BarChart3, PieChart, LineChart
} from 'lucide-react';

export default function AdminReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Mock data for reports
  const reportData = {
    overview: {
      totalRevenue: 45230.75,
      totalAuctions: 342,
      averagePrice: 132.25,
      topSellingCategory: 'أجزاء المحرك',
      growthRate: 12.5
    },
    sales: {
      thisMonth: 15420.50,
      lastMonth: 13750.25,
      growth: 12.1,
      topProducts: [
        { name: 'محرك Ford Mustang V8', sales: 2850.00, count: 3 },
        { name: 'فرامل Brembo', sales: 1920.00, count: 8 },
        { name: 'عجلات AMG', sales: 1650.00, count: 2 }
      ]
    },
    users: {
      totalUsers: 456,
      newThisMonth: 23,
      activeUsers: 287,
      topSellers: [
        { name: 'أحمد الخليفي', sales: 12, revenue: 3450.00 },
        { name: 'فاطمة الصباح', sales: 8, revenue: 2890.00 },
        { name: 'محمد الرشيد', sales: 6, revenue: 1980.00 }
      ]
    }
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold">{reportData.overview.totalRevenue.toLocaleString()} د.ك</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">المزادات المكتملة</p>
              <p className="text-2xl font-bold">{reportData.overview.totalAuctions}</p>
            </div>
            <Package className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">متوسط سعر البيع</p>
              <p className="text-2xl font-bold">{reportData.overview.averagePrice} د.ك</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">معدل النمو</p>
              <p className="text-2xl font-bold">+{reportData.overview.growthRate}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">الإيرادات الشهرية</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <LineChart className="h-12 w-12 mx-auto mb-2" />
              <p>مخطط الإيرادات الشهرية</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">توزيع الفئات</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <PieChart className="h-12 w-12 mx-auto mb-2" />
              <p>مخطط توزيع فئات القطع</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">مبيعات هذا الشهر</h3>
          <p className="text-3xl font-bold text-green-600">{reportData.sales.thisMonth.toLocaleString()} د.ك</p>
          <p className="text-sm text-gray-500 mt-1">+{reportData.sales.growth}% من الشهر الماضي</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">الشهر الماضي</h3>
          <p className="text-3xl font-bold text-blue-600">{reportData.sales.lastMonth.toLocaleString()} د.ك</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">النمو</h3>
          <p className="text-3xl font-bold text-green-600">+{reportData.sales.growth}%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">المنتجات الأكثر مبيعاً</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبيعات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العدد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.sales.topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.sales.toLocaleString()} د.ك</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsersReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي المستخدمين</h3>
          <p className="text-3xl font-bold text-blue-600">{reportData.users.totalUsers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">مستخدمين جدد</h3>
          <p className="text-3xl font-bold text-green-600">{reportData.users.newThisMonth}</p>
          <p className="text-sm text-gray-500">هذا الشهر</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">المستخدمين النشطين</h3>
          <p className="text-3xl font-bold text-yellow-600">{reportData.users.activeUsers}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">أفضل البائعين</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البائع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبيعات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإيرادات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.users.topSellers.map((seller, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{seller.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{seller.sales}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{seller.revenue.toLocaleString()} د.ك</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin" className="flex items-center text-white/80 hover:text-white ml-4 transition-colors">
                  <ArrowLeft className="h-5 w-5 ml-1" />
                  العودة للوحة الإدارة
                </Link>
                <Car className="h-8 w-8 text-white ml-3" />
                <h1 className="text-2xl font-bold text-white">التقارير والإحصائيات</h1>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm">
                  <Download className="h-5 w-5 ml-2" />
                  تصدير التقرير
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow p-6 ml-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">الفترة الزمنية</label>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                title="اختر الفترة الزمنية"
              >
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="quarter">هذا الربع</option>
                <option value="year">هذا العام</option>
                <option value="custom">فترة مخصصة</option>
              </select>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setSelectedReport('overview')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  selectedReport === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-5 w-5 ml-3" />
                نظرة عامة
              </button>
              
              <button
                onClick={() => setSelectedReport('sales')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  selectedReport === 'sales'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="h-5 w-5 ml-3" />
                تقرير المبيعات
              </button>
              
              <button
                onClick={() => setSelectedReport('users')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  selectedReport === 'users'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5 ml-3" />
                تقرير المستخدمين
              </button>
              
              <button
                onClick={() => setSelectedReport('products')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  selectedReport === 'products'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="h-5 w-5 ml-3" />
                تقرير المنتجات
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {selectedReport === 'overview' && renderOverviewReport()}
            {selectedReport === 'sales' && renderSalesReport()}
            {selectedReport === 'users' && renderUsersReport()}
            {selectedReport === 'products' && (
              <div className="text-center py-20">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">تقرير المنتجات</h3>
                <p className="text-gray-600">قريباً...</p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}