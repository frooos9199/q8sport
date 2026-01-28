import { DefaultSeoProps } from 'next-seo';

export const SEO_CONFIG: DefaultSeoProps = {
  titleTemplate: '%s | Q8 Sport Car',
  defaultTitle: 'Q8 Sport Car - مزادات قطع غيار السيارات الأمريكية',
  description: 'منصة مزادات متخصصة لقطع غيار السيارات الأمريكية في الكويت - Ford Mustang، F-150، Chevrolet Corvette، Camaro',
  canonical: 'https://www.q8sportcar.com',
  openGraph: {
    type: 'website',
    locale: 'ar_KW',
    url: 'https://www.q8sportcar.com',
    siteName: 'Q8 Sport Car',
    title: 'Q8 Sport Car - مزادات قطع غيار السيارات الأمريكية',
    description: 'منصة مزادات متخصصة لقطع غيار السيارات الأمريكية في الكويت',
    images: [
      {
        url: 'https://www.q8sportcar.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Q8 Sport Car',
      },
    ],
  },
  twitter: {
    handle: '@q8sportcar',
    site: '@q8sportcar',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'قطع غيار, سيارات أمريكية, مزادات, الكويت, Ford, Chevrolet, Mustang, Corvette',
    },
  ],
};
