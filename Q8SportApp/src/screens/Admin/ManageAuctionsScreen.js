import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';
import { getApiErrorMessage } from '../../utils/apiError';

const STATUS_OPTIONS = ['ACTIVE', 'ENDED', 'CANCELLED', 'DRAFT'];

const ManageAuctionsScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [usingPublicFallback, setUsingPublicFallback] = useState(false);
  const [warnedMissingAdminEndpoint, setWarnedMissingAdminEndpoint] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editBuyNow, setEditBuyNow] = useState('');

  const fetchAuctions = async () => {
    try {
      // Prefer admin endpoint (includes CANCELLED/DRAFT), but production may not have it.
      const adminRes = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_AUCTIONS, {
        params: {
          limit: 200,
          ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        },
      });

      setUsingPublicFallback(false);
      setItems(adminRes.data?.auctions || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);

      // If admin endpoint doesn't exist on the server (404), fall back to public auctions.
      if (error?.response?.status === 404) {
        try {
          const publicStatus = statusFilter === 'ACTIVE' || statusFilter === 'ENDED' ? statusFilter : undefined;
          const publicRes = await apiClient.get(API_CONFIG.ENDPOINTS.AUCTIONS, {
            params: {
              limit: 200,
              ...(publicStatus ? { status: publicStatus } : {}),
            },
          });

          setUsingPublicFallback(true);
          setItems(publicRes.data?.auctions || []);

          if (!warnedMissingAdminEndpoint) {
            setWarnedMissingAdminEndpoint(true);
            Alert.alert(
              'تنبيه',
              'سيرفر الإدارة للمزادات غير متوفر حالياً (404). سيتم عرض المزادات العامة فقط. يلزم تحديث/نشر السيرفر لإظهار CANCELLED/DRAFT.'
            );
          }
          return;
        } catch (fallbackError) {
          console.error('Error fetching public auctions fallback:', fallbackError);
          Alert.alert('خطأ', getApiErrorMessage(fallbackError, 'فشل تحميل المزادات'));
          setItems([]);
          return;
        }
      }

      Alert.alert('خطأ', getApiErrorMessage(error, 'فشل تحميل المزادات'));
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAuctions();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items || [])
      .filter((a) => (statusFilter === 'ALL' ? true : a.status === statusFilter))
      .filter((a) => {
        if (!q) return true;
        const haystack = [a.title, a.description, a.category, a.carModel, a.seller?.name || '']
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [items, search, statusFilter]);

  const openEdit = (auction) => {
    setEditing(auction);
    setEditTitle(auction?.title || '');
    setEditDescription(auction?.description || '');
    setEditStatus(auction?.status || 'ACTIVE');
    setEditBuyNow(
      auction?.buyNowPrice === null || auction?.buyNowPrice === undefined ? '' : String(auction.buyNowPrice)
    );
  };

  const closeEdit = () => {
    setEditing(null);
    setEditTitle('');
    setEditDescription('');
    setEditStatus('ACTIVE');
    setEditBuyNow('');
  };

  const saveEdit = async () => {
    if (!editing) return;

    if (!editTitle.trim() || !editDescription.trim()) {
      Alert.alert('تنبيه', 'العنوان والوصف مطلوبان');
      return;
    }

    try {
      await apiClient.put(API_CONFIG.ENDPOINTS.AUCTION_DETAILS(editing.id), {
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
        buyNowPrice: editBuyNow.trim() ? Number(editBuyNow.trim()) : null,
      });
      Alert.alert('تم', 'تم تحديث المزاد');
      closeEdit();
      fetchAuctions();
    } catch (error) {
      console.error('Error updating auction:', error);
      const msg = error?.response?.data?.error || 'فشل تحديث المزاد';
      Alert.alert('خطأ', msg);
    }
  };

  const stopAuction = (auctionId) => {
    Alert.alert('إيقاف المزاد', 'هل تريد إيقاف/إلغاء هذا المزاد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إيقاف',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.put(API_CONFIG.ENDPOINTS.AUCTION_DETAILS(auctionId), {
              status: 'CANCELLED',
            });
            Alert.alert('تم', 'تم إيقاف المزاد');
            fetchAuctions();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل إيقاف المزاد';
            Alert.alert('خطأ', msg);
          }
        },
      },
    ]);
  };

  const activateAuction = (auction) => {
    Alert.alert('تفعيل المزاد', 'هل تريد تفعيل هذا المزاد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تفعيل',
        onPress: async () => {
          try {
            const patch = { status: 'ACTIVE' };
            // If endTime already passed, extend it so it doesn't auto-end immediately
            const endTimeMs = auction?.endTime ? new Date(auction.endTime).getTime() : NaN;
            if (!Number.isFinite(endTimeMs) || endTimeMs <= Date.now()) {
              patch.endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            }

            await apiClient.put(API_CONFIG.ENDPOINTS.AUCTION_DETAILS(auction.id), patch);
            Alert.alert('تم', 'تم تفعيل المزاد');
            fetchAuctions();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل تفعيل المزاد';
            Alert.alert('خطأ', msg);
          }
        },
      },
    ]);
  };

  const deleteAuction = (auctionId) => {
    Alert.alert('حذف المزاد', 'هل تريد حذف هذا المزاد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(API_CONFIG.ENDPOINTS.AUCTION_DETAILS(auctionId));
            Alert.alert('تم', 'تم حذف المزاد');
            fetchAuctions();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل حذف المزاد';
            Alert.alert('خطأ', msg);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#10B981';
      case 'ENDED':
        return '#EF4444';
      case 'CANCELLED':
        return '#6B7280';
      case 'DRAFT':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderAuction = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.meta} numberOfLines={1}>
        البائع: {item?.seller?.name || '—'} • {item.category || '—'} • {item.carModel || '—'}
      </Text>

      <Text style={styles.desc} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.btnText}>✏️ تعديل</Text>
        </TouchableOpacity>
        {item.status === 'CANCELLED' ? (
          <TouchableOpacity style={styles.activateBtn} onPress={() => activateAuction(item)}>
            <Text style={styles.btnText}>✅ تفعيل</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={() => stopAuction(item.id)}>
            <Text style={styles.btnText}>⛔ إيقاف</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteAuction(item.id)}>
          <Text style={styles.btnText}>🗑 حذف</Text>
        </TouchableOpacity>
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="بحث في المزادات..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        {['ALL', 'ACTIVE', 'ENDED', 'CANCELLED'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, statusFilter === f && styles.filterButtonActive]}
            onPress={() => setStatusFilter(f)}>
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f === 'ALL'
                ? 'الكل'
                : f === 'ACTIVE'
                  ? 'نشط'
                  : f === 'ENDED'
                    ? 'منتهي'
                    : 'ملغي'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderAuction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد مزادات</Text>
          </View>
        }
      />

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={closeEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>تعديل المزاد</Text>

              <Text style={styles.label}>العنوان</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="عنوان المزاد"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="وصف المزاد"
                placeholderTextColor="#666"
                multiline
              />

              <Text style={styles.label}>الحالة</Text>
              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, editStatus === s && styles.statusBtnActive]}
                    onPress={() => setEditStatus(s)}>
                    <Text style={[styles.statusText, editStatus === s && styles.statusTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>سعر اشتر الآن (اختياري)</Text>
              <TextInput
                style={styles.input}
                value={editBuyNow}
                onChangeText={setEditBuyNow}
                placeholder="اتركه فارغ لإزالة السعر"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeEdit}>
                  <Text style={styles.btnText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                  <Text style={styles.btnText}>حفظ</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
  searchContainer: {
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterText: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: 12,
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  meta: {
    color: '#999',
    marginTop: 8,
    fontSize: 12,
  },
  desc: {
    color: '#ddd',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activateBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 15,
  },
  modalCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 15,
    maxHeight: '85%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    color: '#999',
    marginTop: 10,
    marginBottom: 6,
    fontSize: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusText: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default ManageAuctionsScreen;
