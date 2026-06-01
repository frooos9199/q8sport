import { Platform } from 'react-native';
import { auth } from './firebase';
import { ref as storageRef } from '@react-native-firebase/storage';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import { storage } from './firebase';
import { t } from '../i18n';

const THUMBNAIL_SIZE = 480;
const THUMBNAIL_QUALITY = 65;
const MEDIUM_SIZE = 1280;
const MEDIUM_QUALITY = 75;

export type ListingMediaItem = {
  image: string;
  thumb?: string;
  medium?: string;
};

export type ListingWithPreviewImage = {
  thumbnailUrl?: string;
  mediumUrl?: string;
  imageUrl?: string;
  images?: string[];
  imageThumbs?: string[];
  imageMediums?: string[];
};

function extractStoragePathFromDownloadUrl(url: string): string | null {
  if (!url) return null;

  // gs://<bucket>/<fullPath>
  if (url.startsWith('gs://')) {
    const withoutScheme = url.slice('gs://'.length);
    const slash = withoutScheme.indexOf('/');
    if (slash === -1) return null;
    return withoutScheme.slice(slash + 1);
  }

  // https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encodedPath>?...
  const marker = '/o/';
  const markerIndex = url.indexOf(marker);
  if (markerIndex !== -1) {
    const rest = url.slice(markerIndex + marker.length);
    const end = rest.indexOf('?');
    const encodedPath = end === -1 ? rest : rest.slice(0, end);
    try {
      return decodeURIComponent(encodedPath);
    } catch {
      return encodedPath;
    }
  }

  // https://storage.googleapis.com/<bucket>/<fullPath>
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'storage.googleapis.com') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      // parts[0] is bucket
      if (parts.length >= 2) return parts.slice(1).join('/');
    }
  } catch {
    // ignore
  }

  return null;
}

export function collectListingMediaUrls(item?: ListingWithPreviewImage | null) {
  const urls = new Set<string>();
  const push = (value?: string | null) => {
    const trimmed = String(value || '').trim();
    if (trimmed) urls.add(trimmed);
  };

  push(item?.imageUrl);
  push(item?.mediumUrl);
  push(item?.thumbnailUrl);

  (item?.images || []).forEach(push);
  (item?.imageMediums || []).forEach(push);
  (item?.imageThumbs || []).forEach(push);

  return Array.from(urls);
}

export async function deleteListingMediaByUrls(urls: string[]) {
  const unique = Array.from(new Set((urls || []).map(u => String(u || '').trim()).filter(Boolean)));
  if (!unique.length) return;

  const deletions = unique.map(async (url) => {
    // Only delete Firebase Storage files. External URLs should be skipped.
    const path = extractStoragePathFromDownloadUrl(url);
    if (!path) return;
    try {
      await storageRef(storage, path).delete();
    } catch {
      // Best effort: ignore missing/permission/network errors.
    }
  });

  await Promise.allSettled(deletions);
}

export async function deleteRemovedListingMedia(prev?: ListingWithPreviewImage | null, next?: ListingWithPreviewImage | null) {
  const prevUrls = new Set(collectListingMediaUrls(prev));
  const nextUrls = new Set(collectListingMediaUrls(next));
  const toDelete: string[] = [];
  prevUrls.forEach((url) => {
    if (!nextUrls.has(url)) toDelete.push(url);
  });
  await deleteListingMediaByUrls(toDelete);
}

function normalizeUploadPath(uri: string) {
  return Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
}

async function createThumbnailPath(uri: string) {
  try {
    const resized = await ImageResizer.createResizedImage(
      uri,
      THUMBNAIL_SIZE,
      THUMBNAIL_SIZE,
      'JPEG',
      THUMBNAIL_QUALITY,
      0,
      undefined,
      false,
      { mode: 'contain', onlyScaleDown: true },
    );

    return resized.uri || resized.path || uri;
  } catch {
    return uri;
  }
}

async function createMediumPath(uri: string) {
  try {
    const resized = await ImageResizer.createResizedImage(
      uri,
      MEDIUM_SIZE,
      MEDIUM_SIZE,
      'JPEG',
      MEDIUM_QUALITY,
      0,
      undefined,
      false,
      { mode: 'contain', onlyScaleDown: true },
    );

    return resized.uri || resized.path || uri;
  } catch {
    return uri;
  }
}

export function getListingThumbnailUrl(item?: ListingWithPreviewImage | null) {
  return item?.thumbnailUrl || item?.imageThumbs?.[0] || undefined;
}

export function getListingMediumUrl(item?: ListingWithPreviewImage | null) {
  return item?.mediumUrl || item?.imageMediums?.[0] || item?.images?.[0] || item?.imageUrl || undefined;
}

export function getListingOriginalUrl(item?: ListingWithPreviewImage | null, index = 0) {
  return item?.images?.[index] || item?.imageUrl || item?.images?.[0] || undefined;
}

export function getListingPreviewImage(item?: ListingWithPreviewImage | null) {
  return getListingThumbnailUrl(item) || item?.images?.[0] || item?.imageUrl || undefined;
}

type UploadListingMediaOptions = {
  onProgress?: (percent: number) => void;
};

async function putFileWithProgress(
  fileRef: ReturnType<typeof storageRef>,
  localPath: string,
  onProgress?: (fraction: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const task = fileRef.putFile(localPath);
    let settled = false;

    const timeoutMs = 10 * 60 * 1000; // 10 minutes hard timeout to avoid hanging forever
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { task.cancel?.(); } catch {}
      try { unsubscribe?.(); } catch {}
      reject(new Error(t('uploadTimedOutMsg')));
    }, timeoutMs);

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      try { unsubscribe?.(); } catch {}
      fn();
    };

    const unsubscribe = task.on(
      'state_changed',
      (snapshot: any) => {
        if (settled) return;
        const total = Number(snapshot?.totalBytes || 0);
        const transferred = Number(snapshot?.bytesTransferred || 0);
        if (total > 0) onProgress?.(Math.max(0, Math.min(1, transferred / total)));
      },
      (error: any) => {
        finish(() => reject(error));
      },
      () => {
        finish(() => {
          onProgress?.(1);
          resolve();
        });
      },
    );
  });
}

export async function uploadListingMedia(path: string, listingId: string, items: ListingMediaItem[], options: UploadListingMediaOptions = {}) {
  const currentUser = auth.currentUser;

  if (!currentUser?.uid) {
    throw new Error(t('loginRequiredToUploadImagesMsg'));
  }

  const images: string[] = [];
  const imageThumbs: string[] = [];
  const imageMediums: string[] = [];

  const totalUnits = Math.max(1, items.length * 3);
  let completedUnits = 0;
  const emit = (fileFraction: number) => {
    const pct = Math.round(((completedUnits + fileFraction) / totalUnits) * 100);
    options.onProgress?.(Math.max(0, Math.min(100, pct)));
  };

  emit(0);

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const imageUri = item.image;

    if (/^https?:\/\//.test(imageUri)) {
      images.push(imageUri);
      const thumb = item.thumb || imageUri;
      const medium = item.medium || imageUri;
      imageThumbs.push(thumb);
      imageMediums.push(medium);
      continue;
    }

    const thumbSource = item.thumb || (await createThumbnailPath(imageUri));
    const mediumSource = item.medium || (await createMediumPath(imageUri));
    const fileBase = `${Date.now()}-${index}`;
    const imageRef = storageRef(storage, `${path}/${currentUser.uid}/${listingId}/${fileBase}.jpg`);
    const mediumRef = storageRef(storage, `${path}/${currentUser.uid}/${listingId}/${fileBase}-med.jpg`);
    const thumbRef = storageRef(storage, `${path}/${currentUser.uid}/${listingId}/${fileBase}-thumb.jpg`);

    await putFileWithProgress(imageRef, normalizeUploadPath(imageUri), (f) => emit(f));
    completedUnits += 1;
    emit(0);

    await putFileWithProgress(mediumRef, normalizeUploadPath(mediumSource), (f) => emit(f));
    completedUnits += 1;
    emit(0);

    await putFileWithProgress(thumbRef, normalizeUploadPath(thumbSource), (f) => emit(f));
    completedUnits += 1;
    emit(0);

    const [imageUrl, mediumUrl, thumbUrl] = await Promise.all([
      imageRef.getDownloadURL(),
      mediumRef.getDownloadURL(),
      thumbRef.getDownloadURL(),
    ]);

    images.push(imageUrl);
    imageMediums.push(mediumUrl);
    imageThumbs.push(thumbUrl);
  }

  return {
    images,
    imageThumbs,
    imageMediums,
    imageUrl: images[0] || '',
    mediumUrl: imageMediums[0] || '',
    thumbnailUrl: imageThumbs[0] || '',
  };
}