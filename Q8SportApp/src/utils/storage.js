import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from './logger';

const KEYS = {
  TOKEN: '@q8sport_token',
  USER: '@q8sport_user',
  BIOMETRIC_ENABLED: '@q8sport_biometric_enabled',
  BIOMETRIC_EMAIL: '@q8sport_biometric_email',
  BIOMETRIC_PASSWORD: '@q8sport_biometric_password',
};

export const StorageService = {
  // Token
  saveToken: async (token) => {
    try {
      await AsyncStorage.setItem(KEYS.TOKEN, token);
      return true;
    } catch (error) {
      Logger.error('Error saving token:', error);
      return false;
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.TOKEN);
    } catch (error) {
      Logger.error('Error getting token:', error);
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(KEYS.TOKEN);
      return true;
    } catch (error) {
      Logger.error('Error removing token:', error);
      return false;
    }
  },

  // User
  saveUser: async (user) => {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
      return true;
    } catch (error) {
      Logger.error('Error saving user:', error);
      return false;
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem(KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      Logger.error('Error getting user:', error);
      return null;
    }
  },

  removeUser: async () => {
    try {
      await AsyncStorage.removeItem(KEYS.USER);
      return true;
    } catch (error) {
      Logger.error('Error removing user:', error);
      return false;
    }
  },

  // Clear all
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
      return true;
    } catch (error) {
      Logger.error('Error clearing storage:', error);
      return false;
    }
  },

  // Biometric Authentication
  setBiometricEnabled: async (enabled) => {
    try {
      await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, enabled.toString());
      return true;
    } catch (error) {
      Logger.error('Error setting biometric enabled:', error);
      return false;
    }
  },

  isBiometricEnabled: async () => {
    try {
      const enabled = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      Logger.error('Error checking biometric enabled:', error);
      return false;
    }
  },

  // WARNING: This stores credentials in plain text - NOT SECURE
  // TODO: Replace with react-native-keychain for production
  // For now, this is a temporary solution for biometric auth
  saveBiometricCredentials: async (email, password) => {
    try {
      // Simple obfuscation (NOT encryption - still insecure)
      const obfuscatedEmail = Buffer.from(email).toString('base64');
      const obfuscatedPassword = Buffer.from(password).toString('base64');
      
      await AsyncStorage.setItem(KEYS.BIOMETRIC_EMAIL, obfuscatedEmail);
      await AsyncStorage.setItem(KEYS.BIOMETRIC_PASSWORD, obfuscatedPassword);
      return true;
    } catch (error) {
      Logger.error('Error saving biometric credentials:', error);
      return false;
    }
  },

  getBiometricCredentials: async () => {
    try {
      const obfuscatedEmail = await AsyncStorage.getItem(KEYS.BIOMETRIC_EMAIL);
      const obfuscatedPassword = await AsyncStorage.getItem(KEYS.BIOMETRIC_PASSWORD);
      
      if (obfuscatedEmail && obfuscatedPassword) {
        // Decode obfuscated credentials
        const email = Buffer.from(obfuscatedEmail, 'base64').toString('utf-8');
        const password = Buffer.from(obfuscatedPassword, 'base64').toString('utf-8');
        return { email, password };
      }
      return null;
    } catch (error) {
      Logger.error('Error getting biometric credentials:', error);
      return null;
    }
  },

  removeBiometricCredentials: async () => {
    try {
      await AsyncStorage.multiRemove([
        KEYS.BIOMETRIC_ENABLED,
        KEYS.BIOMETRIC_EMAIL,
        KEYS.BIOMETRIC_PASSWORD,
      ]);
      return true;
    } catch (error) {
      Logger.error('Error removing biometric credentials:', error);
      return false;
    }
  },
};
