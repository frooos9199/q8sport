import React, { useState, Suspense, lazy } from 'react';
import { View, StatusBar, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AdminIcon, StoreIcon } from '../components/Icons';
import BurnoutLoader from '../components/BurnoutLoader';
import AddOptionsModal from '../components/AddOptionsModal';
import HeaderAddButton from '../components/HeaderAddButton';

// ============================================
// LAZY LOADING - تحميل الشاشات عند الحاجة فقط
// ============================================

// Home Screens - تحميل فوري (الصفحة الرئيسية)
import HomeScreen from '../screens/Home/HomeScreen';

// Auth Screens - Lazy (نادراً ما تستخدم)
const LoginScreen = lazy(() => import('../screens/Auth/LoginScreen'));
const RegisterScreen = lazy(() => import('../screens/Auth/RegisterScreen'));
const TermsScreen = lazy(() => import('../screens/Auth/TermsScreen'));
const AuthScreen = lazy(() => import('../screens/Profile/AuthScreen'));

// Product Screens - Lazy
const ProductDetailsScreen = lazy(() => import('../screens/ProductDetailsScreen'));

// Profile Screens - Lazy
const ProfileScreen = lazy(() => import('../screens/Profile/ProfileScreen'));
const MyProductsScreen = lazy(() => import('../screens/Profile/MyProductsScreen'));
const AddProductScreen = lazy(() => import('../screens/Profile/AddProductScreen'));
const EditProductScreen = lazy(() => import('../screens/Profile/EditProductScreen'));
const SettingsScreen = lazy(() => import('../screens/Profile/SettingsScreen'));
const EditProfileScreen = lazy(() => import('../screens/Profile/EditProfileScreen'));
const FavoritesScreen = lazy(() => import('../screens/Profile/FavoritesScreen'));
const ChangePasswordScreen = lazy(() => import('../screens/Profile/ChangePasswordScreen'));
const UserStatsScreen = lazy(() => import('../screens/Profile/UserStatsScreen'));
const NotificationsScreen = lazy(() => import('../screens/Profile/NotificationsScreen'));

// Admin Screens - Lazy (قليل الاستخدام)
const AdminDashboardScreen = lazy(() => import('../screens/Admin/AdminDashboardScreen'));
const ManageUsersScreen = lazy(() => import('../screens/Admin/ManageUsersScreen'));
const ManageProductsScreen = lazy(() => import('../screens/Admin/ManageProductsScreen'));
const BlockedProductsScreen = lazy(() => import('../screens/Admin/BlockedProductsScreen'));
const AdminSettingsScreen = lazy(() => import('../screens/Admin/AdminSettingsScreen'));
const AdminReportsScreen = lazy(() => import('../screens/Admin/AdminReportsScreen'));
const ManageAuctionsScreen = lazy(() => import('../screens/Admin/ManageAuctionsScreen'));
const ManageRequestsScreen = lazy(() => import('../screens/Admin/ManageRequestsScreen'));
const ManageShowcasesScreen = lazy(() => import('../screens/Admin/ManageShowcasesScreen'));

// Messages Screens - Lazy
const MessagesScreen = lazy(() => import('../screens/Messages/MessagesScreen'));
const ChatScreen = lazy(() => import('../screens/Messages/ChatScreen'));

// Stores Screens - Lazy
const ShowcasesScreen = lazy(() => import('../screens/Stores/ShowcasesScreen'));
const ShowcaseDetailsScreen = lazy(() => import('../screens/Stores/ShowcaseDetailsScreen'));
const AddShowcaseScreen = lazy(() => import('../screens/Stores/AddShowcaseScreen'));
const MyShowcasesScreen = lazy(() => import('../screens/Stores/MyShowcasesScreen'));

// Auctions Screens - Lazy
const AuctionsListScreen = lazy(() => import('../screens/Auctions/AuctionsListScreen'));
const AuctionDetailsScreen = lazy(() => import('../screens/Auctions/AuctionDetailsScreen'));
const MyAuctionsScreen = lazy(() => import('../screens/Auctions/MyAuctionsScreen'));
const AddAuctionScreen = lazy(() => import('../screens/Auctions/AddAuctionScreen'));

// Requests Screens - Lazy
const RequestsScreen = lazy(() => import('../screens/Requests/RequestsScreen'));
const AddRequestScreen = lazy(() => import('../screens/Requests/AddRequestScreen'));
const MyRequestsScreen = lazy(() => import('../screens/Requests/MyRequestsScreen'));

// Loading Fallback Component
const LoadingFallback = () => (
  <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#DC2626" />
  </View>
);

// HOC لتغليف الشاشات بـ Suspense
const withSuspense = (Component) => (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component {...props} />
  </Suspense>
);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000' },
      }}>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ 
          headerShown: false,
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
            options={{ 
              headerShown: false,
            }}
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
            name="AddRequest" 
            component={AddRequestScreen}
            options={{ 
              title: 'إضافة مطلوب',
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
            name="MyShowcases"
            component={MyShowcasesScreen}
            options={{
              title: 'الكار شو',
              headerBackTitle: 'رجوع',
            }}
          />
          <Stack.Screen 
            name="AddShowcase" 
            component={withSuspense(AddShowcaseScreen)}
            options={({ route }) => ({ 
              title: route.params?.editMode ? 'تعديل الكار شو' : 'إضافة عرض',
              headerBackTitle: 'رجوع',
            })}
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
          <Stack.Screen 
            name="Terms" 
            component={TermsScreen}
            options={{ 
              title: 'الشروط والأحكام',
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
        headerShown: false,
        cardStyle: { backgroundColor: '#000' },
      }}>
      <Stack.Screen 
        name="StoresMain" 
        component={ShowcasesScreen}
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ShowcaseDetails" 
        component={ShowcaseDetailsScreen}
        options={{ 
          title: 'تفاصيل العرض',
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen 
        name="AddShowcase" 
        component={withSuspense(AddShowcaseScreen)}
        options={({ route }) => ({ 
          title: route.params?.editMode ? 'تعديل الكار شو' : 'إضافة عرض',
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
    </Stack.Navigator>
  );
};

const AuctionsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000' },
      }}>
      <Stack.Screen
        name="AuctionsMain"
        component={AuctionsListScreen}
        options={{
          headerShown: false,
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
        headerShown: false,
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
        options={{ 
          title: 'لوحة الإدارة',
          headerShown: true,
        }}
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
        name="ManageShowcases"
        component={ManageShowcasesScreen}
        options={{
          title: 'مراجعة العروض',
          headerBackTitle: 'رجوع',
        }}
      />
      <Stack.Screen 
        name="ShowcaseDetails" 
        component={ShowcaseDetailsScreen}
        options={{ 
          title: 'تفاصيل العرض',
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
  const [showAddModal, setShowAddModal] = useState(false);
  const insets = useSafeAreaInsets();

  const renderHeaderRight = () => (
    <HeaderAddButton onPress={() => setShowAddModal(true)} />
  );
  
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopWidth: 2,
            borderTopColor: '#DC2626',
            height: 65 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 5,
            position: 'absolute',
          },
          tabBarActiveTintColor: '#DC2626',
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
          headerStyle: {
            backgroundColor: '#000',
            borderBottomWidth: 2,
            borderBottomColor: '#DC2626',
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
            color: '#fff',
          },
        })}>
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            title: 'الرئيسية',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={24} 
                color={color} 
              />
            ),
            headerShown: true,
            headerRight: renderHeaderRight,
          }}
        />
        <Tab.Screen
          name="Stores"
          component={StoresStack}
          options={{
            title: 'VIP',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? "star" : "star-outline"} 
                size={24} 
                color={color} 
              />
            ),
            headerShown: true,
            headerRight: renderHeaderRight,
          }}
        />
        
        <Tab.Screen
          name="Auctions"
          component={AuctionsStack}
          options={{
            title: 'المزادات',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? "hammer" : "hammer-outline"} 
                size={24} 
                color={color} 
              />
            ),
            headerShown: true,
            headerRight: renderHeaderRight,
          }}
        />
        
        <Tab.Screen
          name="Requests"
          component={RequestsStack}
          options={{
            title: 'المطلوب',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? "megaphone" : "megaphone-outline"} 
                size={24} 
                color={color} 
              />
            ),
            headerShown: true,
            headerRight: renderHeaderRight,
          }}
        />
        
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            title: 'حسابي',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={24} 
                color={color} 
              />
            ),
            headerShown: true,
            headerRight: renderHeaderRight,
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
      </Tab.Navigator>
      
      <AddOptionsModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
};

const AppNavigator = () => {
  const { loading } = useAuth();

  // عرض SplashScreen أثناء التحميل بدلاً من null
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <BurnoutLoader text="Q8 Sport Car" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
