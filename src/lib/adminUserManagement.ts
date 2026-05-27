import { ref as dbRef, update } from '@react-native-firebase/database';

import { db } from './firebase';
import { getDbSnapshot } from './firebaseDatabase';
import { User } from '../types';

export async function deleteUserAccountFromMarketplace(targetUser: Pick<User, 'uid' | 'email'>) {
  const [carsSnap, partsSnap, requestsSnap] = await Promise.all([
    getDbSnapshot(dbRef(db, 'cars'), 'cars', { showAlert: false }),
    getDbSnapshot(dbRef(db, 'parts'), 'parts', { showAlert: false }),
    getDbSnapshot(dbRef(db, 'requests'), 'requests', { showAlert: false }),
  ]);

  const updates: Record<string, any> = {};

  carsSnap.forEach((child: any) => {
    if (child.val()?.userId === targetUser.uid) {
      updates[`cars/${child.key}`] = null;
    }
    return undefined;
  });

  partsSnap.forEach((child: any) => {
    if (child.val()?.userId === targetUser.uid) {
      updates[`parts/${child.key}`] = null;
    }
    return undefined;
  });

  requestsSnap.forEach((child: any) => {
    if (child.val()?.userId === targetUser.uid) {
      updates[`requests/${child.key}`] = null;
    }
    return undefined;
  });

  updates[`users/${targetUser.uid}`] = {
    uid: targetUser.uid,
    email: targetUser.email || '',
    name: 'حساب محذوف',
    phone: '',
    whatsapp: '',
    isAdmin: false,
    isSuperAdmin: false,
    disabled: true,
    deletedAt: Date.now(),
    updatedAt: Date.now(),
  };

  await update(dbRef(db), updates);
}