import FastImage from 'react-native-fast-image';

export function prefetchAdImages(images: Array<string | null | undefined>, count = 10) {
  const urls = images
    .map(url => (typeof url === 'string' ? url.trim() : ''))
    .filter(url => Boolean(url) && /^https?:\/\//i.test(url));

  if (!urls.length) return;

  const uniqueUrls: string[] = [];
  for (const url of urls) {
    if (uniqueUrls.includes(url)) continue;
    uniqueUrls.push(url);
    if (uniqueUrls.length >= count) break;
  }

  if (!uniqueUrls.length) return;

  FastImage.preload(
    uniqueUrls.map(uri => ({
      uri,
      cache: FastImage.cacheControl.immutable,
      priority: FastImage.priority.high,
    }))
  );
}
