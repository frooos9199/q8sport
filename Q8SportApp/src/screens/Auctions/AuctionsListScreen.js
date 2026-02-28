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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuctionsService } from '../../services/api/auctions';
import { useAuth } from '../../contexts/AuthContext';
import { openWhatsApp } from '../../utils/whatsapp';

const AuctionsListScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL | ACTIVE | ENDED

  const load = useCallback(async (isRefresh = false, nextFilter) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const effectiveFilter = nextFilter || filter;
      const statusParam = effectiveFilter === 'ALL' ? undefined : effectiveFilter;
      const data = await AuctionsService.getAuctions({ status: statusParam, limit: 50 });
      const list = Array.isArray(data?.auctions) ? data.auctions : [];
      const sorted = effectiveFilter === 'ALL' ? [...list].sort((a, b) => {
        const aEnded = a?.isExpired || String(a?.status || '').toUpperCase() === 'ENDED';
        const bEnded = b?.isExpired || String(b?.status || '').toUpperCase() === 'ENDED';

        if (aEnded !== bEnded) return aEnded ? 1 : -1;

        const aEnd = a?.endTime ? new Date(a.endTime).getTime() : 0;
        const bEnd = b?.endTime ? new Date(b.endTime).getTime() : 0;
        return aEnd - bEnd;
      }) : list;
      setAuctions(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل المزادات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    load(false);
  }, [load]);

  const formatKwd = (value) => {
    const n = typeof value === 'number' ? value : value ? Number(value) : null;
    if (!Number.isFinite(n)) return '—';
    return String(Math.trunc(n));
  };

  const APP_PROMO = `\n\n—\nQ8 Sport Car 🏁\nحمّل التطبيق / زور الموقع: https://www.q8sportcar.com`;

  const renderItem = ({ item }) => {
    const endsAt = item?.endTime ? new Date(item.endTime) : null;
    const endsText = endsAt ? endsAt.toLocaleString() : '—';
    const isEnded = item?.isExpired || String(item?.status || '').toUpperCase() === 'ENDED';
    const isSeller = isAuthenticated && user?.id && item?.sellerId && user.id === item.sellerId;
    const isHighestBidder = isAuthenticated && user?.id && item?.highestBidder?.id && user.id === item.highestBidder.id;

    const canWhatsApp = isEnded && (isSeller || isHighestBidder);
    const waPhone = isSeller
      ? (item?.highestBidder?.whatsapp || item?.highestBidder?.phone)
      : (item?.seller?.whatsapp || item?.seller?.phone);

    return (
      <TouchableOpacity
        style={[styles.card, isEnded ? styles.cardEnded : styles.cardActive]}
        onPress={() => navigation.navigate('AuctionDetails', { auctionId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>{item.title || 'مزاد'}</Text>
          <Text style={[styles.badge, isEnded ? styles.badgeEnded : styles.badgeActive]}>{(item.status || 'ACTIVE').toString()}</Text>
        </View>

        <Text style={styles.subtitle} numberOfLines={2}>{item.description || '—'}</Text>

        <View style={styles.metaRow}>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>سعر ابتدائي</Text>
            <Text style={styles.priceValueRed}>{formatKwd(item.startingPrice ?? item.startingBid ?? item.startPrice)} د.ك</Text>
          </View>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>أعلى مزايد</Text>
            <Text style={styles.priceValueGreen}>{item?.highestBidder?.name || '—'}</Text>
          </View>
        </View>
        
        <View style={styles.currentBidContainer}>
          <Text style={styles.currentBidLabel}>سعر المزايدة الحالي</Text>
          <Text style={styles.currentBidValue}>{formatKwd(item.currentBid ?? item.highestBid ?? item.currentPrice)} د.ك</Text>
        </View>
        
        <Text style={styles.endTime}>ينتهي: {endsText}</Text>

        {canWhatsApp && !!waPhone && (
          <TouchableOpacity
            style={styles.waButton}
            onPress={() =>
              openWhatsApp({
                phone: waPhone,
                message: `${isSeller ? 'انا مهتم بإتمام البيع' : 'انا مهتم بإتمام الشراء'}\nمزاد: ${item?.title || ''}${APP_PROMO}`,
              })
            }
          >
            <Text style={styles.waButtonText}>واتساب</Text>
          </TouchableOpacity>
        )}
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
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'ACTIVE' && styles.filterButtonActiveGreen]}
          onPress={() => { setFilter('ACTIVE'); load(false, 'ACTIVE'); }}
        >
          <Text style={[styles.filterText, filter === 'ACTIVE' && styles.filterTextActive]}>نشط</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'ENDED' && styles.filterButtonActiveRed]}
          onPress={() => { setFilter('ENDED'); load(false, 'ENDED'); }}
        >
          <Text style={[styles.filterText, filter === 'ENDED' && styles.filterTextActive]}>منتهي</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, { marginRight: 0 }, filter === 'ALL' && styles.filterButtonActive]}
          onPress={() => { setFilter('ALL'); load(false, 'ALL'); }}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>الكل</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={auctions}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: 65 + insets.bottom + 20 }]}
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
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6 },
  filterButton: { flex: 1, backgroundColor: '#111', borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: '#333', alignItems: 'center', marginRight: 10 },
  filterButtonActive: { borderColor: '#DC2626', backgroundColor: '#1a1a1a' },
  filterButtonActiveGreen: { borderColor: '#16a34a', backgroundColor: '#16a34a' },
  filterButtonActiveRed: { borderColor: '#DC2626', backgroundColor: '#DC2626' },
  filterText: { color: '#aaa', fontWeight: 'bold' },
  filterTextActive: { color: '#fff' },
  list: { padding: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  errorText: { color: '#F87171', fontSize: 16, textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: '#DC2626', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  card: { 
    backgroundColor: '#1a1a1a', 
    borderRadius: 12, 
    padding: 16, 
    borderWidth: 2, 
    borderColor: '#333', 
    marginBottom: 12,
    overflow: 'hidden',
    width: '100%',
  },
  cardActive: { borderColor: '#16a34a' },
  cardEnded: { borderColor: '#DC2626', backgroundColor: '#2a1313' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  badge: { color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontSize: 11 },
  badgeActive: { backgroundColor: '#16a34a' },
  badgeEnded: { backgroundColor: '#DC2626' },
  subtitle: { color: '#aaa', fontSize: 13, marginBottom: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceColumn: { flex: 1 },
  priceLabel: { color: '#999', fontSize: 12, marginBottom: 4 },
  priceValueRed: { color: '#DC2626', fontSize: 16, fontWeight: 'bold' },
  priceValueGreen: { color: '#16a34a', fontSize: 14, fontWeight: '600' },
  currentBidContainer: { 
    backgroundColor: '#2a2a2a', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#FFD600',
    width: '100%',
    alignSelf: 'stretch',
  },
  currentBidLabel: { color: '#FFD600', fontSize: 13, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  currentBidValue: { color: '#FFD600', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  endTime: { color: '#DC2626', fontSize: 12, marginBottom: 4 },
  waButton: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#16a34a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  waButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyContainer: { paddingTop: 80, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});

export default AuctionsListScreen;
