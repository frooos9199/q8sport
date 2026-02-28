import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuctionsService } from '../../services/api/auctions';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const MyAuctionsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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

  const handleDeleteAuction = (auctionId, auctionTitle) => {
    Alert.alert(
      'حذف المزاد',
      `هل أنت متأكد من حذف المزاد "${auctionTitle}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ محاولة حذف المزاد:', auctionId);
              const response = await apiClient.delete(API_CONFIG.ENDPOINTS.AUCTION_DETAILS(auctionId));
              
              console.log('✅ استجابة الحذف:', response.data);
              
              if (response.status === 200 || response.status === 204) {
                // ✅ تحديث القائمة محلياً
                setItems(prevItems => prevItems.filter(item => item.id !== auctionId));
                Alert.alert('✅ تم', 'تم حذف المزاد بنجاح');
              }
            } catch (error) {
              console.error('❌ خطأ في حذف المزاد:', error);
              Alert.alert('❌ خطأ', error?.response?.data?.error || error?.message || 'حدث خطأ في حذف المزاد');
            }
          },
        },
      ]
    );
  };

  const handleEditAuction = (auctionId) => {
    Alert.alert('قريباً', 'ميزة تعديل المزاد ستكون متاحة قريباً');
    // TODO: navigation.navigate('EditAuction', { auctionId });
  };

  const renderItem = ({ item }) => {
    const isEnded = item?.isExpired || String(item?.status || '').toUpperCase() === 'ENDED';
    return (
      <View style={styles.card}>
        <TouchableOpacity
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
        
        {/* أزرار التحكم */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditAuction(item.id)}
          >
            <Ionicons name="pencil" size={18} color="#3b82f6" />
            <Text style={styles.editButtonText}>تعديل</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAuction(item.id, item.title)}
          >
            <Ionicons name="trash" size={18} color="#DC2626" />
            <Text style={styles.deleteButtonText}>حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={items.length === 0 ? styles.emptyList : [styles.list, { paddingBottom: 65 + insets.bottom + 20 }]}
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
  primaryButton: { backgroundColor: '#DC2626', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold' },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7f1d1d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  deleteButtonText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyAuctionsScreen;
