import AsyncStorage from '@react-native-async-storage/async-storage';

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
      console.error('Error saving token:', error);
      return false;
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(KEYS.TOKEN);
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  },

  // User
  saveUser: async (user) => {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem(KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  removeUser: async () => {
    try {
      await AsyncStorage.removeItem(KEYS.USER);
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      return false;
    }
  },

  // Clear all
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  // Biometric Authentication
  setBiometricEnabled: async (enabled) => {
    try {
      await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, enabled.toString());
      return true;
    } catch (error) {
      console.error('Error setting biometric enabled:', error);
      return false;
    }
  },

  isBiometricEnabled: async () => {
    try {
      const enabled = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled:', error);
      return false;
    }
  },

  saveBiometricCredentials: async (email, password) => {
    try {
      await AsyncStorage.setItem(KEYS.BIOMETRIC_EMAIL, email);
      await AsyncStorage.setItem(KEYS.BIOMETRIC_PASSWORD, password);
      return true;
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
      return false;
    }
  },

  getBiometricCredentials: async () => {
    try {
      const email = await AsyncStorage.getItem(KEYS.BIOMETRIC_EMAIL);
      const password = await AsyncStorage.getItem(KEYS.BIOMETRIC_PASSWORD);
      
      if (email && password) {
        return { email, password };
      }
      return null;
    } catch (error) {
      console.error('Error getting biometric credentials:', error);
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
      console.error('Error removing biometric credentials:', error);
      return false;
    }
  },
};
