import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { AuctionsService } from '../../services/api/auctions';

const AuctionDetailsScreen = ({ route, navigation }) => {
  const auctionId = route?.params?.auctionId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auction, setAuction] = useState(null);
  const [bid, setBid] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentBid = useMemo(() => {
    const v = auction?.currentBid ?? auction?.highestBid ?? auction?.currentPrice ?? auction?.startingPrice ?? auction?.startingBid ?? auction?.startPrice;
    return typeof v === 'number' ? v : v ? Number(v) : null;
  }, [auction]);

  const formatKwd = useCallback((value) => {
    const n = typeof value === 'number' ? value : value ? Number(value) : null;
    if (!Number.isFinite(n)) return '—';
    return String(Math.trunc(n));
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await AuctionsService.getAuctionDetails(auctionId);
      setAuction(data?.auction || data);

      const title = data?.auction?.title || data?.title || 'تفاصيل المزاد';
      navigation.setOptions({ title });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل المزاد');
    } finally {
      setLoading(false);
    }
  }, [auctionId, navigation]);

  useEffect(() => {
    if (!auctionId) {
      setLoading(false);
      setError('معرف المزاد غير صحيح');
      return;
    }
    load();
  }, [auctionId, load]);

  const onSubmitBid = async () => {
    const amount = Number(bid);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('تنبيه', 'أدخل مبلغ مزايدة صحيح');
      return;
    }

    if (currentBid != null && amount <= currentBid) {
      Alert.alert('تنبيه', 'يجب أن تكون المزايدة أعلى من المبلغ الحالي');
      return;
    }

    try {
      setSubmitting(true);
      await AuctionsService.placeBid(auctionId, amount);
      setBid('');
      Alert.alert('تم', 'تم إرسال المزايدة بنجاح');
      await load();
    } catch (e) {
      Alert.alert('خطأ', e instanceof Error ? e.message : 'فشل إرسال المزايدة');
    } finally {
      setSubmitting(false);
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const endsAt = auction?.endTime ? new Date(auction.endTime).toLocaleString() : '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{auction?.title || 'مزاد'}</Text>
        <Text style={styles.subtitle}>{auction?.description || '—'}</Text>

        <View style={styles.row}>
          <Text style={styles.meta}>الحالة: {String(auction?.status || 'ACTIVE')}</Text>
          <Text style={styles.meta}>ينتهي: {endsAt}</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.price}>أعلى مزايدة: {formatKwd(auction?.currentBid ?? auction?.highestBid ?? auction?.currentPrice)} د.ك</Text>
        <Text style={styles.meta}>أعلى مزايد: {auction?.highestBidder?.name || '—'}</Text>
        <Text style={styles.meta}>سعر ابتدائي: {formatKwd(auction?.startingPrice ?? auction?.startingBid ?? auction?.startPrice)} د.ك</Text>
      </View>

      <View style={styles.bidsCard}>
        <Text style={styles.bidsTitle}>المزايدات</Text>
        {Array.isArray(auction?.bids) && auction.bids.length > 0 ? (
          auction.bids.slice(0, 10).map((b) => (
            <View key={b.id} style={styles.bidItem}>
              <Text style={styles.bidName}>{b?.bidder?.name || '—'}</Text>
              <Text style={styles.bidAmount}>{formatKwd(b?.amount)} د.ك</Text>
            </View>
          ))
        ) : (
          <Text style={styles.meta}>لا توجد مزايدات بعد</Text>
        )}
      </View>

      <View style={styles.bidCard}>
        <Text style={styles.bidTitle}>إضافة مزايدة</Text>
        <View style={styles.bidRow}>
          <TextInput
            value={bid}
            onChangeText={setBid}
            placeholder="مثال: 25"
            placeholderTextColor="#666"
            keyboardType="numeric"
            style={styles.input}
          />
          <TouchableOpacity
            style={[styles.bidButton, submitting && styles.bidButtonDisabled]}
            onPress={onSubmitBid}
            disabled={submitting}
          >
            <Text style={styles.bidButtonText}>{submitting ? '...' : 'إرسال'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  errorText: { color: '#F87171', fontSize: 16, textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: '#DC2626', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#aaa', fontSize: 13, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { color: '#999', fontSize: 12 },
  separator: { height: 1, backgroundColor: '#333', marginVertical: 12 },
  price: { color: '#DC2626', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  bidCard: { backgroundColor: '#111', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333' },
  bidTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  bidRow: { flexDirection: 'row' },
  input: { flex: 1, backgroundColor: '#0b0b0b', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', borderWidth: 1, borderColor: '#333', marginRight: 10 },
  bidButton: { backgroundColor: '#DC2626', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  bidButtonDisabled: { opacity: 0.6 },
  bidButtonText: { color: '#fff', fontWeight: 'bold' },

  bidsCard: { backgroundColor: '#111', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  bidsTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  bidItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  bidName: { color: '#ddd', fontSize: 13, flex: 1, marginRight: 10 },
  bidAmount: { color: '#DC2626', fontSize: 13, fontWeight: 'bold' },
});

export default AuctionDetailsScreen;
