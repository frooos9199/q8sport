import { ref as dbRef } from '@react-native-firebase/database';

import { db } from './firebase';
import { getDbSnapshot } from './firebaseDatabase';
import { BannerAd, BannerPlacement } from '../types';

export const bannerPlacementOptions: Array<{
  value: BannerPlacement;
  labelKey: 'bannerPlacementHome' | 'bannerPlacementCars' | 'bannerPlacementParts';
  descriptionKey: 'bannerPlacementHomeDesc' | 'bannerPlacementCarsDesc' | 'bannerPlacementPartsDesc';
}> = [
  { value: 'home', labelKey: 'bannerPlacementHome', descriptionKey: 'bannerPlacementHomeDesc' },
  { value: 'cars', labelKey: 'bannerPlacementCars', descriptionKey: 'bannerPlacementCarsDesc' },
  { value: 'parts', labelKey: 'bannerPlacementParts', descriptionKey: 'bannerPlacementPartsDesc' },
];

export function bannerHasPlacement(item: BannerAd, placement: BannerPlacement) {
  if (Array.isArray(item.placements) && item.placements.length > 0) {
    return item.placements.includes(placement);
  }

  return placement === 'home';
}

function sortBanners(items: BannerAd[]) {
  return [...items].sort((left, right) => {
    const leftOrder = typeof left.sortOrder === 'number' ? left.sortOrder : 0;
    const rightOrder = typeof right.sortOrder === 'number' ? right.sortOrder : 0;

    if (leftOrder !== rightOrder) {
      return rightOrder - leftOrder;
    }

    return Number(right.createdAt || 0) - Number(left.createdAt || 0);
  });
}

export async function fetchAllBanners() {
  const snap = await getDbSnapshot(dbRef(db, 'banners'), 'banners', { showAlert: false });
  const items: BannerAd[] = [];

  snap.forEach((child: any) => {
    items.push({ id: child.key, ...child.val() });
    return undefined;
  });

  return sortBanners(items);
}

export async function fetchActiveBanners(placement?: BannerPlacement) {
  const items = await fetchAllBanners();
  return items.filter(item => item.isActive && (item.thumbnailUrl || item.imageUrl) && (!placement || bannerHasPlacement(item, placement)));
}