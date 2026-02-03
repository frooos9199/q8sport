import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';
import './src/utils/logConfig';

// تم إزالة SplashScreen المكرر - الآن يتم عرضه فقط من AppNavigator
const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <OfflineBanner />
          <AppNavigator />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
