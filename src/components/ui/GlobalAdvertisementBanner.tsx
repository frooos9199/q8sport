'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

interface GlobalAdvertisementBannerProps {
  className?: string;
  showEvery?: number; // كل كم عنصر يظهر البنر
}

const GlobalAdvertisementBanner = ({ className = '', showEvery = 4 }: GlobalAdvertisementBannerProps) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  // جلب الإعلانات النشطة حسب التاريخ
  useEffect(() => {
    const fetchActiveAds = async () => {
      try {
        const response = await fetch('/api/advertisements/active');
        
        if (response.ok) {
          const data = await response.json();
          
          // فلترة الإعلانات حسب التاريخ
          const now = new Date();
          const validAds = data.filter((ad: Advertisement) => {
            if (!ad.active) return false;
            
            // التحقق من تاريخ البداية
            if (ad.startDate) {
              const startDate = new Date(ad.startDate);
              if (now < startDate) return false;
            }
            
            // التحقق من تاريخ الانتهاء
            if (ad.endDate) {
              const endDate = new Date(ad.endDate);
              if (now > endDate) return false;
            }
            
            return true;
          });
          
          setAds(validAds);
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveAds();
    
    // إعادة التحقق كل دقيقة لتحديث الإعلانات المنتهية
    const interval = setInterval(fetchActiveAds, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // التنقل التلقائي كل 6 ثوان
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  // إخفاء البنر إذا لم توجد إعلانات أو تم إغلاقه
  if (!isVisible || ads.length === 0 || loading) {
    return null;
  }

  const currentAd = ads[currentIndex];

  return (
    <div className={`w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden shadow-lg ${className}`}>
      {/* صورة الخلفية إذا كانت متوفرة */}
      {currentAd.imageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 bg-repeat"
          style={{
            backgroundImage: `url(${currentAd.imageUrl})`
          }}
        />
      )}
      
      {/* المحتوى */}
      <div className="relative z-10 flex items-center justify-between h-20 px-6">
        {/* النص المتحرك */}
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            <span className="text-xl font-bold mx-8 drop-shadow-lg">
              🎯 {currentAd.title} - {currentAd.description} 🎯
            </span>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="flex items-center space-x-4">
          {/* مؤشر الإعلانات */}
          {ads.length > 1 && (
            <div className="hidden md:flex items-center text-sm bg-black/20 px-3 py-1 rounded-full">
              <span>{currentIndex + 1} من {ads.length}</span>
            </div>
          )}

          {/* رابط العرض */}
          {currentAd.link && (
            <Link
              href={currentAd.link}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              عرض التفاصيل
            </Link>
          )}

          {/* زر الإغلاق */}
          <button
            onClick={() => setIsVisible(false)}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            aria-label="إغلاق الإعلان"
            title="إغلاق الإعلان"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div 
          className="h-full bg-white/40 transition-all duration-300 progress-bar"
          data-width={`${((currentIndex + 1) / ads.length) * 100}%`}
        />
      </div>
    </div>
  );
};

export default GlobalAdvertisementBanner;