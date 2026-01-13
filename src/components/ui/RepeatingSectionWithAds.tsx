'use client';

import React from 'react';
import GlobalAdvertisementBanner from './GlobalAdvertisementBanner';

interface RepeatingSectionProps {
  children: React.ReactNode[];
  sectionGap?: number; // كل كم عنصر يظهر الإعلان
  sectionClassName?: string;
}

const RepeatingSectionWithAds = ({ 
  children, 
  sectionGap = 4, 
  sectionClassName = "mb-8" 
}: RepeatingSectionProps) => {
  const renderWithAds = () => {
    const elements = [];
    
    for (let i = 0; i < children.length; i++) {
      // إضافة العنصر الحالي
      elements.push(
        <div key={`section-${i}`} className={sectionClassName}>
          {children[i]}
        </div>
      );
      
      // إضافة الإعلان بعد كل sectionGap عناصر
      if ((i + 1) % sectionGap === 0 && i !== children.length - 1) {
        elements.push(
          <div key={`ad-${i}`} className="mb-8">
            <GlobalAdvertisementBanner className="rounded-lg my-4" />
          </div>
        );
      }
    }
    
    return elements;
  };

  return (
    <div className="w-full">
      {renderWithAds()}
    </div>
  );
};

export default RepeatingSectionWithAds;