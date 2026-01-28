import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';
import './src/utils/logConfig';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

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
