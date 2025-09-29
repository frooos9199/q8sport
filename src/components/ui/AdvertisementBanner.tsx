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
}

interface AdvertisementBannerProps {
  className?: string;
}

const AdvertisementBanner = ({ className = '' }: AdvertisementBannerProps) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  // جلب الإعلانات من قاعدة البيانات
  useEffect(() => {
    const fetchAds = async () => {
      try {
        console.log('🔄 Fetching advertisements...');
        const response = await fetch('/api/advertisements');
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Fetched advertisements:', data);
          
          const activeAds = data.filter((ad: any) => ad.active);
          console.log('✅ Active advertisements:', activeAds);
          
          setAds(activeAds);
        } else {
          console.error('❌ Failed to fetch advertisements:', response.statusText);
        }
      } catch (error) {
        console.error('❌ Error fetching advertisements:', error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

    // تحديث الإعلانات كل 5 ثواني
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  console.log('🎯 Banner state:', { loading, isVisible, adsLength: ads.length, currentIndex });

  // عرض loading
  if (loading) {
    return (
      <div className="w-full bg-blue-100 text-blue-800 p-2 text-center">
        <span>⏳ جاري تحميل الإعلانات...</span>
      </div>
    );
  }

  // إخفاء البنر إذا لم توجد إعلانات أو تم إغلاقه
  if (!isVisible || ads.length === 0) {
    console.log('🚫 Advertisement banner hidden:', { isVisible, adsLength: ads.length });
    return null;
  }

  const currentAd = ads[currentIndex];
  console.log('📺 Displaying advertisement:', currentAd);

  return (
    <div className={`w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden shadow-lg animate-pulse-gradient ${className}`}>
      
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex items-center justify-between h-24 px-6">
        {/* صورة الإعلان */}
        {currentAd.imageUrl && (
          <div className="flex-shrink-0 mr-4">
            <img 
              src={currentAd.imageUrl} 
              alt={currentAd.title}
              className="h-16 w-16 object-cover rounded-lg shadow-md border-2 border-white/30"
              onError={(e) => {
                console.log('❌ Image failed to load:', currentAd.imageUrl);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', currentAd.imageUrl);
              }}
            />
          </div>
        )}
        
        {/* النص المتحرك */}
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            <span className="text-2xl font-bold mx-12 drop-shadow-lg">
              🎯 {currentAd.title} - {currentAd.description} 🎯
            </span>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="flex items-center space-x-6">
          {/* مؤشر الإعلانات */}
          {ads.length > 1 && (
            <div className="hidden md:flex items-center text-sm bg-black/30 px-4 py-2 rounded-full">
              <span>{currentIndex + 1} من {ads.length}</span>
            </div>
          )}

          {/* رابط العرض */}
          {currentAd.link && (
            <Link
              href={currentAd.link}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              عرض التفاصيل
            </Link>
          )}

          {/* زر الإغلاق */}
          <button
            onClick={() => setIsVisible(false)}
            className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
            aria-label="إغلاق الإعلان"
            title="إغلاق الإعلان"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* شريط التقدم */}
      {ads.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
          <div className={`h-full bg-white/40 transition-all duration-500 progress-bar-width`} />
        </div>
      )}
    </div>
  );
};

export default AdvertisementBanner;
