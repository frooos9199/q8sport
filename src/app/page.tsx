'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// بيانات السيارات الرياضية
const SPORT_CARS = {
  Ford: ['Mustang', 'F-150 Raptor', 'GT', 'Shelby GT500'],
  Chevrolet: ['Corvette', 'Camaro', 'Silverado ZR2'],
  Toyota: ['Supra', 'GR86', 'Tundra TRD Pro'],
  Dodge: ['Challenger', 'Charger', 'Viper'],
  Nissan: ['GT-R', '370Z', 'Titan'],
  BMW: ['M3', 'M4', 'M5', 'M8'],
  Mercedes: ['AMG GT', 'C63 AMG', 'E63 AMG'],
  Porsche: ['911', 'Cayman', 'Panamera']
};

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  productType: 'CAR' | 'PART';
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  kilometers?: number;
  color?: string;
  images: string;
  condition?: string;
  views?: number;
  contactPhone?: string;
  contactWhatsapp?: string;
  status: string;
  createdAt: string;
}

export default function Home() {
  const { user, logout, canAccessAdminPanel } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState<'ALL' | 'CAR' | 'PART'>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    alert('تم تسجيل الخروج بنجاح');
    router.push('/');
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedType, selectedBrand, selectedModel]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?status=ACTIVE');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(p => p.productType === selectedType);
    }

    if (selectedBrand) {
      filtered = filtered.filter(p => p.carBrand === selectedBrand);
    }

    if (selectedModel) {
      filtered = filtered.filter(p => p.carModel === selectedModel);
    }

    setFilteredProducts(filtered);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel('');
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">
              أحلى سيارات <span className="text-red-600">الكويت</span>
            </h1>
            <nav className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                <Link href="/auctions" className="text-gray-200 hover:text-white font-semibold transition-colors">
                  المزادات
                </Link>
                <Link href="/showcases" className="text-gray-200 hover:text-white font-semibold transition-colors">
                  Car Show
                </Link>
                <Link href="/requests" className="text-gray-200 hover:text-white font-semibold transition-colors">
                  المطلوبات
                </Link>
                <Link href="/users" className="text-gray-200 hover:text-white font-semibold transition-colors">
                  البائعين
                </Link>
              </div>
              {user ? (
                <div className="flex gap-4">
                  <Link href="/add-listing" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                    أضف إعلانك
                  </Link>
                  {canAccessAdminPanel() && (
                    <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                      لوحة الإدارة
                    </Link>
                  )}
                  <Link href="/profile" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                    الملف الشخصي
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <Link href="/auth" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  تسجيل الدخول
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-16 border-b border-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            أفضل السيارات الرياضية في الكويت
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            اشتري وبيع السيارات الرياضية وقطع الغيار بكل سهولة
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-gray-900 py-8 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white mb-2 font-semibold">النوع</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
              >
                <option value="ALL">الكل</option>
                <option value="CAR">سيارات</option>
                <option value="PART">قطع غيار</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">الماركة</label>
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
              >
                <option value="">جميع الماركات</option>
                {Object.keys(SPORT_CARS).map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">الموديل</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand}
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none disabled:opacity-50"
              >
                <option value="">جميع الموديلات</option>
                {selectedBrand && SPORT_CARS[selectedBrand as keyof typeof SPORT_CARS]?.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedType('ALL');
                  setSelectedBrand('');
                  setSelectedModel('');
                }}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              <p className="text-white mt-4">جاري التحميل...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">لا توجد نتائج</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300 group">
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative h-56 bg-black">
                      <Image
                        src={getImageUrl(product.images)}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {product.productType === 'CAR' ? 'سيارة' : 'قطعة غيار'}
                      </div>
                      {product.condition && (
                        <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          {product.condition}
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center">
                        👁 {product.views || 0}
                      </div>
                    </div>
                  </Link>

                  <div className="p-5">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 hover:text-red-400 transition-colors cursor-pointer">
                        {product.title}
                      </h3>
                    </Link>
                    
                    {product.productType === 'CAR' && (
                      <div className="flex flex-wrap gap-2 mb-3 text-sm text-gray-400">
                        {product.carBrand && (
                          <span className="bg-gray-800 px-2 py-1 rounded">{product.carBrand}</span>
                        )}
                        {product.carModel && (
                          <span className="bg-gray-800 px-2 py-1 rounded">{product.carModel}</span>
                        )}
                        {product.carYear && (
                          <span className="bg-gray-800 px-2 py-1 rounded">{product.carYear}</span>
                        )}
                        {product.kilometers && (
                          <span className="bg-blue-800 px-2 py-1 rounded">{product.kilometers.toLocaleString()} كم</span>
                        )}
                      </div>
                    )}

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* عرض رقم الهاتف بوضوح */}
                    {product.contactPhone && (
                      <div className="bg-gray-800 p-3 rounded-lg mb-4 border border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">رقم الهاتف:</span>
                          <span className="text-white font-bold text-lg">{product.contactPhone}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-red-600">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(product.createdAt).toLocaleDateString('ar-KW')}
                      </span>
                    </div>

                    {/* أزرار التواصل المحسنة */}
                    <div className="space-y-2">
                      <Link 
                        href={`/products/${product.id}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center font-semibold transition-all flex items-center justify-center"
                      >
                        🔍 عرض التفاصيل
                      </Link>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {product.contactPhone && (
                          <a
                            href={`tel:${product.contactPhone}`}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-center font-semibold transition-all text-sm"
                          >
                            📞 اتصال
                          </a>
                        )}
                        {product.contactWhatsapp && (
                          <a
                            href={`https://wa.me/${product.contactWhatsapp.replace(/[^0-9]/g, '')}?text=مرحبا، أريد الاستفسار عن ${product.title}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-center font-semibold transition-all text-sm"
                          >
                            💬 واتساب
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-red-600 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">أحلى سيارات الكويت</h3>
              <p className="text-gray-400 text-sm">
                منصة بيع السيارات الرياضية الأمريكية وقطع الغيار الأصلية في الكويت
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                    شروط الخدمة
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-400 hover:text-white transition-colors text-sm">
                    الدعم والمساعدة
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 support@q8sportcar.com</li>
                <li>📱 الكويت</li>
                <li>🌐 www.q8sportcar.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 أحلى سيارات الكويت - جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
