import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';

const UserStatsScreen = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    soldProducts: 0,
    totalViews: 0,
    totalRevenue: 0,
    favoriteCount: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_STATS);
      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ icon, title, value, color }) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
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
        <Text style={styles.headerTitle}>📊 إحصائياتي</Text>
        <Text style={styles.headerSubtitle}>نظرة عامة على نشاطك</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="📦"
          title="إجمالي المنتجات"
          value={stats.totalProducts}
          color="#3B82F6"
        />
        <StatCard
          icon="✅"
          title="المنتجات النشطة"
          value={stats.activeProducts}
          color="#10B981"
        />
        <StatCard
          icon="💰"
          title="المنتجات المباعة"
          value={stats.soldProducts}
          color="#F59E0B"
        />
        <StatCard
          icon="👁"
          title="إجمالي المشاهدات"
          value={stats.totalViews}
          color="#8B5CF6"
        />
        <StatCard
          icon="💵"
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue} د.ك`}
          color="#DC2626"
        />
        <StatCard
          icon="❤️"
          title="المفضلة"
          value={stats.favoriteCount}
          color="#EC4899"
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          قم بإضافة المزيد من المنتجات لزيادة فرص البيع
        </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  infoBox: {
    margin: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  infoIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  infoText: {
    flex: 1,
    color: '#F59E0B',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default UserStatsScreen;
