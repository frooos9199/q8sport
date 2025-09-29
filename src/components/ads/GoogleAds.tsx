'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdConfig {
  client?: string;
  slot: string;
  className?: string;
}

// Banner Ad - أعلى وأسفل الصفحات
export function BannerAd({ 
  client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || "ca-pub-XXXXXXXXXXXXXXXX", 
  slot, 
  className = "" 
}: AdConfig) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading Banner Ad:', error);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <ins
        className="adsbygoogle block w-full max-w-4xl h-24"
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Sidebar Ad - في الشريط الجانبي
export function SidebarAd({ 
  client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || "ca-pub-XXXXXXXXXXXXXXXX", 
  slot, 
  className = "" 
}: AdConfig) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading Sidebar Ad:', error);
    }
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <ins
        className="adsbygoogle block w-full h-96"
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// In-Article Ad - بين المحتوى
export function InArticleAd({ 
  client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || "ca-pub-XXXXXXXXXXXXXXXX", 
  slot, 
  className = "" 
}: AdConfig) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading In-Article Ad:', error);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center my-6 ${className}`}>
      <ins
        className="adsbygoogle block w-full max-w-2xl h-32"
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout="in-article"
      />
    </div>
  );
}

// Square Ad - مربع صغير
export function SquareAd({ 
  client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || "ca-pub-XXXXXXXXXXXXXXXX", 
  slot, 
  className = "" 
}: AdConfig) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading Square Ad:', error);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <ins
        className="adsbygoogle block w-80 h-80"
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
      />
    </div>
  );
}