'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car, ArrowLeft, Clock, Zap } from 'lucide-react';

export default function AuctionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center ml-6 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="mr-2">العودة للمزادات</span>
              </button>
              <Car className="h-8 w-8 text-blue-600 ml-2" />
              <h1 className="text-xl font-bold text-gray-900">تفاصيل المزاد</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                مزاد رياضي - معدات كرة القدم
              </h1>
              <div className="flex items-center text-gray-600 space-x-4 mb-4">
                <span>كرة القدم</span>
                <span>•</span>
                <span>جديد</span>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">الوصف</h3>
                <p className="text-gray-700 leading-relaxed">
                  معدات رياضية عالية الجودة مناسبة للاستخدام الاحترافي والهواة.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-red-600 ml-2" />
                  <span className="text-2xl font-bold text-red-600">2:15:30</span>
                </div>
                <p className="text-gray-600">ينتهي المزاد</p>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">السعر الحالي</span>
                  <span className="text-3xl font-bold text-green-600">250 د.ك</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">سعر البداية</span>
                  <span className="text-gray-700">100 د.ك</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600">عدد المزايدات</span>
                  <span className="text-gray-700">15</span>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center">
                  <Zap className="h-5 w-5 ml-2" />
                  شارك في المزاد
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}