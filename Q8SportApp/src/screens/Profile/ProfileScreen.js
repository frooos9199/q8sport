import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  ProductIcon,
  FavoriteIcon,
  MessageIcon,
  NotificationIcon,
  SettingsIcon,
  StatsIcon,
} from '../../components/Icons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log('👤 ProfileScreen: User data:', {
      hasUser: !!user,
      userName: user?.name,
      userEmail: user?.email,
      userRole: user?.role
    });
  }, [user]);

  const handleLogout = async () => {
    console.log('🚪 ProfileScreen: Logging out...');
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/icon.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || '👤'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.role && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user.role}</Text>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyProducts')}>
          <ProductIcon size={28} color="#DC2626" />
          <Text style={styles.menuText}>منتجاتي</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AddProduct')}>
          <ProductIcon size={28} color="#10B981" />
          <Text style={styles.menuText}>إضافة منتج</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('UserStats')}>
          <StatsIcon size={28} color="#3B82F6" />
          <Text style={styles.menuText}>إحصائياتي</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Favorites')}>
          <FavoriteIcon size={28} color="#EC4899" filled />
          <Text style={styles.menuText}>المفضلة</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyRequests')}>
          <Ionicons name="search-outline" size={28} color="#F59E0B" />
          <Text style={styles.menuText}>طلباتي</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Messages')}>
          <MessageIcon size={28} color="#8B5CF6" />
          <Text style={styles.menuText}>الرسائل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Notifications')}>
          <NotificationIcon size={28} color="#F59E0B" />
          <Text style={styles.menuText}>الإشعارات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}>
          <SettingsIcon size={28} color="#6B7280" />
          <Text style={styles.menuText}>الإعدادات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={styles.menuText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginBottom: 20,
    opacity: 0.8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#999',
  },
  badge: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#DC2626',
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
    gap: 15,
  },
  menuIcon: {
    fontSize: 24,
    marginLeft: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'right',
  },
  adminButton: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B15',
  },
  logoutButton: {
    marginTop: 20,
    borderColor: '#DC2626',
  },
});

export default ProfileScreen;
