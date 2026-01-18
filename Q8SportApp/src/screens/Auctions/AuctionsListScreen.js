import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { AuctionsService } from '../../services/api/auctions';

const AuctionsListScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [auctions, setAuctions] = useState([]);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await AuctionsService.getAuctions({ limit: 50 });
      setAuctions(Array.isArray(data?.auctions) ? data.auctions : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل المزادات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const formatKwd = (value) => {
    const n = typeof value === 'number' ? value : value ? Number(value) : null;
    if (!Number.isFinite(n)) return '—';
    return String(Math.trunc(n));
  };

  const renderItem = ({ item }) => {
    const endsAt = item?.endTime ? new Date(item.endTime) : null;
    const endsText = endsAt ? endsAt.toLocaleString() : '—';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AuctionDetails', { auctionId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>{item.title || 'مزاد'}</Text>
          <Text style={styles.badge}>{(item.status || 'ACTIVE').toString()}</Text>
        </View>

        <Text style={styles.subtitle} numberOfLines={2}>{item.description || '—'}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>سعر ابتدائي: {formatKwd(item.startingPrice ?? item.startingBid ?? item.startPrice)} د.ك</Text>
          <Text style={styles.meta}>أعلى مزايدة: {formatKwd(item.currentBid ?? item.highestBid ?? item.currentPrice)} د.ك</Text>
        </View>
        <Text style={styles.meta}>أعلى مزايد: {item?.highestBidder?.name || '—'}</Text>
        <Text style={styles.meta}>ينتهي: {endsText}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => load(false)}>
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={auctions}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#DC2626" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد مزادات حالياً</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  list: { padding: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  errorText: { color: '#F87171', fontSize: 16, textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: '#DC2626', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  badge: { color: '#fff', backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontSize: 11 },
  subtitle: { color: '#aaa', fontSize: 13, marginBottom: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  meta: { color: '#999', fontSize: 12 },
  emptyContainer: { paddingTop: 80, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});

export default AuctionsListScreen;
