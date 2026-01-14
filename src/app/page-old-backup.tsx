import Link from 'next/link';
import { Car, Search, User, Eye, Heart } from 'lucide-react';
import UserActions from '@/components/UserActions';
import ProductsList from '@/components/ProductsList';
import { BannerAd, SidebarAd, InArticleAd } from '@/components/ads/GoogleAds';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 gap-4">
            {/* Logo */}
            <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
              <div className="bg-white/20 rounded-full p-2 ml-3">
                <Car className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="text-center sm:text-right">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">Q8 SPORT</h1>
                <p className="text-gray-200 text-xs sm:text-sm">سيارات رياضية وقطع غيار</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-full sm:max-w-2xl w-full sm:mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن سيارات أو قطع غيار..."
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-10 sm:pr-12 border-0 rounded-full focus:ring-4 focus:ring-gray-300 focus:outline-none font-bold text-gray-900 text-sm sm:text-lg shadow-lg bg-white/95 backdrop-blur-sm placeholder-gray-700"
                />
                <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-gray-600 rounded-full p-1.5 sm:p-2">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
            </div>
            
            {/* User Actions */}
            <div className="bg-white/10 rounded-full p-2 w-full sm:w-auto flex justify-center">
              <UserActions />
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="border-t border-gray-600/50 bg-gray-700/50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <nav className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 py-3 sm:py-4">
              <Link href="/" className="text-white hover:text-gray-200 font-medium transition-colors px-3 sm:px-4 py-2 rounded-full hover:bg-white/10 text-sm sm:text-base">
                🏠 الرئيسية
              </Link>
              <Link href="/users" className="text-white hover:text-gray-200 font-medium transition-colors px-3 sm:px-4 py-2 rounded-full hover:bg-white/10 text-sm sm:text-base">
                🏎️ السيارات
              </Link>
              <Link href="/users" className="text-white hover:text-gray-200 font-medium transition-colors px-3 sm:px-4 py-2 rounded-full hover:bg-white/10 text-sm sm:text-base">
                🔧 قطع الغيار
              </Link>
              <Link href="/users" className="text-white hover:text-gray-200 font-medium transition-colors px-3 sm:px-4 py-2 rounded-full hover:bg-white/10 text-sm sm:text-base">
                👥 البائعون
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Top Banner Ad */}
      <BannerAd 
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER || "1234567890"}
        className="bg-gray-100 border-y border-gray-200" 
      />

      {/* Advertisement Banner - محذوف مؤقتاً */}
      {/* <AdvertisementBanner /> */}

      {/* Hero Banner - محذوف مؤقتاً */}
      {/* <HeroBanner /> */}

      {/* Featured Cars & Parts Section */}سيارات وقطع غيار مميزة للبيع
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">المزادات النشطة والقطع المميزة</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Ford Mustang Parts */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 sm:h-48 bg-red-100 flex items-center justify-center relative">
                <Car className="h-12 w-12 sm:h-16 sm:w-16 text-red-600" />
                {/* شعار صاحب المزاد */}
                <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1.5 sm:p-2 shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">AS</span>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                {/* معلومات صاحب المزاد */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">قطع فورد موستانج</h3>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">بائع:</p>
                    <p className="text-xs font-bold text-red-600">أحمد الصالح</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-2 font-medium text-sm sm:text-base">محرك V8 - موديل 2020</p>
                <p className="text-lg sm:text-xl text-green-700 font-bold mb-3 sm:mb-4">💰 1,850 د.ك</p>
                <Link href="/auctions/1" className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-center px-4 py-2.5 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md text-sm sm:text-base">
                  اتصل بالبائع
                </Link>
              </div>
            </div>

            {/* F-150 Parts */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 sm:h-48 bg-blue-100 flex items-center justify-center relative">
                <Car className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
                {/* شعار صاحب المزاد */}
                <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1.5 sm:p-2 shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">MK</span>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                {/* معلومات صاحب المزاد */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">قطع فورد F-150</h3>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">بائع:</p>
                    <p className="text-xs font-bold text-blue-600">محمد الكندري</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-2 font-medium text-sm sm:text-base">علبة السرعة - موديل 2019</p>
                <p className="text-lg sm:text-xl text-green-700 font-bold mb-3 sm:mb-4">💰 1,250 د.ك</p>
                <Link href="/auctions/2" className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-center px-4 py-2.5 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md text-sm sm:text-base">
                  اتصل بالبائع
                </Link>
              </div>
            </div>

            {/* Corvette Parts */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 sm:h-48 bg-yellow-100 flex items-center justify-center relative">
                <Car className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-600" />
                {/* شعار صاحب المزاد */}
                <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1.5 sm:p-2 shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">FA</span>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                {/* معلومات صاحب المزاد */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">قطع شيفروليت كورفيت</h3>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">بائع:</p>
                    <p className="text-xs font-bold text-yellow-600">فهد العجمي</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-2 font-medium text-sm sm:text-base">مكابح رياضية - موديل 2021</p>
                <p className="text-lg sm:text-xl text-green-700 font-bold mb-3 sm:mb-4">💰 850 د.ك</p>
                <Link href="/auctions/3" className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-center px-4 py-2.5 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md text-sm sm:text-base">
                  اتصل بالبائع
                </Link>
              </div>
            </div>

            {/* Camaro Parts */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 sm:h-48 bg-orange-100 flex items-center justify-center relative">
                <Car className="h-12 w-12 sm:h-16 sm:w-16 text-orange-600" />
                {/* شعار صاحب المزاد */}
                <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1.5 sm:p-2 shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">SA</span>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                {/* معلومات صاحب المزاد */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">قطع شيفروليت كامارو</h3>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">بائع:</p>
                    <p className="text-xs font-bold text-orange-600">سالم العتيبي</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-2 font-medium text-sm sm:text-base">عجلات رياضية - موديل 2020</p>
                <p className="text-lg sm:text-xl text-green-700 font-bold mb-3 sm:mb-4">💰 950 د.ك</p>
                <Link href="/auctions/4" className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-center px-4 py-2.5 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md text-sm sm:text-base">
                  اتصل بالبائع
                </Link>
              </div>
            </div>
          </div>

          {/* In-Article Ad بين المنتجات */}
          <InArticleAd 
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE || "0987654321"}
            className="my-8"
          />

          {/* Additional Featured Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
            {[
              { id: 5, title: "محرك دودج تشارجر", desc: "هيمي V8 - 2018", status: "💎 مزاد مميز", color: "text-purple-800", seller: "ياسر المطيري", initials: "YM", bgColor: "bg-purple-500" },
              { id: 6, title: "ناقل حركة فورد", desc: "أوتوماتيك 10 سرعات", status: "🕐 يبدأ غداً", color: "text-gray-800", seller: "خالد الرشيد", initials: "KR", bgColor: "bg-gray-500" },
              { id: 7, title: "مقاعد كورفيت", desc: "جلد أحمر أصلي", status: "💰 بدء من 200 د.ك", color: "text-green-800", seller: "عبدالله النصار", initials: "AN", bgColor: "bg-green-500" },
              { id: 8, title: "عجلات كامارو SS", desc: "20 بوصة رياضية", status: "🔥 3 مشتركين", color: "text-orange-800", seller: "بدر الحربي", initials: "BH", bgColor: "bg-red-500" }
            ].map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center relative">
                  <Car className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600" />
                  {/* شعار صاحب المزاد */}
                  <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1.5 sm:p-2 shadow-md">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${item.bgColor} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs sm:text-sm">{item.initials}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  {/* معلومات صاحب المزاد */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900">{item.title}</h3>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">بائع:</p>
                      <p className={`text-xs font-bold ${item.color}`}>{item.seller}</p>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-2 font-medium text-sm sm:text-base">{item.desc}</p>
                  <p className={`text-xs sm:text-sm font-bold mb-3 sm:mb-4 ${item.color}`}>{item.status}</p>
                  <Link href={`/auctions/${item.id}`} className="block w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-center px-4 py-2.5 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md text-sm sm:text-base">
                    شارك في المزاد
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
            آخر المنتجات المضافة
          </h3>
          <ProductsList />
        </div>
      </section>

      {/* Bottom Banner Ad */}
      <BannerAd 
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || "1111222233"}
        className="bg-white border-y border-gray-200"
      />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <Car className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 ml-2" />
                <h3 className="text-xl sm:text-2xl font-bold">Q8 SPORT</h3>
              </div>
              <p className="text-gray-200 font-medium text-sm sm:text-base">
                منصة بيع السيارات الرياضية الأمريكية وقطع الغيار الأصلية في الكويت
              </p>
            </div>
            
            <div className="text-center sm:text-right">
              <h4 className="font-bold mb-4 text-white text-base sm:text-lg">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-200 font-medium text-sm sm:text-base">
                <li><Link href="/" className="hover:text-white transition-colors">السيارات</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">قطع الغيار</Link></li>
                <li><Link href="/users" className="hover:text-white transition-colors">البائعون</Link></li>
                <li><Link href="/auth" className="hover:text-white transition-colors">تسجيل الدخول</Link></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-right">
              <h4 className="font-bold mb-4 text-white text-base sm:text-lg">اتصل بنا</h4>
              <ul className="space-y-2 text-gray-200 font-medium text-sm sm:text-base">
                <li>📱 واتساب: <a href="https://wa.me/96550540999" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">+965 5054 0999</a></li>
                <li>📍 الكويت</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-200 font-medium text-sm sm:text-base">
            <p>&copy; 2026 Q8 SPORT. جميع الحقوق محفوظة.</p>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-gray-400 text-xs sm:text-sm">
                تطوير وتصميم: <a href="https://www.q8nexdev.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Q8NexDev</a>
                {' '} | 📞 <a href="tel:+96550540999" className="hover:text-white transition-colors">+965 5054 0999</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
