import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

const SERVICE_NAME = 'com.q8sportcar.app.auth';

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const type = await Keychain.getSupportedBiometryType();
    return type !== null;
  } catch {
    return false;
  }
}

export async function hasSavedCredentials(): Promise<boolean> {
  try {
    const result = await Keychain.getGenericPassword({ service: SERVICE_NAME });
    return result !== false;
  } catch {
    return false;
  }
}

export async function saveCredentials(email: string, password: string): Promise<boolean> {
  try {
    await Keychain.setGenericPassword(email, password, {
      service: SERVICE_NAME,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });
    return true;
  } catch {
    return false;
  }
}

export async function getCredentialsWithBiometric(): Promise<{ email: string; password: string } | null> {
  try {
    const result = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
      authenticationPrompt: {
        title: 'تسجيل الدخول',
        subtitle: 'استخدم Face ID للدخول السريع',
        cancel: 'إلغاء',
      },
    });
    if (result && result.username && result.password) {
      return { email: result.username, password: result.password };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearSavedCredentials(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
  } catch {
    // ignore
  }
}

export function getBiometricLabel(): string {
  if (Platform.OS === 'ios') return 'Face ID';
  return 'البصمة';
}
