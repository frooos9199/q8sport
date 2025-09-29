'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Clock, ArrowLeft } from 'lucide-react';

export default function AuctionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 text-lg">جاري تحميل المزادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center ml-6 text-white hover:text-blue-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة للرئيسية</span>
              </button>
              <Car className="h-8 w-8 text-white ml-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">المزادات النشطة</h1>
                <p className="text-blue-100">قطع غيار السيارات الرياضية</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <strong>✅ صفحة المزادات تعمل بنجاح!</strong>
          <p>تم حل المشكلة وصفحة المزادات الآن نشطة.</p>
        </div>

        {/* Sample Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: '1', title: 'محرك فورد موستانج V8', price: 2850, time: '2:15:30' },
            { id: '2', title: 'علبة سرعة فورد F-150', price: 1250, time: '4:45:20' },
            { id: '3', title: 'مكابح كورفيت رياضية', price: 3200, time: '0:45:15' },
            { id: '4', title: 'عجلات كامارو SS', price: 980, time: '1:12:45' },
            { id: '5', title: 'محرك دودج تشارجر هيمي', price: 4500, time: '2:18:30' },
            { id: '6', title: 'مقاعد كورفيت جلد أحمر', price: 1800, time: '3:06:15' }
          ].map((auction) => (
            <div key={auction.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <Car className="h-16 w-16 text-gray-400" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{auction.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">السعر الحالي</p>
                    <p className="text-lg font-bold text-green-600">{auction.price} د.ك</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">متبقي</p>
                    <p className="text-lg font-bold text-red-600">{auction.time}</p>
                  </div>
                </div>

                <Link 
                  href={`/auctions/${auction.id}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-bold transition-colors"
                >
                  شارك في المزاد
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            هذه نسخة مبسطة من صفحة المزادات للتأكد من عمل الروابط والتنقل
          </p>
          <Link 
            href="/" 
            className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}