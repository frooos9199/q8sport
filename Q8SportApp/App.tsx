import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import './src/utils/logConfig';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <AppNavigator />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
