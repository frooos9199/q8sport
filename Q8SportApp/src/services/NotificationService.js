import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  // Get messaging instance
  getMessaging() {
    return messaging();
  }

  async requestPermission() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await this.getMessaging().requestPermission();
        const { AuthorizationStatus } = messaging;
        return authStatus === AuthorizationStatus.AUTHORIZED ||
               authStatus === AuthorizationStatus.PROVISIONAL;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  async getToken() {
    try {
      const token = await this.getMessaging().getToken();
      if (token) {
        await AsyncStorage.setItem('fcm_token', token);
      }
      return token;
    } catch (error) {
      console.log('Get token error (normal in simulator):', error.message);
      return null;
    }
  }

  async initialize() {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.log('Notification permission denied');
      return null;
    }

    const token = await this.getToken();
    
    // Token refresh listener
    const unsubscribeTokenRefresh = this.getMessaging().onTokenRefresh(async (newToken) => {
      await AsyncStorage.setItem('fcm_token', newToken);
    });

    return token;
  }

  onMessage(callback) {
    return this.getMessaging().onMessage(async (remoteMessage) => {
      callback(remoteMessage);
    });
  }

  onNotificationOpenedApp(callback) {
    return this.getMessaging().onNotificationOpenedApp((remoteMessage) => {
      callback(remoteMessage);
    });
  }

  async getInitialNotification() {
    return await this.getMessaging().getInitialNotification();
  }

  setBackgroundMessageHandler(handler) {
    this.getMessaging().setBackgroundMessageHandler(handler);
  }
}

export default new NotificationService();
