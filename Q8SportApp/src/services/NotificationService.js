import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  async requestPermission() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
               authStatus === messaging.AuthorizationStatus.PROVISIONAL;
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
      // تحقق من التسجيل أولاً
      const isRegistered = await messaging().isDeviceRegisteredForRemoteMessages;
      if (!isRegistered) {
        await messaging().registerDeviceForRemoteMessages();
      }
      
      const token = await messaging().getToken();
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
    
    messaging().onTokenRefresh(async (newToken) => {
      await AsyncStorage.setItem('fcm_token', newToken);
    });

    return token;
  }

  onMessage(callback) {
    return messaging().onMessage(async (remoteMessage) => {
      callback(remoteMessage);
    });
  }

  onNotificationOpenedApp(callback) {
    messaging().onNotificationOpenedApp((remoteMessage) => {
      callback(remoteMessage);
    });
  }

  async getInitialNotification() {
    return await messaging().getInitialNotification();
  }

  setBackgroundMessageHandler(handler) {
    messaging().setBackgroundMessageHandler(handler);
  }
}

export default new NotificationService();
