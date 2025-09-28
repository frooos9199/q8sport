'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/components/AuthWrapper';
import { 
  Car, Users, Package, TrendingUp, Settings, LogOut, Plus, Edit, 
  Trash2, Upload, Image as ImageIcon, Save, X, Eye, EyeOff,
  MessageCircle, Ban, CheckCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
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

  // Sample data
  const [users, setUsers] = useState([
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', role: 'user', status: 'active', joinDate: '2024-01-15', auctions: 12, spent: 2500 },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', role: 'user', status: 'active', joinDate: '2024-02-20', auctions: 8, spent: 1200 },
    { id: 3, name: 'محمد السالم', email: 'mohammed@example.com', role: 'user', status: 'suspended', joinDate: '2024-01-10', auctions: 25, spent: 5000 },
  ]);

  const [parts, setParts] = useState([
    { id: 1, name: 'محرك V8 موستنق', nameEn: 'V8 Mustang Engine', category: 'المحرك', brand: 'Ford', model: 'Mustang', price: 2500, condition: 'مستعمل', images: 3, status: 'active' },
    { id: 2, name: 'فرامل Brembo كورفيت', nameEn: 'Brembo Corvette Brakes', category: 'الفرامل', brand: 'Chevrolet', model: 'Corvette', price: 800, condition: 'جديد', images: 2, status: 'active' },
  ]);

  const [advertisements, setAdvertisements] = useState([
    { id: 1, title: 'عروض خاصة على محركات Ford Mustang', active: true, clicks: 245, views: 1200 },
    { id: 2, title: 'تخفيضات على فرامل Brembo للكورفيت', active: true, clicks: 189, views: 890 },
    { id: 3, title: 'قطع غيار أصلية F-150 Raptor', active: false, clicks: 156, views: 650 },
  ]);

  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ));
  };

  const toggleAdStatus = (adId: number) => {
    setAdvertisements(advertisements.map(ad => 
      ad.id === adId 
        ? { ...ad, active: !ad.active }
        : ad
    ));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">إجمالي القطع</h3>
              <p className="text-3xl font-bold text-blue-600">1,234</p>
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
              <p className="text-3xl font-bold text-green-600">87</p>
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
              <p className="text-3xl font-bold text-yellow-600">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Car className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">السيارات المدعومة</h3>
              <p className="text-3xl font-bold text-purple-600">4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">النشاط الأخير</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full ml-3"></div>
              <div>
                <p className="font-semibold">مزاد جديد تم إنشاؤه</p>
                <p className="text-sm text-gray-600">محرك V8 - Ford Mustang</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full ml-3"></div>
              <div>
                <p className="font-semibold">مستخدم جديد انضم</p>
                <p className="text-sm text-gray-600">أحمد محمد</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائيات الإعلانات</h3>
          <div className="space-y-3">
            {advertisements.slice(0, 3).map((ad) => (
              <div key={ad.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm">{ad.title}</h4>
                  <p className="text-xs text-gray-600">{ad.views} مشاهدة • {ad.clicks} نقرة</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  ad.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {ad.active ? 'نشط' : 'معطل'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => openModal('message-users')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <MessageCircle className="h-5 w-5 ml-2" />
            إرسال رسالة جماعية
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانضمام</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المزادات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ المنفق</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.role === 'admin' ? 'أدمن' : 'مستخدم'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.joinDate}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.auctions}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.spent} د.ك</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'نشط' : 'معلق'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className={`p-1 rounded ${
                        user.status === 'active' 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={user.status === 'active' ? 'تعليق المستخدم' : 'إلغاء التعليق'}
                    >
                      {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      title="عرض التفاصيل"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-900"
                      title="إرسال رسالة واتساب"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPartsManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة قطع الغيار</h2>
        <button 
          onClick={() => openModal('add-part')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة قطعة جديدة
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القطعة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السيارة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصور</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {parts.map((part) => (
              <tr key={part.id}>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{part.name}</p>
                    <p className="text-sm text-gray-500">{part.nameEn}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{part.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{part.brand} {part.model}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{part.price} د.ك</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    part.condition === 'جديد' ? 'bg-green-100 text-green-800' :
                    part.condition === 'جيد جداً' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {part.condition}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{part.images} صور</td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      title="تعديل القطعة"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-900"
                      title="إدارة الصور"
                      onClick={() => openModal('manage-images')}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      title="حذف القطعة"
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
  );

  const renderAdvertisementManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة الإعلانات</h2>
        <button 
          onClick={() => openModal('add-advertisement')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة إعلان جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المشاهدات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النقرات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل النقر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {advertisements.map((ad) => (
              <tr key={ad.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{ad.title}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{ad.views.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{ad.clicks.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {((ad.clicks / ad.views) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    ad.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ad.active ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleAdStatus(ad.id)}
                      className={`p-1 rounded ${
                        ad.active 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={ad.active ? 'إلغاء التفعيل' : 'تفعيل'}
                    >
                      {ad.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      title="تعديل الإعلان"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      title="حذف الإعلان"
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
  );

  const renderModal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch (modalType) {
        case 'add-part':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">إضافة قطعة غيار جديدة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم القطعة (عربي)</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم القطعة (إنجليزي)</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الماركة</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>Ford</option>
                    <option>Chevrolet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموديل</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>Mustang</option>
                    <option>F-150</option>
                    <option>Corvette</option>
                    <option>Camaro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>المحرك</option>
                    <option>الفرامل</option>
                    <option>التعليق</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>جديد</option>
                    <option>جيد جداً</option>
                    <option>مستعمل</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea className="w-full p-2 border border-gray-300 rounded-lg" rows={3}></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">رفع الصور</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">اضغط لرفع الصور أو اسحبها هنا</p>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'manage-images':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">إدارة صور القطعة</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            </div>
          );

        case 'add-advertisement':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">إضافة إعلان جديد</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الإعلان</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرابط</label>
                  <input type="url" className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">صورة الإعلان</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">اضغط لرفع صورة الإعلان</p>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'message-users':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">إرسال رسالة جماعية</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الرسالة</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="مثال: إشعار مهم حول المزادات" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نص الرسالة</label>
                  <textarea className="w-full p-2 border border-gray-300 rounded-lg" rows={4} placeholder="اكتب رسالتك هنا..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الإرسال</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="ml-2" defaultChecked />
                      <span>إرسال عبر البريد الإلكتروني</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="ml-2" defaultChecked />
                      <span>إرسال عبر واتساب (للمستخدمين المسجلين)</span>
                    </label>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    📊 سيتم إرسال الرسالة إلى {users.filter(u => u.status === 'active').length} مستخدم نشط
                  </p>
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {renderModalContent()}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Save className="h-4 w-4 inline ml-2" />
              حفظ
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة المتقدمة</h1>
              </div>
              <div className="flex items-center space-x-4">
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
                  activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-5 w-5 ml-3" />
                نظرة عامة
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5 ml-3" />
                إدارة المستخدمين
              </button>
              
              <button
                onClick={() => setActiveTab('parts')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'parts' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="h-5 w-5 ml-3" />
                إدارة قطع الغيار
              </button>

              <button
                onClick={() => setActiveTab('advertisements')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'advertisements' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ImageIcon className="h-5 w-5 ml-3" />
                إدارة الإعلانات
              </button>
              
              <button
                onClick={() => setActiveTab('cars')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'cars' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Car className="h-5 w-5 ml-3" />
                إدارة السيارات
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-2 text-right rounded-lg ${
                  activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
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
            {activeTab === 'users' && renderUsersManagement()}
            {activeTab === 'parts' && renderPartsManagement()}
            {activeTab === 'advertisements' && renderAdvertisementManagement()}
            {activeTab === 'cars' && (
              <div className="text-center py-20">
                <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">إدارة السيارات</h3>
                <p className="text-gray-600">قريباً...</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="text-center py-20">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">الإعدادات</h3>
                <p className="text-gray-600">قريباً...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
    </AuthWrapper>
  );
}