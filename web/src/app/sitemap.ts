import type { MetadataRoute } from 'next';

import { loadMarketData } from '@/lib/market-data';
import { absoluteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const market = await loadMarketData();
  const now = new Date();

  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/market'),
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: absoluteUrl('/sell'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/privacy-policy'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...market.carListings.map((item) => ({
      url: absoluteUrl(`/cars/${item.slug}`),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...market.partListings.map((item) => ({
      url: absoluteUrl(`/parts/${item.slug}`),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...market.wantedListings.map((item) => ({
      url: absoluteUrl(`/wanted/${item.slug}`),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    })),
    ...market.sellers.map((item) => ({
      url: absoluteUrl(`/sellers/${item.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}