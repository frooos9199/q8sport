import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { t } from '../i18n';

import HomeScreen from '../screens/HomeScreen';
import CarsScreen from '../screens/cars/CarsScreen';
import CarDetailsScreen from '../screens/cars/CarDetailsScreen';
import PartsScreen from '../screens/parts/PartsScreen';
import PartDetailsScreen from '../screens/parts/PartDetailsScreen';
import RequestsScreen from '../screens/requests/RequestsScreen';
import CreateRequestScreen from '../screens/requests/CreateRequestScreen';
import CreateCarScreen from '../screens/cars/CreateCarScreen';
import CreatePartScreen from '../screens/parts/CreatePartScreen';
import CreateListingHubScreen from '../screens/dashboard/CreateListingHubScreen';
import MyListingsScreen from '../screens/dashboard/MyListingsScreen';
import SellerProfileScreen from '../screens/dashboard/SellerProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AccountScreen from '../screens/dashboard/AccountScreen';
import IntroSplashScreen from '../screens/IntroSplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.dark },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '800' as const },
  contentStyle: { backgroundColor: colors.dark },
  headerShadowVisible: false,
};

function HomeStack() {
  return (
    <Stack.Navigator id="home-stack" screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Q8 Sport Market' }} />
      <Stack.Screen name="CarDetails" component={CarDetailsScreen} options={{ title: t('details'), headerTransparent: true, headerTitle: '' }} />
      <Stack.Screen name="PartDetails" component={PartDetailsScreen} options={{ title: t('details') }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: 'ملف المعلن' }} />
      <Stack.Screen name="CreateListingHub" component={CreateListingHubScreen} options={{ title: 'وش تبي تنشر؟' }} />
      <Stack.Screen name="CreateCar" component={CreateCarScreen} options={{ title: 'أضف سيارة' }} />
      <Stack.Screen name="CreatePart" component={CreatePartScreen} options={{ title: 'أضف قطعة' }} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: 'انشر مطلوبك' }} />
    </Stack.Navigator>
  );
}

function CarsStack() {
  return (
    <Stack.Navigator id="cars-stack" screenOptions={screenOptions}>
      <Stack.Screen name="Cars" component={CarsScreen} options={{ title: `🏎️ ${t('cars')}` }} />
      <Stack.Screen name="CarDetails" component={CarDetailsScreen} options={{ title: t('details'), headerTransparent: true, headerTitle: '' }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: 'ملف المعلن' }} />
      <Stack.Screen name="CreateCar" component={CreateCarScreen} options={{ title: 'أضف سيارة' }} />
    </Stack.Navigator>
  );
}

function PartsStack() {
  return (
    <Stack.Navigator id="parts-stack" screenOptions={screenOptions}>
      <Stack.Screen name="Parts" component={PartsScreen} options={{ title: `⚙️ ${t('parts')}` }} />
      <Stack.Screen name="PartDetails" component={PartDetailsScreen} options={{ title: t('details') }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: 'ملف المعلن' }} />
      <Stack.Screen name="CreatePart" component={CreatePartScreen} options={{ title: 'أضف قطعة' }} />
    </Stack.Navigator>
  );
}

function RequestsStack() {
  return (
    <Stack.Navigator id="requests-stack" screenOptions={screenOptions}>
      <Stack.Screen name="Requests" component={RequestsScreen} options={{ title: `📋 ${t('requests')}` }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: 'ملف المعلن' }} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: 'إنشاء طلب' }} />
      <Stack.Screen name="CreateListingHub" component={CreateListingHubScreen} options={{ title: 'وش تبي تنشر؟' }} />
    </Stack.Navigator>
  );
}

function AddTabButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={tabStyles.addWrap}>
      <View style={tabStyles.addBtn}>
        <Text style={tabStyles.addPlus}>+</Text>
      </View>
      <Text style={tabStyles.addLabel}>إضافة</Text>
    </TouchableOpacity>
  );
}

function EmptyScreen() {
  return <View style={{ flex: 1, backgroundColor: colors.dark }} />;
}

function AuthStack() {
  return (
    <Stack.Navigator id="auth-stack" screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator id="account-stack" screenOptions={screenOptions}>
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: t('myAccount') }} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'إعلاناتي' }} />
      <Stack.Screen name="CreateListingHub" component={CreateListingHubScreen} options={{ title: 'وش تبي تنشر؟' }} />
      <Stack.Screen name="CreateCar" component={CreateCarScreen} options={{ title: 'أضف سيارة' }} />
      <Stack.Screen name="CreatePart" component={CreatePartScreen} options={{ title: 'أضف قطعة' }} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: 'انشر مطلوبك' }} />
    </Stack.Navigator>
  );
}

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>{icon}</Text>
      {focused && <View style={tabStyles.dot} />}
    </View>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [showIntro, setShowIntro] = React.useState(true);

  if (loading) {
    return (
      <View style={tabStyles.splash}>
        <Text style={tabStyles.splashQ8}>Q8</Text>
        <Text style={tabStyles.splashSport}>SPORT CAR</Text>
        <View style={tabStyles.splashLine} />
      </View>
    );
  }

  if (showIntro) {
    return <IntroSplashScreen onDone={() => setShowIntro(false)} />;
  }

  return (
    <Tab.Navigator
      id="main-tabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.dark,
          borderTopColor: colors.metalBorder,
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 22,
          paddingTop: 10,
          overflow: 'visible',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.silver,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: t('home'), tabBarIcon: ({ focused }) => <TabIcon icon="🔥" focused={focused} /> }} />
      <Tab.Screen name="CarsTab" component={CarsStack} options={{ tabBarLabel: t('cars'), tabBarIcon: ({ focused }) => <TabIcon icon="🏎️" focused={focused} /> }} />
      <Tab.Screen name="PartsTab" component={PartsStack} options={{ tabBarLabel: t('parts'), tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} /> }} />

      <Tab.Screen
        name="AddTab"
        component={EmptyScreen}
        listeners={{
          tabPress: e => {
            e.preventDefault();
          },
        }}
        options={({ navigation }) => ({
          tabBarLabel: '',
          tabBarButton: () => (
            <AddTabButton
              onPress={() => {
                if (!user) {
                  navigation.navigate('AccountTab');
                  return;
                }
                navigation.navigate('HomeTab', { screen: 'CreateListingHub' });
              }}
            />
          ),
        })}
      />

      <Tab.Screen name="RequestsTab" component={RequestsStack} options={{ tabBarLabel: t('requests'), tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} /> }} />
      <Tab.Screen
        name="AccountTab"
        component={user ? AccountStack : AuthStack}
        options={{ tabBarLabel: user ? t('myAccount') : t('login'), tabBarIcon: ({ focused }) => <TabIcon icon={user ? "👤" : "🔐"} focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', height: 30 },
  icon: { fontSize: 24, opacity: 0.5 },
  iconActive: { opacity: 1, transform: [{ scale: 1.1 }] },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.primary, marginTop: 4 },
  splash: { flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' },
  splashQ8: { fontSize: 56, fontWeight: '900', color: colors.primary },
  splashSport: { fontSize: 20, fontWeight: '800', color: colors.white, letterSpacing: 4 },
  splashLine: { width: 40, height: 3, backgroundColor: colors.primary, borderRadius: 2, marginTop: 16 },

  addWrap: { alignItems: 'center', justifyContent: 'flex-start', width: 78, marginTop: -18 },
  addBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.darkCard,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  addPlus: { color: colors.primary, fontSize: 30, fontWeight: '900', marginTop: -2 },
  addLabel: { color: colors.silver, fontSize: 10, fontWeight: '800', marginTop: 6 },
});
