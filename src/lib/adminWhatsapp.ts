import { Alert, Linking } from 'react-native';
import { ref as dbRef } from '@react-native-firebase/database';

import { db } from './firebase';
import { getDbSnapshot } from './firebaseDatabase';
import { toWaMeDigits } from './gccPhone';
import { t } from '../i18n';

let cachedAdminWhatsapp = '';

function onlyDigits(value: unknown) {
  return String(value || '').replace(/\D+/g, '');
}

async function resolveAdminWhatsappDigits(): Promise<string> {
  if (cachedAdminWhatsapp) return cachedAdminWhatsapp;

  try {
    const snap = await getDbSnapshot(dbRef(db, 'users'), 'users', { showAlert: false });
    const value = (snap.val() || {}) as Record<string, any>;

    let fallbackAdmin = '';
    for (const userValue of Object.values(value)) {
      const digits = onlyDigits(userValue?.whatsapp || userValue?.phone);
      if (!digits) continue;

      if (userValue?.isSuperAdmin === true) {
        cachedAdminWhatsapp = digits;
        return digits;
      }

      if (!fallbackAdmin && userValue?.isAdmin === true) {
        fallbackAdmin = digits;
      }
    }

    cachedAdminWhatsapp = fallbackAdmin;
    return fallbackAdmin;
  } catch {
    return '';
  }
}

export async function openAdminWhatsapp(message?: string): Promise<void> {
  const adminDigits = await resolveAdminWhatsappDigits();
  if (!adminDigits) {
    Alert.alert(t('warningTitle'), t('noWhatsappNumberMsg'));
    return;
  }

  const waDigits = toWaMeDigits(adminDigits);
  const text = (message || '').trim();
  const url = text
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${waDigits}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(t('warningTitle'), t('openAdFailedMsg'));
  }
}
