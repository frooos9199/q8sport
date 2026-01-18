import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AdminIcon, StoreIcon } from '../components/Icons';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AuthScreen from '../screens/Profile/AuthScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import MyProductsScreen from '../screens/Profile/MyProductsScreen';
import AddProductScreen from '../screens/Profile/AddProductScreen';
import EditProductScreen from '../screens/Profile/EditProductScreen';
import SettingsScreen from '../screens/Profile/SettingsScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import FavoritesScreen from '../screens/Profile/FavoritesScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import ManageUsersScreen from '../screens/Admin/ManageUsersScreen';
import ManageProductsScreen from '../screens/Admin/ManageProductsScreen';
import BlockedProductsScreen from '../screens/Admin/BlockedProductsScreen';
import AdminSettingsScreen from '../screens/Admin/AdminSettingsScreen';
import AdminReportsScreen from '../screens/Admin/AdminReportsScreen';
import ManageAuctionsScreen from '../screens/Admin/ManageAuctionsScreen';
import ManageRequestsScreen from '../screens/Admin/ManageRequestsScreen';
import ManageShopsScreen from '../screens/Admin/ManageShopsScreen';

// Messages Screens
import MessagesScreen from '../screens/Messages/MessagesScreen';
import ChatScreen from '../screens/Messages/ChatScreen';

// Additional User Screens
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import UserStatsScreen from '../screens/Profile/UserStatsScreen';
import NotificationsScreen from '../screens/Profile/NotificationsScreen';

// Stores Screens
import StoresScreen from '../screens/Stores/StoresScreen';
import StoreDetailsScreen from '../screens/Stores/StoreDetailsScreen';

// Auctions Screens
import AuctionsListScreen from '../screens/Auctions/AuctionsListScreen';
import AuctionDetailsScreen from '../screens/Auctions/AuctionDetailsScreen';
import MyAuctionsScreen from '../screens/Auctions/MyAuctionsScreen';
import AddAuctionScreen from '../screens/Auctions/AddAuctionScreen';

// Requests Screens
import RequestsScreen from '../screens/Requests/RequestsScreen';
import AddRequestScreen from '../screens/Requests/AddRequestScreen';
import MyRequestsScreen from '../screens/Requests/MyRequestsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
          borderBottomColor: '#DC2626',
          borderBottomWidth: 2,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: '#000' },
      }}>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ 
          title: 'تفاصيل المنتج',
          headerBackTitle: 'رجوع',
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
          borderBottomColor: '#DC2626',
          borderBottomWidth: 2,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: '#000' },
      }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen 
            name="ProfileMain" 
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MyProducts" 
            component={MyProductsScreen}
            options={{ 
              title: 'منتجاتي',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="AddProduct" 
            component={AddProductScreen}
            options={{ 
              title: 'إضافة منتج',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="EditProduct" 
            component={EditProductScreen}
            options={{ 
              title: 'تعديل المنتج',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              title: 'الإعدادات',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ 
              title: 'تعديل الملف الشخصي',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="Favorites" 
            component={FavoritesScreen}
            options={{ 
              title: 'المفضلة',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="MyRequests" 
            component={MyRequestsScreen}
            options={{ 
              title: 'طلباتي',
              headerBackTitle: 'رجوع',
            }}
          />

          <Stack.Screen
            name="MyAuctions"
            component={MyAuctionsScreen}
            options={{
              title: 'مزاداتي',
              headerBackTitle: 'رجوع',
            }}
          />

          <Stack.Screen
            name="AddAuction"
            component={AddAuctionScreen}
            options={{
              title: 'إضافة مزاد',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen}
            options={{ 
              title: 'تغيير كلمة المرور',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="UserStats" 
            component={UserStatsScreen}
            options={{ 
              title: 'إحصائياتي',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ 
              title: 'الإشعارات',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="Messages" 
            component={MessagesScreen}
            options={{ 
              title: 'الرسائل',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={({ route }) => ({
              title: route.params?.otherUser?.name || 'محادثة',
              headerBackTitle: 'رجوع',
            })}
          />
          <Stack.Screen 
            name="ProductDetails" 
            component={ProductDetailsScreen}
            options={{ 
              title: 'تفاصيل المنتج',
              headerBackTitle: 'رجوع',
            }}
          />

          <Stack.Screen
            name="AuctionDetails"
            component={AuctionDetailsScreen}
            options={{
              title: 'تفاصيل المزاد',
              headerBackTitle: 'رجوع',
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              title: 'تسجيل الدخول',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              title: 'إنشاء حساب',
              headerBackTitle: 'رجوع',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const StoresStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
          borderBottomColor: '#DC2626',
          borderBottomWidth: 2,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: '#000' },
      }}>
      <Stack.Screen 
        name="StoresMain" 
        component={StoresScreen}
        options={{ 
          title: 'المحلات',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="StoreDetails"
        component={StoreDetailsScreen}
        options={{
          title: 'تفاصيل المحل',
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ 
          title: 'تفاصيل المنتج',
          headerBackTitle: 'رجوع',
        }}
      />
    </Stack.Navigator>
  );
};

const AuctionsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
          borderBottomColor: '#DC2626',
          borderBottomWidth: 2,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: '#000' },
      }}>
      <Stack.Screen
        name="AuctionsMain"
        component={AuctionsListScreen}
        options={{
          title: 'المزادات',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="AuctionDetails"
        component={AuctionDetailsScreen}
        options={{
          title: 'تفاصيل المزاد',
          headerBackTitle: 'رجوع',
        }}
      />
    </Stack.Navigator>
  );
};
const RequestsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
          borderBottomColor: '#DC2626',
          borderBottomWidth: 2,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: '#000' },
      }}>
      <Stack.Screen 
        name="RequestsMain" 
        component={RequestsScreen}
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="AddRequest" 
        component={AddRequestScreen}
        options={{ 
          title: 'إضافة طلب',
          headerBackTitle: 'رجوع',
        }}
      />
    </Stack.Navigator>
  );
};



const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
          borderBottomColor: '#DC2626',
          borderBottomWidth: 2,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: '#000' },
      }}>
      <Stack.Screen 
        name="AdminMain" 
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ManageUsers" 
        component={ManageUsersScreen}
        options={{ 
          title: 'إدارة المستخدمين',
          headerBackTitle: 'رجوع',
        }}
      />

      <Stack.Screen
        name="ManageShops"
        component={ManageShopsScreen}
        options={{
          title: 'إدارة المحلات',
          headerBackTitle: 'رجوع',
        }}
      />

      <Stack.Screen
        name="AdminManageAuctions"
        component={ManageAuctionsScreen}
        options={{
          title: 'إدارة المزادات',
          headerBackTitle: 'رجوع',
        }}
      />

      <Stack.Screen
        name="AdminManageRequests"
        component={ManageRequestsScreen}
        options={{
          title: 'إدارة المطلوبات',
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen 
        name="ManageProducts" 
        component={ManageProductsScreen}
        options={{ 
          title: 'إدارة المنتجات',
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen 
        name="BlockedProducts" 
        component={BlockedProductsScreen}
        options={{ 
          title: 'المنتجات المحظورة',
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen 
        name="AdminSettings" 
        component={AdminSettingsScreen}
        options={{ 
          title: 'إعدادات الإدارة',
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen 
        name="AdminReports" 
        component={AdminReportsScreen}
        options={{ 
          title: 'التقارير',
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ 
          title: 'تفاصيل المنتج',
          headerBackTitle: 'رجوع',
        }}
      />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#DC2626',
          borderTopWidth: 2,
        },
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: '#999',
        headerStyle: {
          backgroundColor: '#000',
          borderBottomColor: '#DC2626',
          borderBottomWidth: 2,
        },
        headerTintColor: '#fff',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Stores"
        component={StoresStack}
        options={{
          title: 'المحلات',
          tabBarIcon: ({ color, size }) => (
            <StoreIcon size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Auctions"
        component={AuctionsStack}
        options={{
          title: 'المزادات',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hammer" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsStack}
        options={{
          title: 'المطلوب',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="megaphone" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      {user?.role === 'ADMIN' && (
        <Tab.Screen
          name="AdminTab"
          component={AdminStack}
          options={{
            title: 'الإدارة',
            tabBarIcon: ({ color, size }) => (
              <AdminIcon size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: 'حسابي',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
