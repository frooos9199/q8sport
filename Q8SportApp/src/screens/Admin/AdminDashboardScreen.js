import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

  import apiClient from '../../services/apiClient';
  import API_CONFIG from '../../config/api';
const AdminDashboardScreen = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_STATS);
      const data = res.data;
      const overview = data?.overview || data;
      setStats({
        totalUsers: overview?.totalUsers || 0,
        totalProducts: overview?.totalProducts || 0,
        activeProducts: overview?.activeProducts || 0,
        pendingProducts: overview?.pendingProducts || 0,
        totalRevenue: overview?.totalRevenue || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const navigateToTab = (tabName, params) => {
    // Keep helper for other use-cases
    const parentNav = navigation?.getParent?.();
    if (parentNav?.navigate) {
      parentNav.navigate(tabName, params);
      return;
    }
    navigation.navigate(tabName, params);
  };

  const StatCard = ({ icon, title, value, color }) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const MenuButton = ({ icon, title, onPress, color = '#DC2626' }) => (
    <TouchableOpacity
      style={[styles.menuButton, { borderColor: color }]}
      onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />
      }>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة التحكم</Text>
        <Text style={styles.headerSubtitle}>إدارة Q8 Sport Car</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="👥" title="المستخدمين" value={stats.totalUsers} color="#3B82F6" />
        <StatCard icon="📦" title="المنتجات" value={stats.totalProducts} color="#10B981" />
        <StatCard icon="✅" title="نشط" value={stats.activeProducts} color="#F59E0B" />
        <StatCard icon="⏳" title="معلق" value={stats.pendingProducts} color="#DC2626" />
      </View>

      <View style={styles.menuGrid}>
        <MenuButton
          icon="🔨"
          title="إدارة المزادات"
          onPress={() => navigation.navigate('AdminManageAuctions')}
          color="#10B981"
        />
        <MenuButton
          icon="📣"
          title="إدارة المطلوبات"
          onPress={() => navigation.navigate('AdminManageRequests')}
          color="#F59E0B"
        />
        <MenuButton
          icon="👥"
          title="إدارة المستخدمين"
          onPress={() => navigation.navigate('ManageUsers')}
          color="#3B82F6"
        />
        <MenuButton
          icon="🏪"
          title="إدارة المحلات"
          onPress={() => navigation.navigate('ManageShops')}
          color="#06B6D4"
        />
        <MenuButton
          icon="📦"
          title="إدارة المنتجات"
          onPress={() => navigation.navigate('ManageProducts')}
          color="#10B981"
        />
        <MenuButton
          icon="🚫"
          title="المنتجات المحظورة"
          onPress={() => navigation.navigate('BlockedProducts')}
          color="#DC2626"
        />
        <MenuButton
          icon="📊"
          title="التقارير"
          onPress={() => navigation.navigate('AdminReports')}
          color="#F59E0B"
        />
        <MenuButton
          icon="⚙️"
          title="الإعدادات"
          onPress={() => navigation.navigate('AdminSettings')}
          color="#8B5CF6"
        />
        <MenuButton
          icon="📢"
          title="الإعلانات"
          onPress={() => Alert.alert('قريباً', 'هذه الميزة قيد التطوير')}
          color="#EC4899"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  statIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#999',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  menuButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
