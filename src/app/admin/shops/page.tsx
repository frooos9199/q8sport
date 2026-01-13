'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';
import Link from 'next/link';
import { formatDateShort, formatDateLong } from '@/utils/dateUtils';

interface Shop {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  ownerWhatsapp?: string;
  businessType: string;
  address: string;
  description?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  lastActivity?: string;
  productCount: number;
  orderCount: number;
  rating: number;
  reviewCount: number;
}

interface ShopForm {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  businessType: string;
  address: string;
  description: string;
}

export default function ShopManagement() {
  const { user: currentUser } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBusinessType, setFilterBusinessType] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopForm, setShopForm] = useState<ShopForm>({
    name: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerWhatsapp: '',
    businessType: '',
    address: '',
    description: ''
  });

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      // محاكاة بيانات المحلات
      const mockShops: Shop[] = [
        {
          id: '1',
          name: 'محل السالم لقطع الغيار',
          ownerName: 'محمد عبدالله السالم',
          ownerEmail: 'mohammed@salem-parts.com',
          ownerPhone: '96565009876',
          ownerWhatsapp: '96565009876',
          businessType: 'قطع غيار السيارات',
          address: 'الكويت، حولي، شارع التجار، مجمع الحرفيين',
          description: 'محل متخصص في قطع غيار السيارات الأوروبية والأمريكية',
          status: 'ACTIVE',
          createdAt: '2024-01-10',
          lastActivity: '2025-01-28',
          productCount: 156,
          orderCount: 289,
          rating: 4.8,
          reviewCount: 67
        },
        {
          id: '2',
          name: 'ورشة الفهد للإطارات',
          ownerName: 'خالد أحمد الفهد',
          ownerEmail: 'khalid@alfahd-tires.com',
          ownerPhone: '96565123456',
          ownerWhatsapp: '96565123456',
          businessType: 'إطارات وبطاريات',
          address: 'الكويت، الفروانية، شارع الصناعة',
          description: 'ورشة متخصصة في الإطارات والبطاريات وخدمات السيارات',
          status: 'ACTIVE',
          createdAt: '2024-02-15',
          lastActivity: '2025-01-29',
          productCount: 89,
          orderCount: 145,
          rating: 4.6,
          reviewCount: 34
        },
        {
          id: '3',
          name: 'مركز الشامل للقطع',
          ownerName: 'أحمد سالم الشامل',
          ownerEmail: 'ahmed@alshamel-parts.com',
          ownerPhone: '96565234567',
          ownerWhatsapp: '96565234567',
          businessType: 'قطع غيار يابانية',
          address: 'الكويت، الجهراء، السوق المركزي',
          description: 'متخصصون في قطع غيار السيارات اليابانية والكورية',
          status: 'ACTIVE',
          createdAt: '2024-03-20',
          lastActivity: '2025-01-27',
          productCount: 203,
          orderCount: 178,
          rating: 4.9,
          reviewCount: 89
        },
        {
          id: '4',
          name: 'ورشة النور للصيانة',
          ownerName: 'عبدالله محمد النور',
          ownerEmail: 'abdullah@alnoor-service.com',
          ownerPhone: '96565345678',
          ownerWhatsapp: '96565345678',
          businessType: 'صيانة وإصلاح',
          address: 'الكويت، العاصمة، شارع فهد السالم',
          description: 'ورشة شاملة للصيانة والإصلاح وخدمات السيارات',
          status: 'SUSPENDED',
          createdAt: '2024-04-05',
          lastActivity: '2025-01-15',
          productCount: 45,
          orderCount: 67,
          rating: 4.2,
          reviewCount: 23
        },
        {
          id: '5',
          name: 'معرض الخليج للسيارات',
          ownerName: 'سالم خالد الخليج',
          ownerEmail: 'salem@gulf-cars.com',
          ownerPhone: '96565456789',
          ownerWhatsapp: '96565456789',
          businessType: 'بيع وشراء السيارات',
          address: 'الكويت، الأحمدي، طريق الفحيحيل',
          description: 'معرض متخصص في بيع وشراء السيارات المستعملة',
          status: 'BANNED',
          createdAt: '2024-05-10',
          lastActivity: '2024-12-20',
          productCount: 0,
          orderCount: 12,
          rating: 3.8,
          reviewCount: 15
        }
      ];
      setShops(mockShops);
    } catch (error) {
      console.error('خطأ في تحميل المحلات:', error);
    } finally {
      setLoading(false);
    }
  };

  // فلترة المحلات
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || shop.status === filterStatus;
    const matchesBusinessType = filterBusinessType === '' || shop.businessType.includes(filterBusinessType);
    
    return matchesSearch && matchesStatus && matchesBusinessType;
  });

  // Open Modal
  const openModal = (type: typeof modalType, shop?: Shop) => {
    setModalType(type);
    setSelectedShop(shop || null);
    
    if (type === 'edit' && shop) {
      setShopForm({
        name: shop.name,
        ownerName: shop.ownerName,
        ownerEmail: shop.ownerEmail,
        ownerPhone: shop.ownerPhone || '',
        ownerWhatsapp: shop.ownerWhatsapp || '',
        businessType: shop.businessType,
        address: shop.address,
        description: shop.description || ''
      });
    } else if (type === 'add') {
      setShopForm({
        name: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        ownerWhatsapp: '',
        businessType: '',
        address: '',
        description: ''
      });
    }
    
    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedShop(null);
    setShopForm({
      name: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      ownerWhatsapp: '',
      businessType: '',
      address: '',
      description: ''
    });
  };

  // Add Shop
  const handleAddShop = async () => {
    try {
      if (!shopForm.name || !shopForm.ownerName || !shopForm.ownerEmail || !shopForm.businessType) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      const newShop: Shop = {
        id: Date.now().toString(),
        name: shopForm.name,
        ownerName: shopForm.ownerName,
        ownerEmail: shopForm.ownerEmail,
        ownerPhone: shopForm.ownerPhone,
        ownerWhatsapp: shopForm.ownerWhatsapp,
        businessType: shopForm.businessType,
        address: shopForm.address,
        description: shopForm.description,
        status: 'ACTIVE',
        createdAt: formatDateShort(new Date().toISOString()),
        productCount: 0,
        orderCount: 0,
        rating: 0,
        reviewCount: 0
      };

      setShops(prev => [...prev, newShop]);
      closeModal();
      alert('تم إضافة المحل بنجاح');
    } catch (error) {
      console.error('خطأ في إضافة المحل:', error);
      alert('حدث خطأ في إضافة المحل');
    }
  };

  // Edit Shop
  const handleEditShop = async () => {
    try {
      if (!selectedShop || !shopForm.name || !shopForm.ownerName || !shopForm.ownerEmail) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      setShops(prev => prev.map(shop => 
        shop.id === selectedShop.id 
          ? {
              ...shop,
              name: shopForm.name,
              ownerName: shopForm.ownerName,
              ownerEmail: shopForm.ownerEmail,
              ownerPhone: shopForm.ownerPhone,
              ownerWhatsapp: shopForm.ownerWhatsapp,
              businessType: shopForm.businessType,
              address: shopForm.address,
              description: shopForm.description
            }
          : shop
      ));

      closeModal();
      alert('تم تحديث بيانات المحل بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث المحل:', error);
      alert('حدث خطأ في تحديث المحل');
    }
  };

  // Delete Shop
  const confirmDeleteShop = async () => {
    try {
      if (!selectedShop) return;

      setShops(prev => prev.filter(shop => shop.id !== selectedShop.id));
      closeModal();
      alert('تم حذف المحل بنجاح');
    } catch (error) {
      console.error('خطأ في حذف المحل:', error);
      alert('حدث خطأ في حذف المحل');
    }
  };

  // Change Shop Status
  const handleChangeShopStatus = async (shop: Shop, newStatus: Shop['status']) => {
    try {
      const statusText = {
        'ACTIVE': 'تفعيل',
        'SUSPENDED': 'إيقاف مؤقت', 
        'BANNED': 'حظر نهائي'
      };

      const confirmed = confirm(`هل أنت متأكد من ${statusText[newStatus]} المحل "${shop.name}"؟`);
      if (!confirmed) return;

      setShops(prev => prev.map(s => 
        s.id === shop.id ? { ...s, status: newStatus } : s
      ));

      alert(`تم ${statusText[newStatus]} المحل بنجاح`);
    } catch (error) {
      console.error('خطأ في تغيير حالة المحل:', error);
      alert('حدث خطأ في تغيير حالة المحل');
    }
  };

  // Utility functions
  const getStatusColor = (status: Shop['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'BANNED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Shop['status']) => {
    switch (status) {
      case 'ACTIVE': return 'نشط';
      case 'SUSPENDED': return 'معلق';
      case 'BANNED': return 'محظور';
      default: return 'غير معروف';
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('⭐');
      } else if (i - 0.5 <= rating) {
        stars.push('⭐');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  if (loading) {
    return (
      <AuthWrapper requireAuth={true} requireAdmin={true}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800">جاري تحميل المحلات...</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin" className="flex items-center text-white/80 hover:text-white ml-4 transition-colors">
                  ← العودة للوحة الإدارة
                </Link>
                <h1 className="text-2xl font-bold text-white mr-4">إدارة المحلات</h1>
              </div>
              <button
                onClick={() => openModal('add')}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                🏪 إضافة محل جديد
              </button>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* البحث والفلاتر */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* البحث */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث بالاسم أو صاحب المحل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>

              {/* فلتر نوع النشاط */}
              <select
                value={filterBusinessType}
                onChange={(e) => setFilterBusinessType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                title="فلترة حسب نوع النشاط"
              >
                <option value="">جميع الأنشطة</option>
                <option value="قطع غيار">قطع غيار</option>
                <option value="إطارات">إطارات</option>
                <option value="صيانة">صيانة</option>
                <option value="سيارات">سيارات</option>
                <option value="زيوت">زيوت</option>
              </select>

              {/* فلتر الحالة */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                title="فلترة حسب الحالة"
              >
                <option value="">جميع الحالات</option>
                <option value="ACTIVE">نشط</option>
                <option value="SUSPENDED">معلق</option>
                <option value="BANNED">محظور</option>
              </select>

              {/* عدد النتائج */}
              <div className="flex items-center justify-center bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-700 font-medium">
                  {filteredShops.length} من {shops.length} محل
                </span>
              </div>
            </div>
          </div>

          {/* جدول المحلات */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المحل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">صاحب المحل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع النشاط</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتجات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredShops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                            <span className="text-blue-600 font-semibold text-lg">
                              🏪
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{shop.name}</p>
                            <p className="text-xs text-gray-500">{shop.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{shop.ownerName}</p>
                          <p className="text-sm text-gray-500">{shop.ownerEmail}</p>
                          {shop.ownerPhone && (
                            <p className="text-xs text-gray-400">{shop.ownerPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {shop.businessType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shop.status)}`}>
                          {getStatusText(shop.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{shop.rating.toFixed(1)}</span>
                          <span className="text-yellow-400 mr-1">{getRatingStars(shop.rating)}</span>
                          <span className="text-xs text-gray-500 mr-1">({shop.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">
                        {shop.productCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">
                        {shop.orderCount}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal('view', shop)}
                            className="text-blue-600 hover:text-blue-900 text-lg"
                            title="عرض التفاصيل"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => openModal('edit', shop)}
                            className="text-green-600 hover:text-green-900 text-lg"
                            title="تعديل"
                          >
                            ✏️
                          </button>
                          {shop.status === 'ACTIVE' ? (
                            <>
                              <button
                                onClick={() => handleChangeShopStatus(shop, 'SUSPENDED')}
                                className="text-yellow-600 hover:text-yellow-900 text-lg"
                                title="إيقاف مؤقت"
                              >
                                ⏸️
                              </button>
                              <button
                                onClick={() => handleChangeShopStatus(shop, 'BANNED')}
                                className="text-red-600 hover:text-red-900 text-lg"
                                title="حظر"
                              >
                                ⚠️
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleChangeShopStatus(shop, 'ACTIVE')}
                              className="text-green-600 hover:text-green-900 text-lg"
                              title="تفعيل"
                            >
                              ✅
                            </button>
                          )}
                          <button
                            onClick={() => openModal('delete', shop)}
                            className="text-red-600 hover:text-red-900 text-lg"
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredShops.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-600">لم يتم العثور على محلات تطابق معايير البحث</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {modalType === 'add' && '🏪 إضافة محل جديد'}
                  {modalType === 'edit' && '✏️ تعديل المحل'}
                  {modalType === 'view' && '👁️ تفاصيل المحل'}
                  {modalType === 'delete' && '🗑️ حذف المحل'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Add/Edit Shop Form */}
              {(modalType === 'add' || modalType === 'edit') && (
                <div className="space-y-6">
                  {/* معلومات المحل */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">معلومات المحل</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المحل *</label>
                        <input
                          type="text"
                          value={shopForm.name}
                          onChange={(e) => setShopForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="اسم المحل"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع النشاط *</label>
                        <input
                          type="text"
                          value={shopForm.businessType}
                          onChange={(e) => setShopForm(prev => ({ ...prev, businessType: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="قطع غيار السيارات"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المحل *</label>
                        <textarea
                          value={shopForm.address}
                          onChange={(e) => setShopForm(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                          placeholder="العنوان الكامل للمحل"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">وصف المحل</label>
                        <textarea
                          value={shopForm.description}
                          onChange={(e) => setShopForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="وصف مختصر عن المحل وخدماته"
                        />
                      </div>
                    </div>
                  </div>

                  {/* معلومات صاحب المحل */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3">معلومات صاحب المحل</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم صاحب المحل *</label>
                        <input
                          type="text"
                          value={shopForm.ownerName}
                          onChange={(e) => setShopForm(prev => ({ ...prev, ownerName: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="الاسم الكامل"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                        <input
                          type="email"
                          value={shopForm.ownerEmail}
                          onChange={(e) => setShopForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="example@domain.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <input
                          type="tel"
                          value={shopForm.ownerPhone}
                          onChange={(e) => setShopForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="96565000000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">واتساب</label>
                        <input
                          type="tel"
                          value={shopForm.ownerWhatsapp}
                          onChange={(e) => setShopForm(prev => ({ ...prev, ownerWhatsapp: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="96565000000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={modalType === 'add' ? handleAddShop : handleEditShop}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      💾 {modalType === 'add' ? 'إضافة المحل' : 'تحديث المحل'}
                    </button>
                  </div>
                </div>
              )}

              {/* View Shop Details */}
              {modalType === 'view' && selectedShop && (
                <div className="space-y-6">
                  {/* معلومات المحل */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">معلومات المحل</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">اسم المحل</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedShop.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">نوع النشاط</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedShop.businessType}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">العنوان</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedShop.address}</p>
                      </div>
                      {selectedShop.description && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">الوصف</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedShop.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* معلومات صاحب المحل */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3">معلومات صاحب المحل</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">الاسم</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedShop.ownerName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedShop.ownerEmail}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedShop.ownerPhone || 'غير محدد'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">واتساب</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedShop.ownerWhatsapp || 'غير محدد'}</p>
                      </div>
                    </div>
                  </div>

                  {/* الإحصائيات */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-3">الإحصائيات والتقييم</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">الحالة</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedShop.status)}`}>
                          {getStatusText(selectedShop.status)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">التقييم</label>
                        <div className="flex items-center mt-1">
                          <span className="text-sm font-medium text-gray-900">{selectedShop.rating.toFixed(1)}</span>
                          <span className="text-yellow-400 mr-1">{getRatingStars(selectedShop.rating)}</span>
                          <span className="text-xs text-gray-500">({selectedShop.reviewCount} تقييم)</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">عدد المنتجات</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedShop.productCount}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">عدد الطلبات</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedShop.orderCount}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">تاريخ الانضمام</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDateLong(selectedShop.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">آخر نشاط</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedShop.lastActivity ? formatDateLong(selectedShop.lastActivity) : 'غير محدد'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation */}
              {modalType === 'delete' && selectedShop && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-red-600 text-2xl ml-3">⚠️</div>
                      <div>
                        <h4 className="text-red-800 font-medium">تحذير: حذف المحل</h4>
                        <p className="text-red-700 text-sm mt-1">
                          هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المحل ومنتجاته نهائياً.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-900">هل أنت متأكد من حذف المحل التالي؟</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-lg">🏪 {selectedShop.name}</p>
                      <p className="text-sm text-gray-600">صاحب المحل: {selectedShop.ownerName}</p>
                      <p className="text-sm text-gray-600">نوع النشاط: {selectedShop.businessType}</p>
                      <p className="text-sm text-gray-600">المنتجات: {selectedShop.productCount} | الطلبات: {selectedShop.orderCount}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={confirmDeleteShop}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      🗑️ حذف المحل نهائياً
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthWrapper>
  );
}