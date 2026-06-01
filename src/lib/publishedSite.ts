export const PUBLISHED_SITE_URL = 'https://www.q8sportcar.com';

export type PublishedListingKind = 'cars' | 'parts' | 'wanted';

export function getPublishedListingUrl(kind: PublishedListingKind, id: string) {
  const safeId = encodeURIComponent(String(id || '').trim());
  return `${PUBLISHED_SITE_URL}/${kind}/${safeId}`;
}
