'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import { Car, Users, Package, TrendingUp, Settings, LogOut, Star, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'user', 'car', 'category'
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Redirect to home page
    router.push('/');
  };

  // Mock data with more detailed statistics
  const dashboardStats = {
    totalParts: 1234,
    activeAuctions: 87,
    totalUsers: 456,
    supportedCars: 4,
    totalRevenue: 15420.75,
    monthlyGrowth: 12.5,
    completedAuctions: 342,
    pendingReviews: 23
  };

  const supportedCars = [
    { id: 1, brand: 'Ford', model: 'Mustang', yearFrom: 1964, yearTo: 2024, status: 'active' },
    { id: 2, brand: 'Ford', model: 'F-150', yearFrom: 1975, yearTo: 2024, status: 'active' },
    { id: 3, brand: 'Chevrolet', model: 'Corvette', yearFrom: 1953, yearTo: 2024, status: 'active' },
    { id: 4, brand: 'Chevrolet', model: 'Camaro', yearFrom: 1966, yearTo: 2024, status: 'active' },
  ];

  const partCategories = [
    { id: 1, name: 'Engine Parts', nameArabic: 'أجزاء المحرك', partsCount: 150 },
    { id: 2, name: 'Transmission', nameArabic: 'ناقل الحركة', partsCount: 89 },
    { id: 3, name: 'Brakes', nameArabic: 'الفرامل', partsCount: 76 },
    { id: 4, name: 'Suspension', nameArabic: 'نظام التعليق', partsCount: 45 },
    { id: 5, name: 'Electrical', nameArabic: 'الكهربائيات', partsCount: 63 },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">إجمالي القطع</h3>
              <p className="text-3xl font-bold text-blue-600">{dashboardStats.totalParts.toLocaleString()}</p>
              <p className="text-sm text-gray-500">قطعة نشطة</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">المزادات النشطة</h3>
              <p className="text-3xl font-bold text-green-600">{dashboardStats.activeAuctions}</p>
              <p className="text-sm text-gray-500">مزاد جاري</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">إجمالي المستخدمين</h3>
              <p className="text-3xl font-bold text-yellow-600">{dashboardStats.totalUsers}</p>
              <p className="text-sm text-gray-500">مستخدم مسجل</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Car className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">الإيرادات الشهرية</h3>
              <p className="text-3xl font-bold text-purple-600">{dashboardStats.totalRevenue.toLocaleString()} د.ك</p>
              <p className="text-sm text-green-600">+{dashboardStats.monthlyGrowth}% هذا الشهر</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">المزادات المكتملة</p>
              <p className="text-2xl font-bold">{dashboardStats.completedAuctions}</p>
            </div>
            <div className="p-2 bg-white bg-opacity-20 rounded-full">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">النمو الشهري</p>
              <p className="text-2xl font-bold">+{dashboardStats.monthlyGrowth}%</p>
            </div>
            <div className="p-2 bg-white bg-opacity-20 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">في انتظار المراجعة</p>
              <p className="text-2xl font-bold">{dashboardStats.pendingReviews}</p>
            </div>
            <div className="p-2 bg-white bg-opacity-20 rounded-full">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">السيارات المدعومة</p>
              <p className="text-2xl font-bold">{dashboardStats.supportedCars}</p>
            </div>
            <div className="p-2 bg-white bg-opacity-20 rounded-full">
              <Car className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-blue-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            النشاط الأخير
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">مستخدم جديد انضم للمنصة</p>
                <p className="text-xs text-gray-500">منذ 5 دقائق</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">مزاد جديد تم إضافته - محرك Ford Mustang</p>
                <p className="text-xs text-gray-500">منذ 12 دقيقة</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">طلب مراجعة منتج في الانتظار</p>
                <p className="text-xs text-gray-500">منذ 25 دقيقة</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">تم إكمال مزاد بقيمة 450 د.ك</p>
                <p className="text-xs text-gray-500">منذ 1 ساعة</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">تم الإبلاغ عن منتج مشكوك فيه</p>
                <p className="text-xs text-gray-500">منذ 2 ساعة</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-800">
              عرض جميع الأنشطة ←
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            إجراءات سريعة
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-right flex items-center justify-between transition-colors">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 ml-3" />
                <span className="font-medium text-gray-900">مراجعة المنتجات الجديدة</span>
              </div>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{dashboardStats.pendingReviews}</span>
            </button>
            <button className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-right flex items-center transition-colors">
              <Users className="h-5 w-5 text-green-600 ml-3" />
              <span className="font-medium text-gray-900">إضافة مستخدم جديد</span>
            </button>
            <button className="w-full p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-right flex items-center transition-colors">
              <Car className="h-5 w-5 text-yellow-600 ml-3" />
              <span className="font-medium text-gray-900">إضافة سيارة مدعومة</span>
            </button>
            <button className="w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-right flex items-center transition-colors">
              <Settings className="h-5 w-5 text-purple-600 ml-3" />
              <span className="font-medium text-gray-900">تعديل إعدادات النظام</span>
            </button>
            <button 
              onClick={() => router.push('/admin/advanced')}
              className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-right flex items-center text-white transition-colors"
            >
              <Star className="h-5 w-5 ml-3" />
              <span className="font-medium">الانتقال للإدارة المتقدمة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">السيارات المدعومة</h3>
          <div className="space-y-3">
            {supportedCars.map((car) => (
              <div key={car.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">{car.brand} {car.model}</h4>
                  <p className="text-sm text-gray-600">{car.yearFrom}-{car.yearTo}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">نشط</span>
                  <button 
                    className="text-blue-600 hover:text-blue-800"
                    title="إدارة القطع"
                  >
                    <Package className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">فئات القطع</h3>
          <div className="space-y-3">
            {partCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">{category.nameArabic}</h4>
                  <p className="text-sm text-gray-600">{category.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {category.partsCount} قطعة
                  </span>
                  <button 
                    className="text-blue-600 hover:text-blue-800"
                    title="إدارة الفئة"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCarsManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة السيارات المدعومة</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5 ml-2" />
          إضافة سيارة جديدة
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الماركة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموديل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السنوات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {supportedCars.map((car) => (
              <tr key={car.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{car.brand}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{car.model}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{car.yearFrom}-{car.yearTo}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">نشط</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">ملاحظة مهمة</h3>
        <p className="text-blue-800">
          يمكنك إضافة أو حذف السيارات المدعومة. حذف سيارة سيؤثر على جميع قطع الغيار المرتبطة بها.
        </p>
      </div>
    </div>
  );

  const renderUsersManagement = () => {
    const users = [
      { 
        id: 1, 
        name: 'أحمد الخليفي', 
        email: 'ahmed.alkhalifi@email.com', 
        role: 'seller', 
        status: 'active',
        joinDate: '2024-01-15',
        rating: 4.9,
        totalSales: 145,
        verified: true,
        location: 'الكويت'
      },
      { 
        id: 2, 
        name: 'فاطمة الصباح', 
        email: 'fatima.alsabah@email.com', 
        role: 'seller', 
        status: 'active',
        joinDate: '2024-02-20',
        rating: 4.8,
        totalSales: 128,
        verified: true,
        location: 'الكويت'
      },
      { 
        id: 3, 
        name: 'محمد الرشيد', 
        email: 'mohammed.alrashid@email.com', 
        role: 'buyer', 
        status: 'active',
        joinDate: '2024-03-10',
        rating: 4.7,
        totalSales: 95,
        verified: false,
        location: 'السعودية'
      },
      { 
        id: 4, 
        name: 'سارة المطيري', 
        email: 'sara.almutairi@email.com', 
        role: 'seller', 
        status: 'pending',
        joinDate: '2024-09-01',
        rating: 4.9,
        totalSales: 87,
        verified: false,
        location: 'الإمارات'
      },
      { 
        id: 5, 
        name: 'خالد العتيبي', 
        email: 'khalid.alotaibi@email.com', 
        role: 'buyer', 
        status: 'suspended',
        joinDate: '2024-08-15',
        rating: 3.2,
        totalSales: 12,
        verified: false,
        location: 'قطر'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-5 w-5 ml-2" />
              إضافة مستخدم
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              تصدير البيانات
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">إجمالي المستخدمين</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">المستخدمين النشطين</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.role === 'seller').length}
            </div>
            <div className="text-sm text-gray-600">البائعين</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.verified).length}
            </div>
            <div className="text-sm text-gray-600">المستخدمين المؤكدين</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">قائمة المستخدمين</h3>
              <div className="flex items-center space-x-2">
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option value="">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="pending">في الانتظار</option>
                  <option value="suspended">معلق</option>
                </select>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option value="">جميع الأدوار</option>
                  <option value="seller">بائع</option>
                  <option value="buyer">مشتري</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبيعات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانضمام</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            {user.verified && (
                              <span className="mr-2 w-4 h-4 text-green-500" title="مؤكد">✓</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'seller' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'seller' ? 'بائع' : 'مشتري'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : user.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'نشط' : user.status === 'pending' ? 'في الانتظار' : 'معلق'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="mr-1">{user.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.totalSales}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.joinDate}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="عرض التفاصيل"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button 
                            className="text-yellow-600 hover:text-yellow-900"
                            title="تعليق"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9V5a3 3 0 00-3-3v0a3 3 0 00-3 3v4a3 3 0 00-3 3v0a3 3 0 003 3h18m-6-6v6a3 3 0 003 3v0a3 3 0 003-3v-6" />
                            </svg>
                          </button>
                        ) : (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            title="تفعيل"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm text-gray-600">تحديد الكل</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                تفعيل المحدد
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">
                تعليق المحدد
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                حذف المحدد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPartsManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة فئات قطع الغيار</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5 ml-2" />
          إضافة فئة جديدة
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم العربي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم الإنجليزي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد القطع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {partCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.nameArabic}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{category.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{category.partsCount}</td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <button 
                    className="text-blue-600 hover:text-blue-900"
                    title="تعديل الفئة"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    title="حذف الفئة"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">إعدادات النظام</h2>
      
      {/* General Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الإعدادات العامة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم الموقع</label>
            <input
              type="text"
              defaultValue="مزادات قطع الغيار"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">بريد الأدمين</label>
            <input
              type="email"
              defaultValue="summit_kw@hotmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب</label>
            <input
              type="text"
              placeholder="+965XXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة الزمنية</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>Asia/Kuwait</option>
              <option>Asia/Riyadh</option>
              <option>Asia/Dubai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Auction Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات المزادات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مدة المزاد الافتراضية (بالأيام)</label>
            <input
              type="number"
              defaultValue="7"
              min="1"
              max="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى لزيادة المزايدة (%)</label>
            <input
              type="number"
              defaultValue="5"
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عمولة المنصة (%)</label>
            <input
              type="number"
              defaultValue="3"
              min="0"
              max="20"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى لسعر البداية (د.ك)</label>
            <input
              type="number"
              defaultValue="1"
              min="0.5"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Integration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الواتساب</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Token</label>
            <input
              type="password"
              placeholder="أدخل الـ Token الخاص بك"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب للإشعارات</label>
            <input
              type="text"
              placeholder="+965XXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="whatsapp-enabled"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="whatsapp-enabled" className="mr-2 block text-sm text-gray-900">
                تفعيل إشعارات الواتساب
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الدفع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">طرق الدفع المقبولة</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="knet" defaultChecked className="h-4 w-4 text-blue-600" />
                <label htmlFor="knet" className="mr-2 text-sm text-gray-900">K-Net</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="visa" defaultChecked className="h-4 w-4 text-blue-600" />
                <label htmlFor="visa" className="mr-2 text-sm text-gray-900">Visa/MasterCard</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="cash" defaultChecked className="h-4 w-4 text-blue-600" />
                <label htmlFor="cash" className="mr-2 text-sm text-gray-900">الدفع النقدي عند الاستلام</label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العملة الافتراضية</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="KWD">دينار كويتي (KWD)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="AED">درهم إماراتي (AED)</option>
              <option value="USD">دولار أمريكي (USD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الأمان</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">مراجعة المنتجات قبل النشر</h4>
              <p className="text-sm text-gray-500">يجب على الأدمين مراجعة جميع المنتجات الجديدة</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">التحقق من هوية البائعين</h4>
              <p className="text-sm text-gray-500">طلب وثائق هوية من البائعين الجدد</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">تفعيل الـ Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">حماية إضافية لحسابات الأدمين</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          إلغاء
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.push('/admin/advanced')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                >
                  <Star className="h-5 w-5 ml-2" />
                  الإدارة المتقدمة
                </button>
                <span className="text-gray-700">مرحباً، الأدمن (summit_kw@hotmail.com)</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 ml-2" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow p-6 ml-8">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-5 w-5 ml-3" />
                نظرة عامة
              </button>
              
              <button
                onClick={() => setActiveTab('cars')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'cars'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Car className="h-5 w-5 ml-3" />
                إدارة السيارات
              </button>
              
              <button
                onClick={() => setActiveTab('parts')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'parts'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="h-5 w-5 ml-3" />
                إدارة قطع الغيار
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'users'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5 ml-3" />
                إدارة المستخدمين
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5 ml-3" />
                الإعدادات
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'cars' && renderCarsManagement()}
            {activeTab === 'parts' && renderPartsManagement()}
            {activeTab === 'users' && renderUsersManagement()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
      </div>
    </AuthWrapper>
  );
}