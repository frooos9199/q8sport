import Link from 'next/link';
import { Car, Search, User } from 'lucide-react';
import AdvertisementBanner from '@/components/ui/AdvertisementBanner';
import UserActions from '@/components/UserActions';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 ml-2" />
              <h1 className="text-2xl font-bold text-gray-900">Q8 MAZAD SPORT</h1>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن قطع الغيار..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-gray-800"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-800" />
              </div>
            </div>
            
            {/* User Actions */}
            <UserActions />
          </div>
        </div>
      </header>

      {/* Advertisement Banner - يظهر فقط عند وجود إعلانات نشطة */}
      <AdvertisementBanner />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Q8 MAZAD SPORT
          </h2>
          <p className="text-xl mb-8 opacity-90">
            مزادات قطع غيار السيارات الرياضية الأمريكية في الكويت
          </p>
          <Link
            href="/auctions"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            تصفح المزادات
          </Link>
        </div>
      </section>

      {/* Top Sellers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">أفضل البائعين</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">بائع رقم {i}</h3>
                <p className="text-gray-800 mb-4">متخصص في قطع غيار السيارات الأمريكية</p>
                <div className="flex justify-center space-x-4 mb-4">
                  <span className="text-sm text-gray-800">⭐ 4.8</span>
                  <span className="text-sm text-gray-800">📦 150+ قطعة</span>
                </div>
                <Link
                  href={`/users/${i}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  عرض المتجر
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Car className="h-8 w-8 text-blue-400 ml-2" />
                <h3 className="text-2xl font-bold">Q8 MAZAD SPORT</h3>
              </div>
              <p className="text-gray-300">
                منصة مزادات قطع غيار السيارات الرياضية الأمريكية في الكويت
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/auctions" className="hover:text-white">المزادات</Link></li>
                <li><Link href="/users" className="hover:text-white">البائعون</Link></li>
                <li><Link href="/auth" className="hover:text-white">تسجيل الدخول</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">اتصل بنا</h4>
              <ul className="space-y-2 text-gray-300">
                <li>📧 info@q8mazadsport.com</li>
                <li>📱 واتساب: +965 1234 5678</li>
                <li>📍 الكويت</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Q8 MAZAD SPORT. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}