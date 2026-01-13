'use client';

import { useEffect } from 'react';

interface GoogleAdProps {
  client: string;
  slot: string;
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
  format?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function GoogleAd({
  client = "ca-pub-XXXXXXXXXXXXXXXX", // سيتم تحديثه لاحقاً
  slot,
  style = { display: 'block' },
  className = "",
  responsive = true,
  format = "auto"
}: GoogleAdProps) {

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading Google Ad:', error);
    }
  }, []);

  const inlineStyle = {
    display: 'block',
    ...style
  };

  return (
    <div className={`google-ad-container ${className}`}>
      <ins
        className="adsbygoogle block w-full"
        style={inlineStyle}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={responsive ? format : undefined}
        data-full-width-responsive={responsive ? "true" : undefined}
      />
    </div>
  );
}