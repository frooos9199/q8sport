import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../utils/storage';
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
  const { user, logout, setUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // 🔄 Refresh user data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshUserData = async () => {
        try {
          const storedUser = await StorageService.getUser();
          if (storedUser) {
            setUser(storedUser);
          }
        } catch (error) {
          console.error('❌ ProfileScreen: Error refreshing user data:', error);
        }
      };

      refreshUserData();
    }, [setUser])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const storedUser = await StorageService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const navigateToAdmin = () => {
    // Navigate to Admin Tab using parent navigation
    const parentNav = navigation?.getParent?.();
    if (parentNav?.navigate) {
      parentNav.navigate('AdminTab');
    } else {
      // Fallback: try direct navigation
      navigation.navigate('AdminTab');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#DC2626"
          colors={['#DC2626']}
        />
      }
    >
      <View style={styles.header}>
        {user?.avatar && typeof user.avatar === 'string' && user.avatar.trim() ? (
          <Image
            source={{ 
              uri: user.avatar.startsWith('http') || user.avatar.startsWith('data:')
                ? user.avatar 
                : `https://www.q8sportcar.com${user.avatar}` 
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '👤'}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.role && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user.role}</Text>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        {user?.role === 'ADMIN' && (
          <TouchableOpacity
            style={[styles.menuItem, styles.adminButton]}
            onPress={navigateToAdmin}>
            <Ionicons name="shield-checkmark" size={28} color="#F59E0B" />
            <Text style={styles.menuText}>لوحة التحكم الإدارية</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyProducts')}>
          <ProductIcon size={28} color="#DC2626" />
          <Text style={styles.menuText}>منتجاتي</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyAuctions')}>
          <Ionicons name="hammer" size={28} color="#10B981" />
          <Text style={styles.menuText}>مزاداتي</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyShowcases')}>
          <Ionicons name="star" size={28} color="#8B5CF6" />
          <Text style={styles.menuText}>الكار شو</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyRequests')}>
          <Ionicons name="megaphone" size={28} color="#F59E0B" />
          <Text style={styles.menuText}>طلباتي</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Favorites')}>
          <FavoriteIcon size={28} color="#EC4899" filled />
          <Text style={styles.menuText}>المفضلة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('UserStats')}>
          <StatsIcon size={28} color="#3B82F6" />
          <Text style={styles.menuText}>إحصائياتي</Text>
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
