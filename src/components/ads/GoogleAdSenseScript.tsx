'use client';

import Script from 'next/script';

interface GoogleAdSenseProps {
  publisherId: string;
}

export default function GoogleAdSenseScript({ publisherId }: GoogleAdSenseProps) {
  return (
    <>
      <Script
        id="google-adsense"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script
        id="google-adsense-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.adsbygoogle = window.adsbygoogle || [];
          `,
        }}
      />
    </>
  );
}