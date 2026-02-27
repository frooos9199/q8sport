import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';
import './src/utils/logConfig';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// تم إزالة SplashScreen المكرر - الآن يتم عرضه فقط من AppNavigator
const App = () => {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <OfflineBanner />
            <AppNavigator />
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
