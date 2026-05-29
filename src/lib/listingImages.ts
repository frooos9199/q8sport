import { Platform } from 'react-native';
import { auth } from './firebase';
import { ref as storageRef } from '@react-native-firebase/storage';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import { storage } from './firebase';

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

export async function uploadListingMedia(path: string, listingId: string, items: ListingMediaItem[]) {
  const currentUser = auth.currentUser;

  if (!currentUser?.uid) {
    throw new Error('لازم تسجل دخول قبل رفع الصور');
  }

  const images: string[] = [];
  const imageThumbs: string[] = [];
  const imageMediums: string[] = [];

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

    await imageRef.putFile(normalizeUploadPath(imageUri));
    await mediumRef.putFile(normalizeUploadPath(mediumSource));
    await thumbRef.putFile(normalizeUploadPath(thumbSource));

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