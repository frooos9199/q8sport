import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/lib/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={{ dark: true, colors: { primary: colors.primary, background: colors.dark, card: colors.dark, text: colors.white, border: colors.metal, notification: colors.primary } }}>
          <StatusBar barStyle="light-content" backgroundColor={colors.dark} />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
