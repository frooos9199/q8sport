import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuctionsService } from '../../services/api/auctions';

const MyAuctionsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await AuctionsService.getMyAuctions();
      const list = Array.isArray(data?.auctions) ? data.auctions : [];
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل مزاداتك');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => load(false));
    return unsub;
  }, [navigation, load]);

  const formatKwd = (value) => {
    const n = typeof value === 'number' ? value : value ? Number(value) : null;
    if (!Number.isFinite(n)) return '—';
    return String(Math.trunc(n));
  };

  const renderItem = ({ item }) => {
    const isEnded = item?.isExpired || String(item?.status || '').toUpperCase() === 'ENDED';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AuctionDetails', { auctionId: item.id })}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{item?.title || 'مزاد'}</Text>
          <Text style={[styles.badge, isEnded ? styles.badgeEnded : styles.badgeActive]}>{String(item?.status || 'ACTIVE')}</Text>
        </View>

        <Text style={styles.subtitle} numberOfLines={2}>{item?.description || '—'}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>سعر البداية: {formatKwd(item?.startingPrice)} د.ك</Text>
          <Text style={styles.meta}>الحالي: {formatKwd(item?.currentPrice)} د.ك</Text>
        </View>
        <Text style={styles.meta}>عدد المزايدات: {item?.totalBids ?? item?._count?.bids ?? 0}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => load(false)}>
          <Text style={styles.primaryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.screenTitle}>مزاداتي</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAuction')}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>إضافة مزاد</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#DC2626" />}
        ListEmptyComponent={
          <View style={styles.centerEmpty}>
            <Ionicons name="pricetags-outline" size={70} color="#DC2626" />
            <Text style={styles.emptyText}>لم تقم بإضافة أي مزاد بعد</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('AddAuction')}>
              <Text style={styles.primaryButtonText}>إضافة مزاد</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  list: { padding: 12 },
  emptyList: { flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  centerEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#F87171', fontSize: 16, textAlign: 'center', marginBottom: 12 },
  emptyText: { color: '#999', fontSize: 16, marginTop: 10, marginBottom: 12 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  subtitle: { color: '#aaa', fontSize: 13, marginBottom: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  meta: { color: '#999', fontSize: 12 },
  badge: { color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontSize: 11 },
  badgeActive: { backgroundColor: '#16a34a' },
  badgeEnded: { backgroundColor: '#DC2626' },
  topRow: { padding: 12, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addButtonText: { color: '#fff', marginLeft: 6, fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#DC2626', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default MyAuctionsScreen;
