import { getSiteUrl } from './runtime-config';

export const siteConfig = {
  name: 'Q8 Sport Market',
  shortName: 'Q8 Sport',
  description: 'منصة كويتية لبيع السيارات السبورت وقطع الغيار والمطلوبات المباشرة مع تواصل مباشر بين المعلن والمشتري.',
  domain: 'www.q8sportcar.com',
  url: getSiteUrl(),
  ogImage: '/favicon.ico',
  keywords: [
    'سيارات سبورت الكويت',
    'قطع غيار الكويت',
    'Q8 Sport Market',
    'سيارات للبيع الكويت',
    'مطلوب مكينة فورد',
    'رنجات AMG الكويت',
  ],
};

export function absoluteUrl(path = '/') {
  return `${siteConfig.url}${path}`;
}