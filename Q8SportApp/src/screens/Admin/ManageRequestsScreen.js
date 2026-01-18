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

const STATUS_OPTIONS = ['ACTIVE', 'FULFILLED', 'EXPIRED', 'CANCELLED'];

const ManageRequestsScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_REQUESTS, {
        params: {
          limit: 200,
          ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      });

      setItems(res.data?.requests || []);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      const msg = error?.response?.data?.error || 'فشل تحميل المطلوبات';
      Alert.alert('خطأ', msg);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const filteredLocal = useMemo(() => {
    // Server already filters by search; this keeps UI responsive while typing.
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return (items || []).filter((r) => {
      const haystack = [r.title, r.description, r.category, r.partName || '', r.user?.name || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const openEdit = (req) => {
    setEditing(req);
    setEditTitle(req?.title || '');
    setEditDescription(req?.description || '');
    setEditStatus(req?.status || 'ACTIVE');
    setEditPhone(req?.contactPhone || '');
    setEditWhatsapp(req?.contactWhatsapp || '');
  };

  const closeEdit = () => {
    setEditing(null);
    setEditTitle('');
    setEditDescription('');
    setEditStatus('ACTIVE');
    setEditPhone('');
    setEditWhatsapp('');
  };

  const saveEdit = async () => {
    if (!editing) return;

    if (!editTitle.trim() || !editDescription.trim()) {
      Alert.alert('تنبيه', 'العنوان والوصف مطلوبان');
      return;
    }

    try {
      await apiClient.patch(`/requests/${editing.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
        contactPhone: editPhone.trim() ? editPhone.trim() : null,
        contactWhatsapp: editWhatsapp.trim() ? editWhatsapp.trim() : null,
      });
      Alert.alert('تم', 'تم تحديث الطلب');
      closeEdit();
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      const msg = error?.response?.data?.error || 'فشل تحديث الطلب';
      Alert.alert('خطأ', msg);
    }
  };

  const stopRequest = (requestId) => {
    Alert.alert('إيقاف الطلب', 'هل تريد إيقاف هذا الطلب؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إيقاف',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.patch(`/requests/${requestId}`, {
              status: 'CANCELLED',
            });
            Alert.alert('تم', 'تم إيقاف الطلب');
            fetchRequests();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل إيقاف الطلب';
            Alert.alert('خطأ', msg);
          }
        },
      },
    ]);
  };

  const activateRequest = (requestId) => {
    Alert.alert('تفعيل الطلب', 'هل تريد تفعيل هذا الطلب؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تفعيل',
        onPress: async () => {
          try {
            await apiClient.patch(`/requests/${requestId}`, {
              status: 'ACTIVE',
            });
            Alert.alert('تم', 'تم تفعيل الطلب');
            fetchRequests();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل تفعيل الطلب';
            Alert.alert('خطأ', msg);
          }
        },
      },
    ]);
  };

  const deleteRequest = (requestId) => {
    Alert.alert('حذف الطلب', 'هل تريد حذف هذا الطلب؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/requests/${requestId}`);
            Alert.alert('تم', 'تم حذف الطلب');
            fetchRequests();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل حذف الطلب';
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
      case 'FULFILLED':
        return '#3B82F6';
      case 'EXPIRED':
        return '#6B7280';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderItem = ({ item }) => (
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
        صاحب الطلب: {item?.user?.name || '—'} • {item.category || '—'}
      </Text>

      <Text style={styles.desc} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.btnText}>✏️ تعديل</Text>
        </TouchableOpacity>
        {item.status === 'CANCELLED' ? (
          <TouchableOpacity style={styles.activateBtn} onPress={() => activateRequest(item.id)}>
            <Text style={styles.btnText}>✅ تفعيل</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={() => stopRequest(item.id)}>
            <Text style={styles.btnText}>⛔ إيقاف</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteRequest(item.id)}>
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
          placeholder="بحث في المطلوبات..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchRequests}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={fetchRequests}>
          <Text style={styles.searchBtnText}>بحث</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {['ALL', 'ACTIVE', 'FULFILLED', 'EXPIRED', 'CANCELLED'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, statusFilter === f && styles.filterButtonActive]}
            onPress={() => setStatusFilter(f)}>
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f === 'ALL'
                ? 'الكل'
                : f === 'ACTIVE'
                  ? 'نشط'
                  : f === 'FULFILLED'
                    ? 'تم'
                    : f === 'EXPIRED'
                      ? 'منتهي'
                      : 'ملغي'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredLocal}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد مطلوبات</Text>
          </View>
        }
      />

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={closeEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>تعديل الطلب</Text>

              <Text style={styles.label}>العنوان</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="عنوان الطلب"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="وصف الطلب"
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

              <Text style={styles.label}>رقم التواصل</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="965..."
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>واتساب</Text>
              <TextInput
                style={styles.input}
                value={editWhatsapp}
                onChangeText={setEditWhatsapp}
                placeholder="965..."
                placeholderTextColor="#666"
                keyboardType="phone-pad"
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
    flexDirection: 'row',
    gap: 10,
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
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

export default ManageRequestsScreen;
