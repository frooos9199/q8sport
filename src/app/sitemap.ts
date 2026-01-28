import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.q8sportcar.com';

  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, updatedAt: true },
  });

  const auctions = await prisma.auction.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, updatedAt: true },
  });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const auctionUrls = auctions.map((auction) => ({
    url: `${baseUrl}/auctions/${auction.id}`,
    lastModified: auction.updatedAt,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auctions`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...productUrls,
    ...auctionUrls,
  ];
}
