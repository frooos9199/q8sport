import { Alert } from 'react-native';
import { get } from '@react-native-firebase/database';

import { firebaseDebugInfo } from './firebase';
import { t } from '../i18n';

let hasShownRealtimeDatabaseAlert = false;

function describeError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error || 'unknown-error');
}

function classifyRealtimeDatabaseError(error: unknown) {
  const technicalMessage = describeError(error).toLowerCase();

  if (technicalMessage.includes('permission_denied') || technicalMessage.includes('permission denied') || technicalMessage.includes('denied permission')) {
    return t('realtimeDbPermissionDeniedMsg');
  }

  if (technicalMessage.includes('network') || technicalMessage.includes('timeout') || technicalMessage.includes('unavailable')) {
    return t('realtimeDbNetworkMsg');
  }

  return t('realtimeDbGenericMsg');
}

export function buildRealtimeDatabaseErrorMessage(path: string, error: unknown) {
  const userMessage = classifyRealtimeDatabaseError(error);
  const technicalMessage = describeError(error);
  const databaseUrlHint = firebaseDebugInfo.effectiveDatabaseURL ? ` [path=${path}] [db=${firebaseDebugInfo.effectiveDatabaseURL}]` : ` [path=${path}]`;

  return `${userMessage}${databaseUrlHint} (${technicalMessage})`;
}

export function reportRealtimeDatabaseError(path: string, error: unknown, showAlert = true) {
  const message = buildRealtimeDatabaseErrorMessage(path, error);
  const userMessage = classifyRealtimeDatabaseError(error);

  // eslint-disable-next-line no-console
  console.warn('[firebase-db]', message, error);

  if (showAlert && !hasShownRealtimeDatabaseAlert) {
    hasShownRealtimeDatabaseAlert = true;
    Alert.alert(t('realtimeDbErrorTitle'), userMessage);
  }

  return message;
}

export async function getDbSnapshot(target: any, path: string, options?: { showAlert?: boolean }) {
  try {
    return await get(target);
  } catch (error) {
    const message = reportRealtimeDatabaseError(path, error, options?.showAlert !== false);
    throw new Error(message);
  }
}