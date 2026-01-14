'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, User as UserIcon, Phone, Mail, Calendar, Package, ShoppingBag, Edit, Trash2, Crown } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: 'USER' | 'SELLER' | 'SHOP_OWNER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  lastLoginAt?: string;
  shopName?: string;
  shopAddress?: string;
  businessType?: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  productType: 'CAR' | 'PART';
  status: string;
  images: string;
  createdAt: string;
  views: number;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    shopName: '',
    shopAddress: '',
    businessType: ''
  });

  useEffect(() => {
    if (params.id) {
      loadUserData();
    }
  }, [params.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // محاكاة جلب بيانات المستخدم
      const mockUser: User = {
        id: params.id as string,
        name: 'أحمد محمد الصالح',
        email: 'ahmed@example.com',
        phone: '96565001234',
        whatsapp: '96565001234',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-15',
        lastLoginAt: '2025-01-28',
        shopName: 'متجر السيارات الرياضية',
        shopAddress: 'الكويت - الجهراء',
        businessType: 'قطع غيار'
      };

      const mockProducts: Product[] = [
        {
          id: '1',
          title: 'Ford Mustang 2023',
          description: 'سيارة رياضية بحالة ممتازة',
          price: 15000,
          productType: 'CAR',
          status: 'ACTIVE',
          images: JSON.stringify(['/placeholder-car.jpg']),
          createdAt: '2025-01-15',
          views: 125
        },
        {
          id: '2',
          title: 'محرك كامل V8',
          description: 'محرك أصلي من موستنج',
          price: 3500,
          productType: 'PART',
          status: 'ACTIVE',
          images: JSON.stringify(['/placeholder-car.jpg']),
          createdAt: '2025-01-10',
          views: 89
        }
      ];

      setUser(mockUser);
      setProducts(mockProducts);
      setEditForm({
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone || '',
        whatsapp: mockUser.whatsapp || '',
        shopName: mockUser.shopName || '',
        shopAddress: mockUser.shopAddress || '',
        businessType: mockUser.businessType || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      // هنا يتم إرسال البيانات للـ API
      console.log('Updating user:', editForm);
      alert('تم تحديث بيانات المستخدم بنجاح');
      setShowEditModal(false);
      loadUserData();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('حدث خطأ أثناء تحديث البيانات');
    }
  };

  const handlePromoteUser = async (newRole: 'USER' | 'SELLER' | 'SHOP_OWNER') => {
    try {
      // هنا يتم إرسال البيانات للـ API
      console.log('Promoting user to:', newRole);
      alert(`تم ترقية المستخدم إلى ${getRoleLabel(newRole)} بنجاح`);
      setShowPromoteModal(false);
      loadUserData();
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('حدث خطأ أثناء ترقية المستخدم');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      // هنا يتم إرسال الطلب للـ API
      console.log('Deleting product:', productId);
      alert('تم حذف المنتج بنجاح');
      loadUserData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('حدث خطأ أثناء حذف المنتج');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      USER: 'مستخدم',
      SELLER: 'بائع',
      SHOP_OWNER: 'صاحب محل',
      ADMIN: 'مدير'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      USER: 'bg-gray-600',
      SELLER: 'bg-blue-600',
      SHOP_OWNER: 'bg-purple-600',
      ADMIN: 'bg-red-600'
    };
    return colors[role] || 'bg-gray-600';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'نشط',
      SUSPENDED: 'معلق',
      BANNED: 'محظور'
    };
    return labels[status] || status;
  };

  const getImageUrl = (images: string) => {
    try {
      const imageArray = JSON.parse(images);
      return imageArray[0] || '/placeholder-car.jpg';
    } catch {
      return '/placeholder-car.jpg';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-KW', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="text-white mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">المستخدم غير موجود</p>
          <Link href="/admin/users" className="text-red-600 hover:text-red-500 mt-4 inline-block">
            العودة إلى قائمة المستخدمين
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">
                تفاصيل المستخدم
              </h1>
              <Link
                href="/admin/users"
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center"
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* معلومات المستخدم */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">معلومات المستخدم</h2>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-gray-800 rounded-full p-6">
                      <UserIcon className="h-16 w-16 text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm">الاسم</label>
                    <p className="text-white font-semibold">{user.name}</p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm">البريد الإلكتروني</label>
                    <p className="text-white font-semibold flex items-center">
                      <Mail className="h-4 w-4 ml-2" />
                      {user.email}
                    </p>
                  </div>

                  {user.phone && (
                    <div>
                      <label className="text-gray-400 text-sm">رقم الهاتف</label>
                      <p className="text-white font-semibold flex items-center">
                        <Phone className="h-4 w-4 ml-2" />
                        {user.phone}
                      </p>
                    </div>
                  )}

                  {user.whatsapp && (
                    <div>
                      <label className="text-gray-400 text-sm">واتساب</label>
                      <p className="text-white font-semibold">{user.whatsapp}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-gray-400 text-sm">الدور</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`${getRoleColor(user.role)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                        {getRoleLabel(user.role)}
                      </span>
                      <button
                        onClick={() => setShowPromoteModal(true)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white p-1 rounded-lg transition-all"
                        title="ترقية المستخدم"
                      >
                        <Crown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm">الحالة</label>
                    <p className="text-white font-semibold">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        user.status === 'ACTIVE' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm">تاريخ التسجيل</label>
                    <p className="text-white font-semibold flex items-center">
                      <Calendar className="h-4 w-4 ml-2" />
                      {new Date(user.createdAt).toLocaleDateString('ar-KW')}
                    </p>
                  </div>

                  {user.lastLoginAt && (
                    <div>
                      <label className="text-gray-400 text-sm">آخر دخول</label>
                      <p className="text-white font-semibold">
                        {new Date(user.lastLoginAt).toLocaleDateString('ar-KW')}
                      </p>
                    </div>
                  )}

                  {user.role === 'SHOP_OWNER' && (
                    <>
                      {user.shopName && (
                        <div>
                          <label className="text-gray-400 text-sm">اسم المحل</label>
                          <p className="text-white font-semibold">{user.shopName}</p>
                        </div>
                      )}
                      {user.shopAddress && (
                        <div>
                          <label className="text-gray-400 text-sm">عنوان المحل</label>
                          <p className="text-white font-semibold">{user.shopAddress}</p>
                        </div>
                      )}
                      {user.businessType && (
                        <div>
                          <label className="text-gray-400 text-sm">نوع العمل</label>
                          <p className="text-white font-semibold">{user.businessType}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* المنتجات */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Package className="h-5 w-5 ml-2" />
                    المنتجات ({products.length})
                  </h2>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">لا توجد منتجات</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-red-600 transition-all">
                        <div className="relative h-48">
                          <Image
                            src={getImageUrl(product.images)}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            {product.productType === 'CAR' ? 'سيارة' : 'قطعة غيار'}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            👁 {product.views}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-2 line-clamp-1">{product.title}</h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-red-600 font-bold">{formatPrice(product.price)}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.status === 'ACTIVE' ? 'bg-green-600' : 'bg-gray-600'
                            } text-white`}>
                              {product.status}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              href={`/products/${product.id}`}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm text-center transition-all"
                            >
                              عرض
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal تعديل المستخدم */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-6">تعديل بيانات المستخدم</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">الاسم</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">رقم الهاتف</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">واتساب</label>
                  <input
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                  />
                </div>

                {user.role === 'SHOP_OWNER' && (
                  <>
                    <div>
                      <label className="block text-white mb-2">اسم المحل</label>
                      <input
                        type="text"
                        value={editForm.shopName}
                        onChange={(e) => setEditForm({...editForm, shopName: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">عنوان المحل</label>
                      <input
                        type="text"
                        value={editForm.shopAddress}
                        onChange={(e) => setEditForm({...editForm, shopAddress: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">نوع العمل</label>
                      <input
                        type="text"
                        value={editForm.businessType}
                        onChange={(e) => setEditForm({...editForm, businessType: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all"
                >
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal ترقية المستخدم */}
        {showPromoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Crown className="h-6 w-6 ml-2 text-yellow-500" />
                ترقية المستخدم
              </h3>
              
              <p className="text-gray-300 mb-6">اختر الدور الجديد للمستخدم:</p>

              <div className="space-y-3">
                <button
                  onClick={() => handlePromoteUser('USER')}
                  disabled={user?.role === 'USER'}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    user?.role === 'USER'
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  مستخدم عادي
                </button>

                <button
                  onClick={() => handlePromoteUser('SELLER')}
                  disabled={user?.role === 'SELLER'}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    user?.role === 'SELLER'
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  بائع
                </button>

                <button
                  onClick={() => handlePromoteUser('SHOP_OWNER')}
                  disabled={user?.role === 'SHOP_OWNER'}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    user?.role === 'SHOP_OWNER'
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  صاحب محل
                </button>
              </div>

              <button
                onClick={() => setShowPromoteModal(false)}
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthWrapper>
  );
}
