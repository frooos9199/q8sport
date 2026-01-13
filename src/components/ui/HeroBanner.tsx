'use client';

import React from 'react';
import Link from 'next/link';

const HeroBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* العنوان الرئيسي */}
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          مزادات قطع الغيار الرياضية
        </h1>
        
        {/* الوصف */}
        <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
          اكتشف أفضل قطع الغيار للسيارات الرياضية الأمريكية في الكويت
          <br />
          فورد موستانج • F-150 • شفروليت كورفيت • كامارو
        </p>
        
        {/* أزرار العمل */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/auctions" 
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            🔨 تصفح المزادات
          </Link>
          <Link 
            href="/users" 
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            👥 البائعون
          </Link>
        </div>
        
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 text-center">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">500+</div>
            <div className="text-blue-200 text-sm">قطعة غيار</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">200+</div>
            <div className="text-blue-200 text-sm">مزاد نشط</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">150+</div>
            <div className="text-blue-200 text-sm">بائع معتمد</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">100%</div>
            <div className="text-blue-200 text-sm">ضمان الجودة</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;