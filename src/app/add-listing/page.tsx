'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

export default function AddListingPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // فحص المصادقة
  useEffect(() => {
    console.log('Auth Check:', { user, token });
    if (!user) {
      alert('يجب عليك تسجيل الدخول أولاً لإضافة إعلان');
      router.push('/auth');
    } else if (!token) {
      console.warn('User exists but no token found!');
      alert('جلسة المستخدم غير صالحة. يرجى تسجيل الدخول مرة أخرى');
      router.push('/auth');
    }
  }, [user, token, router]);
  
  const [formData, setFormData] = useState({
    productType: 'CAR',
    title: '',
    description: '',
    price: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    kilometers: '',
    transmission: 'أوتوماتيك',
    fuelType: 'بنزين',
    color: '',
    engineSize: '',
    contactPhone: '',
    contactWhatsapp: '',
    preferredContact: [] as string[],
    condition: 'ممتازة',
    images: [] as File[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === 'checkbox' && name === 'preferredContact') {
      const checked = target.checked;
      setFormData((prev) => ({
        ...prev,
        preferredContact: checked
          ? [...prev.preferredContact, value]
          : prev.preferredContact.filter((item) => item !== value)
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, carBrand: e.target.value, carModel: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, images: files }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // فحص تسجيل الدخول قبل الإرسال
    if (!user || !user.id) {
      setError('يجب عليك تسجيل الدخول أولاً لإضافة إعلان');
      router.push('/auth');
      return;
    }
    
    if (!token) {
      setError('جلسة المستخدم غير صالحة. يرجى تسجيل الدخول مرة أخرى');
      console.error('No token available for authenticated user');
      router.push('/auth');
      return;
    }
    
    console.log('Submitting product with token:', token?.substring(0, 20) + '...');
    
    setLoading(true);
    setError('');

    try {
      // Convert images to base64 or upload them
      const imageUrls: string[] = [];
      for (const file of formData.images) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(base64);
      }

      const payload = {
        userId: user.id, // إضافة معرف المستخدم
        productType: formData.productType,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        carBrand: formData.carBrand || undefined,
        carModel: formData.carModel || undefined,
        carYear: formData.carYear ? parseInt(formData.carYear) : undefined,
        kilometers: formData.kilometers ? parseInt(formData.kilometers) : undefined,
        transmission: formData.transmission || undefined,
        fuelType: formData.fuelType || undefined,
        color: formData.color || undefined,
        engineSize: formData.engineSize || undefined,
        contactPhone: formData.contactPhone,
        contactWhatsapp: formData.contactWhatsapp,
        preferredContact: JSON.stringify(formData.preferredContact),
        condition: formData.condition,
        images: JSON.stringify(imageUrls),
        showSellerName: false
      };

      // التأكد من وجود token قبل الإرسال
      if (!token) {
        throw new Error('لا يوجد token للمصادقة');
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.error || 'حدث خطأ أثناء إضافة الإعلان');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إضافة الإعلان');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-4xl font-bold text-white cursor-pointer">
                Q8 <span className="text-red-600">Motors</span>
              </h1>
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white">
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-8 border border-gray-800">
          <h2 className="text-3xl font-bold text-white mb-8">أضف إعلانك</h2>

          {error && (
            <div className="bg-red-900 border border-red-600 text-white px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* نوع الإعلان */}
            <div>
              <label className="block text-white mb-2 font-semibold">نوع الإعلان *</label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                required
              >
                <option value="CAR">سيارة كاملة</option>
                <option value="PART">قطعة غيار</option>
              </select>
            </div>

            {/* العنوان */}
            <div>
              <label className="block text-white mb-2 font-semibold">العنوان *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="مثال: فورد موستانج 2020 GT"
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                required
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="block text-white mb-2 font-semibold">الوصف *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="اكتب تفاصيل السيارة أو القطعة..."
                rows={5}
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                required
              />
            </div>

            {/* الماركة والموديل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2 font-semibold">الماركة *</label>
                <select
                  name="carBrand"
                  value={formData.carBrand}
                  onChange={handleBrandChange}
                  className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                  required
                >
                  <option value="">اختر الماركة</option>
                  {Object.keys(SPORT_CARS).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">الموديل *</label>
                <select
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleInputChange}
                  disabled={!formData.carBrand}
                  className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none disabled:opacity-50"
                  required
                >
                  <option value="">اختر الموديل</option>
                  {formData.carBrand && SPORT_CARS[formData.carBrand as keyof typeof SPORT_CARS]?.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* السعر والسنة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2 font-semibold">السعر (دينار كويتي) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="مثال: 15000"
                  className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                  required
                />
              </div>

              {formData.productType === 'CAR' && (
                <div>
                  <label className="block text-white mb-2 font-semibold">سنة الصنع</label>
                  <input
                    type="number"
                    name="carYear"
                    value={formData.carYear}
                    onChange={handleInputChange}
                    placeholder="مثال: 2020"
                    min="1980"
                    max="2026"
                    className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* معلومات السيارة */}
            {formData.productType === 'CAR' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 font-semibold">الكيلومترات</label>
                    <input
                      type="number"
                      name="kilometers"
                      value={formData.kilometers}
                      onChange={handleInputChange}
                      placeholder="مثال: 50000"
                      className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-semibold">اللون</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="مثال: أحمر"
                      className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white mb-2 font-semibold">ناقل الحركة</label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                    >
                      <option value="أوتوماتيك">أوتوماتيك</option>
                      <option value="يدوي">يدوي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-semibold">نوع الوقود</label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                    >
                      <option value="بنزين">بنزين</option>
                      <option value="ديزل">ديزل</option>
                      <option value="هجين">هجين</option>
                      <option value="كهربائي">كهربائي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-semibold">حجم المحرك</label>
                    <input
                      type="text"
                      name="engineSize"
                      value={formData.engineSize}
                      onChange={handleInputChange}
                      placeholder="مثال: V8 5.0L"
                      className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* الحالة */}
            <div>
              <label className="block text-white mb-2 font-semibold">الحالة</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
              >
                <option value="جديدة">جديدة</option>
                <option value="ممتازة">ممتازة</option>
                <option value="جيدة">جيدة</option>
                <option value="مستعملة">مستعملة</option>
              </select>
            </div>

            {/* معلومات الاتصال */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold text-lg mb-4">معلومات التواصل</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white mb-2 font-semibold">رقم الهاتف *</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="مثال: 96550000000"
                    className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">رقم الواتساب</label>
                  <input
                    type="tel"
                    name="contactWhatsapp"
                    value={formData.contactWhatsapp}
                    onChange={handleInputChange}
                    placeholder="مثال: 96550000000"
                    className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* طرق التواصل المفضلة */}
              <div>
                <label className="block text-white mb-3 font-semibold">طرق التواصل المفضلة *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center bg-black p-4 rounded-lg border border-gray-700 cursor-pointer hover:border-red-600 transition-all">
                    <input
                      type="checkbox"
                      name="preferredContact"
                      value="phone"
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4 text-red-600 bg-black border-gray-600 rounded focus:ring-red-500"
                    />
                    <div className="text-white">
                      <div className="font-semibold flex items-center">
                        📞 <span className="mr-2">مكالمة هاتفية</span>
                      </div>
                      <div className="text-sm text-gray-400">اتصال مباشر</div>
                    </div>
                  </label>

                  <label className="flex items-center bg-black p-4 rounded-lg border border-gray-700 cursor-pointer hover:border-green-600 transition-all">
                    <input
                      type="checkbox"
                      name="preferredContact"
                      value="whatsapp_call"
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4 text-green-600 bg-black border-gray-600 rounded focus:ring-green-500"
                    />
                    <div className="text-white">
                      <div className="font-semibold flex items-center">
                        📱 <span className="mr-2">مكالمة واتساب</span>
                      </div>
                      <div className="text-sm text-gray-400">مكالمة مجانية</div>
                    </div>
                  </label>

                  <label className="flex items-center bg-black p-4 rounded-lg border border-gray-700 cursor-pointer hover:border-green-600 transition-all">
                    <input
                      type="checkbox"
                      name="preferredContact"
                      value="whatsapp_message"
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4 text-green-600 bg-black border-gray-600 rounded focus:ring-green-500"
                    />
                    <div className="text-white">
                      <div className="font-semibold flex items-center">
                        💬 <span className="mr-2">رسالة واتساب</span>
                      </div>
                      <div className="text-sm text-gray-400">محادثة نصية</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* الصور */}
            <div>
              <label className="block text-white mb-2 font-semibold">الصور *</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:cursor-pointer hover:file:bg-red-700"
                required
              />
              <p className="text-gray-400 text-sm mt-2">يمكنك اختيار عدة صور</p>
              {formData.images.length > 0 && (
                <p className="text-green-500 mt-2">{formData.images.length} صورة محددة</p>
              )}
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all"
            >
              {loading ? 'جاري النشر...' : 'نشر الإعلان'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
