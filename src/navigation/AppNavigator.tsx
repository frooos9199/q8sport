import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { t } from '../i18n';

import HomeScreen from '../screens/HomeScreen';
import CarsScreen from '../screens/cars/CarsScreen';
import CarDetailsScreen from '../screens/cars/CarDetailsScreen';
import PartsScreen from '../screens/parts/PartsScreen';
import RequestsScreen from '../screens/requests/RequestsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AccountScreen from '../screens/dashboard/AccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.dark },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.dark },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CarDetails" component={CarDetailsScreen} options={{ title: t('details') }} />
      <Stack.Screen name="PartDetails" component={CarDetailsScreen} options={{ title: t('details') }} />
    </Stack.Navigator>
  );
}

function CarsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Cars" component={CarsScreen} options={{ title: `🏎️ ${t('cars')}` }} />
      <Stack.Screen name="CarDetails" component={CarDetailsScreen} options={{ title: t('details') }} />
    </Stack.Navigator>
  );
}

function PartsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Parts" component={PartsScreen} options={{ title: `⚙️ ${t('parts')}` }} />
    </Stack.Navigator>
  );
}

function RequestsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Requests" component={RequestsScreen} options={{ title: `📋 ${t('requests')}` }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: t('myAccount') }} />
    </Stack.Navigator>
  );
}

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 2 }} />}
    </View>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '900' }}>Q8</Text>
        <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>SPORT CAR</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.dark, borderTopColor: colors.metal, borderTopWidth: 1, height: 85, paddingBottom: 20, paddingTop: 8 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.silver,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: t('home'), tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }} />
      <Tab.Screen name="CarsTab" component={CarsStack} options={{ tabBarLabel: t('cars'), tabBarIcon: ({ focused }) => <TabIcon icon="🏎️" focused={focused} /> }} />
      <Tab.Screen name="PartsTab" component={PartsStack} options={{ tabBarLabel: t('parts'), tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} /> }} />
      <Tab.Screen name="RequestsTab" component={RequestsStack} options={{ tabBarLabel: t('requests'), tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} /> }} />
      <Tab.Screen
        name="AccountTab"
        component={user ? AccountStack : AuthStack}
        options={{ tabBarLabel: user ? t('myAccount') : t('login'), tabBarIcon: ({ focused }) => <TabIcon icon={user ? "👤" : "🔐"} focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}
