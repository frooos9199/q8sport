import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const { width } = Dimensions.get('window');

const AdminReportsScreen = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState({
    dailyStats: { users: 0, products: 0, sales: 0 },
    weeklyStats: { users: 0, products: 0, sales: 0 },
    monthlyStats: { users: 0, products: 0, sales: 0 },
    topSellers: [],
    topProducts: [],
    recentActivity: [],
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_REPORTS);
      setReports(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const StatCard = ({ title, daily, weekly, monthly, icon, color }) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color }]}>{daily}</Text>
          <Text style={styles.statLabel}>اليوم</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color }]}>{weekly}</Text>
          <Text style={styles.statLabel}>الأسبوع</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color }]}>{monthly}</Text>
          <Text style={styles.statLabel}>الشهر</Text>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>📊 التقارير والإحصائيات</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإحصائيات الزمنية</Text>
        <StatCard
          title="المستخدمين الجدد"
          daily={reports.dailyStats.users}
          weekly={reports.weeklyStats.users}
          monthly={reports.monthlyStats.users}
          icon="👥"
          color="#3B82F6"
        />
        <StatCard
          title="المنتجات الجديدة"
          daily={reports.dailyStats.products}
          weekly={reports.weeklyStats.products}
          monthly={reports.monthlyStats.products}
          icon="📦"
          color="#10B981"
        />
        <StatCard
          title="المبيعات"
          daily={reports.dailyStats.sales}
          weekly={reports.weeklyStats.sales}
          monthly={reports.monthlyStats.sales}
          icon="💰"
          color="#F59E0B"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>أفضل البائعين</Text>
        {reports.topSellers.map((seller, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>{seller.name}</Text>
              <Text style={styles.listSubtitle}>{seller.sales} مبيعات</Text>
            </View>
            <Text style={styles.listValue}>{seller.revenue} د.ك</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المنتجات الأكثر مبيعاً</Text>
        {reports.topProducts.map((product, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>{product.title}</Text>
              <Text style={styles.listSubtitle}>{product.views} مشاهدة</Text>
            </View>
            <Text style={styles.listValue}>{product.price} د.ك</Text>
          </View>
        ))}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
  },
  statIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginRight: 15,
    width: 40,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  listValue: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
});

export default AdminReportsScreen;
