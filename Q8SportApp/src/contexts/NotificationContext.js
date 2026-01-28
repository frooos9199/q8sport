import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import NotificationService from '../services/NotificationService';
import apiClient from '../services/apiClient';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      const token = await NotificationService.initialize();
      if (token) {
        setFcmToken(token);
        await sendTokenToServer(token);
      }

      NotificationService.onMessage((remoteMessage) => {
        setNotification(remoteMessage);
        Alert.alert(
          remoteMessage.notification?.title || 'إشعار جديد',
          remoteMessage.notification?.body || ''
        );
      });

      NotificationService.onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification opened app:', remoteMessage);
      });

      const initialNotification = await NotificationService.getInitialNotification();
      if (initialNotification) {
        console.log('Initial notification:', initialNotification);
      }
    } catch (error) {
      console.error('Notification initialization error:', error);
    }
  };

  const sendTokenToServer = async (token) => {
    try {
      await apiClient.post('/user/fcm-token', { token });
    } catch (error) {
      console.error('Failed to send FCM token:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ fcmToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
