import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { t } from '../i18n';
import { useLocale } from '../i18n/LocaleProvider';

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
import UserManagementScreen from '../screens/dashboard/UserManagementScreen';
import BannerManagementScreen from '../screens/dashboard/BannerManagementScreen';
import PopupAdsManagementScreen from '../screens/dashboard/PopupAdsManagementScreen';
import IntroSplashScreen from '../screens/IntroSplashScreen';
import LaunchNoticeScreen from '../screens/LaunchNoticeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const LAUNCH_NOTICE_ACCEPTED_KEY = 'launch-notice-accepted-v1';

const screenOptions = {
  headerStyle: { backgroundColor: colors.dark },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '800' as const },
  contentStyle: { backgroundColor: colors.dark },
  headerShadowVisible: false,
};

function BrandHeaderTitle() {
  return (
    <View style={tabStyles.brandWrap}>
      <View style={tabStyles.brandRow}>
        <Text style={tabStyles.brandQ8}>Q8</Text>
        <Text style={tabStyles.brandSport}>sport</Text>
        <Text style={tabStyles.brandCar}>Car</Text>
      </View>
      <View style={tabStyles.brandAccent} />
    </View>
  );
}

function CreateHeaderButton({ navigation }: { navigation: any }) {
  const { user } = useAuth();

  const onPress = () => {
    const parentNavigation = navigation.getParent();

    if (!user) {
      parentNavigation?.navigate('AccountTab');
      return;
    }

    parentNavigation?.navigate('HomeTab', { screen: 'CreateListingHub' });
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={tabStyles.headerAddBtn}>
      <Text style={tabStyles.headerAddIcon}>+</Text>
    </TouchableOpacity>
  );
}

function HomeStack() {
  const { locale } = useLocale();
  return (
    <Stack.Navigator key={`home-${locale}`} id="home-stack" screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerTitle: () => <BrandHeaderTitle />,
          headerRight: () => <CreateHeaderButton navigation={navigation} />,
        })}
      />
      <Stack.Screen name="CarDetails" component={CarDetailsScreen} options={{ title: t('details'), headerTransparent: true, headerTitle: '' }} />
      <Stack.Screen name="PartDetails" component={PartDetailsScreen} options={{ title: t('details') }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: t('sellerProfileTitle') }} />
      <Stack.Screen name="CreateListingHub" component={CreateListingHubScreen} options={{ title: t('createListingHubTitle') }} />
      <Stack.Screen name="CreateCar" component={CreateCarScreen} options={{ title: t('createCarTitle') }} />
      <Stack.Screen name="CreatePart" component={CreatePartScreen} options={{ title: t('createPartTitle') }} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: t('createRequestTitle') }} />
    </Stack.Navigator>
  );
}

function CarsStack() {
  const { locale } = useLocale();
  return (
    <Stack.Navigator key={`cars-${locale}`} id="cars-stack" screenOptions={screenOptions}>
      <Stack.Screen
        name="Cars"
        component={CarsScreen}
        options={({ navigation }) => ({
          title: `🏎️ ${t('cars')}`,
          headerRight: () => <CreateHeaderButton navigation={navigation} />,
        })}
      />
      <Stack.Screen name="CarDetails" component={CarDetailsScreen} options={{ title: t('details'), headerTransparent: true, headerTitle: '' }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: t('sellerProfileTitle') }} />
      <Stack.Screen name="CreateCar" component={CreateCarScreen} options={{ title: t('createCarTitle') }} />
    </Stack.Navigator>
  );
}

function PartsStack() {
  const { locale } = useLocale();
  return (
    <Stack.Navigator key={`parts-${locale}`} id="parts-stack" screenOptions={screenOptions}>
      <Stack.Screen
        name="Parts"
        component={PartsScreen}
        options={({ navigation }) => ({
          title: `⚙️ ${t('parts')}`,
          headerRight: () => <CreateHeaderButton navigation={navigation} />,
        })}
      />
      <Stack.Screen name="PartDetails" component={PartDetailsScreen} options={{ title: t('details') }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: t('sellerProfileTitle') }} />
      <Stack.Screen name="CreatePart" component={CreatePartScreen} options={{ title: t('createPartTitle') }} />
    </Stack.Navigator>
  );
}

function RequestsStack() {
  const { locale } = useLocale();
  return (
    <Stack.Navigator key={`requests-${locale}`} id="requests-stack" screenOptions={screenOptions}>
      <Stack.Screen
        name="Requests"
        component={RequestsScreen}
        options={({ navigation }) => ({
          title: `📋 ${t('requests')}`,
          headerRight: () => <CreateHeaderButton navigation={navigation} />,
        })}
      />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: t('sellerProfileTitle') }} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: t('createRequestSimpleTitle') }} />
      <Stack.Screen name="CreateListingHub" component={CreateListingHubScreen} options={{ title: t('createListingHubTitle') }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  const { locale } = useLocale();
  return (
    <Stack.Navigator key={`auth-${locale}`} id="auth-stack" screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  const { locale } = useLocale();
  return (
    <Stack.Navigator key={`account-${locale}`} id="account-stack" screenOptions={screenOptions}>
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={({ navigation }) => ({
          title: t('myAccount'),
          headerRight: () => <CreateHeaderButton navigation={navigation} />,
        })}
      />
      <Stack.Screen
        name="MyListings"
        component={MyListingsScreen}
        options={({ route }: any) => ({ title: route?.params?.adminView ? t('adminMarketTitle') : t('myListingsTitle') })}
      />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: t('userManagementTitle') }} />
      <Stack.Screen name="BannerManagement" component={BannerManagementScreen} options={{ title: t('bannerManagementTitle') }} />
      <Stack.Screen name="PopupAdsManagement" component={PopupAdsManagementScreen} options={{ title: 'Popup Ads' }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: t('userDetailsTitle') }} />
      <Stack.Screen name="CreateListingHub" component={CreateListingHubScreen} options={{ title: t('createListingHubTitle') }} />
      <Stack.Screen name="CreateCar" component={CreateCarScreen} options={{ title: t('createCarTitle') }} />
      <Stack.Screen name="CreatePart" component={CreatePartScreen} options={{ title: t('createPartTitle') }} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: t('createRequestTitle') }} />
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
  const insets = useSafeAreaInsets();
  const { user, loading } = useAuth();
  const { locale } = useLocale();
  const tabBarBottomPad = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 24 : 10,
  );
  const tabBarLabelStyle = React.useMemo(
    () => ({ fontSize: 10, fontWeight: '700' as const, marginTop: 2 }),
    [locale],
  );
  const [showIntro, setShowIntro] = React.useState(true);
  const [showLaunchNotice, setShowLaunchNotice] = React.useState(false);
  const [launchNoticeReady, setLaunchNoticeReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const loadLaunchNoticeState = async () => {
      try {
        const accepted = await AsyncStorage.getItem(LAUNCH_NOTICE_ACCEPTED_KEY);
        if (!mounted) {
          return;
        }

        setShowLaunchNotice(accepted !== 'true');
      } catch {
        if (mounted) {
          setShowLaunchNotice(true);
        }
      } finally {
        if (mounted) {
          setLaunchNoticeReady(true);
        }
      }
    };

    loadLaunchNoticeState();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLaunchNoticeAgree = React.useCallback(async () => {
    try {
      await AsyncStorage.setItem(LAUNCH_NOTICE_ACCEPTED_KEY, 'true');
    } finally {
      setShowLaunchNotice(false);
    }
  }, []);

  if (loading || !launchNoticeReady) {
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

  if (showLaunchNotice) {
    return <LaunchNoticeScreen onAgree={handleLaunchNoticeAgree} />;
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
          height: 66 + tabBarBottomPad,
          paddingBottom: tabBarBottomPad,
          paddingTop: 10,
          overflow: 'visible',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.silver,
        tabBarLabelStyle,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: t('home'), tabBarIcon: ({ focused }) => <TabIcon icon="🔥" focused={focused} /> }} />
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

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', height: 30 },
  icon: { fontSize: 24, opacity: 0.5 },
  iconActive: { opacity: 1, transform: [{ scale: 1.1 }] },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.primary, marginTop: 4 },
  splash: { flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' },
  splashQ8: { fontSize: 56, fontWeight: '900', color: colors.primary },
  splashSport: { fontSize: 20, fontWeight: '800', color: colors.white, letterSpacing: 4 },
  splashLine: { width: 40, height: 3, backgroundColor: colors.primary, borderRadius: 2, marginTop: 16 },

  brandWrap: { alignItems: 'center', justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  brandQ8: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  brandSport: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  brandCar: {
    color: colors.silverLight,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  brandAccent: {
    marginTop: 2,
    width: 54,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },

  headerAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  headerAddIcon: { color: colors.primary, fontSize: 24, fontWeight: '900', lineHeight: 24 },
});
