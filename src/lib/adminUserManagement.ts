import { ref as dbRef, update } from '@react-native-firebase/database';

import { db } from './firebase';
import { getDbSnapshot } from './firebaseDatabase';
import { collectListingMediaUrls, deleteListingMediaByUrls } from './listingImages';
import { User } from '../types';

export const DELETED_ACCOUNT_NAME_SENTINEL = '__deleted_account__';

export async function deleteUserAccountFromMarketplace(targetUser: Pick<User, 'uid' | 'email'>) {
  const [carsSnap, partsSnap, requestsSnap] = await Promise.all([
    getDbSnapshot(dbRef(db, 'cars'), 'cars', { showAlert: false }),
    getDbSnapshot(dbRef(db, 'parts'), 'parts', { showAlert: false }),
    getDbSnapshot(dbRef(db, 'requests'), 'requests', { showAlert: false }),
  ]);

  const updates: Record<string, any> = {};
  const mediaUrls = new Set<string>();

  carsSnap.forEach((child: any) => {
    if (child.val()?.userId === targetUser.uid) {
      collectListingMediaUrls(child.val()).forEach(url => mediaUrls.add(url));
      updates[`cars/${child.key}`] = null;
    }
    return undefined;
  });

  partsSnap.forEach((child: any) => {
    if (child.val()?.userId === targetUser.uid) {
      collectListingMediaUrls(child.val()).forEach(url => mediaUrls.add(url));
      updates[`parts/${child.key}`] = null;
    }
    return undefined;
  });

  requestsSnap.forEach((child: any) => {
    if (child.val()?.userId === targetUser.uid) {
      collectListingMediaUrls(child.val()).forEach(url => mediaUrls.add(url));
      updates[`requests/${child.key}`] = null;
    }
    return undefined;
  });

  updates[`users/${targetUser.uid}`] = {
    uid: targetUser.uid,
    email: targetUser.email || '',
    name: DELETED_ACCOUNT_NAME_SENTINEL,
    phone: '',
    whatsapp: '',
    isAdmin: false,
    isSuperAdmin: false,
    disabled: true,
    deletedAt: Date.now(),
    updatedAt: Date.now(),
  };

  await update(dbRef(db), updates);

  await deleteListingMediaByUrls(Array.from(mediaUrls));
}