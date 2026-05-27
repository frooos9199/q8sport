import { Platform } from 'react-native';
import { auth } from './firebase';
import { ref as storageRef } from '@react-native-firebase/storage';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import { storage } from './firebase';

const THUMBNAIL_SIZE = 480;
const THUMBNAIL_QUALITY = 65;

export type ListingMediaItem = {
  image: string;
  thumb?: string;
};

export type ListingWithPreviewImage = {
  images?: string[];
  imageThumbs?: string[];
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

export function getListingPreviewImage(item?: ListingWithPreviewImage | null) {
  return item?.imageThumbs?.[0] || item?.images?.[0] || undefined;
}

export async function uploadListingMedia(path: string, listingId: string, items: ListingMediaItem[]) {
  const currentUser = auth.currentUser;

  if (!currentUser?.uid) {
    throw new Error('لازم تسجل دخول قبل رفع الصور');
  }

  const images: string[] = [];
  const imageThumbs: string[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const imageUri = item.image;

    if (/^https?:\/\//.test(imageUri)) {
      images.push(imageUri);
      imageThumbs.push(item.thumb || imageUri);
      continue;
    }

    const thumbSource = item.thumb || (await createThumbnailPath(imageUri));
    const fileBase = `${Date.now()}-${index}`;
    const imageRef = storageRef(storage, `${path}/${currentUser.uid}/${listingId}/${fileBase}.jpg`);
    const thumbRef = storageRef(storage, `${path}/${currentUser.uid}/${listingId}/${fileBase}-thumb.jpg`);

    await imageRef.putFile(normalizeUploadPath(imageUri));
    await thumbRef.putFile(normalizeUploadPath(thumbSource));

    const [imageUrl, thumbUrl] = await Promise.all([imageRef.getDownloadURL(), thumbRef.getDownloadURL()]);
    images.push(imageUrl);
    imageThumbs.push(thumbUrl);
  }

  return { images, imageThumbs };
}