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
  RefreshControl,
} from 'react-native';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'SUSPENDED', 'BANNED'];

const ManageShopsScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showAdd, setShowAdd] = useState(false);
  const [addShopName, setAddShopName] = useState('');
  const [addOwnerName, setAddOwnerName] = useState('');
  const [addOwnerEmail, setAddOwnerEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addWhatsapp, setAddWhatsapp] = useState('');
  const [addBusinessType, setAddBusinessType] = useState('');
  const [addAddress, setAddAddress] = useState('');

  const [editing, setEditing] = useState(null);
  const [editShopName, setEditShopName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editOwnerPhone, setEditOwnerPhone] = useState('');
  const [editOwnerWhatsapp, setEditOwnerWhatsapp] = useState('');
  const [editBusinessType, setEditBusinessType] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  const fetchShops = async () => {
    try {
      const params = {
        role: 'SHOP_OWNER',
        limit: 200,
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      };

      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_USERS, { params });
      setItems(res.data?.users || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
      const msg = error?.response?.data?.error || 'فشل تحميل المحلات';
      Alert.alert('خطأ', msg);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShops();
  };

  const filteredLocal = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return (items || []).filter((u) => {
      const haystack = [
        u.shopName || '',
        u.shopAddress || '',
        u.businessType || '',
        u.name || '',
        u.email || '',
        u.phone || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const openEdit = (user) => {
    setEditing(user);
    setEditShopName(user?.shopName || '');
    setEditOwnerName(user?.name || '');
    setEditOwnerEmail(user?.email || '');
    setEditOwnerPhone(user?.phone || '');
    setEditOwnerWhatsapp(user?.whatsapp || '');
    setEditBusinessType(user?.businessType || '');
    setEditAddress(user?.shopAddress || '');
    setEditStatus(user?.status || 'ACTIVE');
  };

  const closeEdit = () => {
    setEditing(null);
    setEditShopName('');
    setEditOwnerName('');
    setEditOwnerEmail('');
    setEditOwnerPhone('');
    setEditOwnerWhatsapp('');
    setEditBusinessType('');
    setEditAddress('');
    setEditStatus('ACTIVE');
  };

  const saveEdit = async () => {
    if (!editing) return;

    if (!editShopName.trim() || !editOwnerName.trim() || !editOwnerEmail.trim()) {
      Alert.alert('تنبيه', 'اسم المحل واسم المالك والبريد مطلوبين');
      return;
    }

    try {
      await apiClient.put(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
        userId: editing.id,
        name: editOwnerName.trim(),
        email: editOwnerEmail.trim(),
        phone: editOwnerPhone.trim() ? editOwnerPhone.trim() : null,
        whatsapp: editOwnerWhatsapp.trim() ? editOwnerWhatsapp.trim() : null,
        role: 'SHOP_OWNER',
        status: editStatus,
        shopName: editShopName.trim(),
        shopAddress: editAddress.trim() ? editAddress.trim() : null,
        businessType: editBusinessType.trim() ? editBusinessType.trim() : null,
      });
      Alert.alert('تم', 'تم تحديث بيانات المحل');
      closeEdit();
      fetchShops();
    } catch (error) {
      const msg = error?.response?.data?.error || 'فشل تحديث المحل';
      Alert.alert('خطأ', msg);
    }
  };

  const toggleBlock = (userId, isBlocked) => {
    Alert.alert(isBlocked ? 'تفعيل المحل' : 'إيقاف المحل', 'هل تريد المتابعة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: isBlocked ? 'تفعيل' : 'إيقاف',
        style: isBlocked ? 'default' : 'destructive',
        onPress: async () => {
          try {
            await apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN_USER_BLOCK(userId), {
              blocked: !isBlocked,
            });
            Alert.alert('تم', 'تم تحديث حالة المحل');
            fetchShops();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل تحديث حالة المحل';
            Alert.alert('خطأ', msg);
          }
        },
      },
    ]);
  };

  const deleteShopUser = (userId) => {
    Alert.alert('حذف المحل', 'اختر الإجراء المطلوب:', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حظر نهائي',
        onPress: async () => {
          try {
            const res = await apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
              data: { userId },
            });
            Alert.alert('تم', res?.data?.message || 'تم حظر المحل');
            fetchShops();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل حظر المحل';
            Alert.alert('خطأ', msg);
          }
        },
      },
      {
        text: 'حذف نهائي',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
              data: { userId, hardDelete: true },
            });
            Alert.alert('تم', res?.data?.message || 'تم حذف المحل نهائياً');
            fetchShops();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل حذف المحل نهائياً';
            Alert.alert('خطأ', msg);
          }
        },
      },
    ]);
  };

  const openAdd = () => {
    setShowAdd(true);
    setAddShopName('');
    setAddOwnerName('');
    setAddOwnerEmail('');
    setAddPassword('');
    setAddPhone('');
    setAddWhatsapp('');
    setAddBusinessType('');
    setAddAddress('');
  };

  const closeAdd = () => {
    setShowAdd(false);
  };

  const createShop = async () => {
    if (!addShopName.trim() || !addOwnerName.trim() || !addOwnerEmail.trim()) {
      Alert.alert('تنبيه', 'اسم المحل واسم المالك والبريد مطلوبين');
      return;
    }
    if (!addPassword || String(addPassword).length < 6) {
      Alert.alert('تنبيه', 'كلمة المرور يجب أن تكون 6 أحرف/أرقام على الأقل');
      return;
    }

    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
        name: addOwnerName.trim(),
        email: addOwnerEmail.trim(),
        password: addPassword,
        phone: addPhone.trim() ? addPhone.trim() : null,
        whatsapp: addWhatsapp.trim() ? addWhatsapp.trim() : (addPhone.trim() ? addPhone.trim() : null),
        role: 'SHOP_OWNER',
        shopName: addShopName.trim(),
        shopAddress: addAddress.trim() ? addAddress.trim() : null,
        businessType: addBusinessType.trim() ? addBusinessType.trim() : null,
      });

      Alert.alert('تم', 'تم إضافة المحل');
      closeAdd();
      fetchShops();
    } catch (error) {
      const msg = error?.response?.data?.error || 'فشل إضافة المحل';
      Alert.alert('خطأ', msg);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#10B981';
      case 'SUSPENDED':
        return '#EF4444';
      case 'BANNED':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const renderItem = ({ item }) => {
    const isBlocked = item?.status !== 'ACTIVE';

    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title} numberOfLines={1}>
            {item.shopName || '—'}
          </Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status || '—'}</Text>
          </View>
        </View>

        <Text style={styles.meta} numberOfLines={2}>
          المالك: {item.name || '—'} • {item.email || '—'}
          {item.shopAddress ? `\nالعنوان: ${item.shopAddress}` : ''}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
            <Text style={styles.btnText}>✏️ تعديل</Text>
          </TouchableOpacity>
          {isBlocked ? (
            <TouchableOpacity style={styles.activateBtn} onPress={() => toggleBlock(item.id, true)}>
              <Text style={styles.btnText}>✅ تفعيل</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={() => toggleBlock(item.id, false)}>
              <Text style={styles.btnText}>⛔ إيقاف</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteShopUser(item.id)}>
            <Text style={styles.btnText}>🗑 حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          placeholder="بحث في المحلات..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchShops}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={fetchShops}>
          <Text style={styles.searchBtnText}>بحث</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topRow}>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.btnText}>➕ إضافة محل</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, statusFilter === f && styles.filterButtonActive]}
            onPress={() => setStatusFilter(f)}>
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f === 'ALL' ? 'الكل' : f === 'ACTIVE' ? 'نشط' : f === 'SUSPENDED' ? 'موقوف' : 'محظور'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredLocal}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد محلات</Text>
          </View>
        }
      />

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={closeEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>تعديل المحل</Text>

              <Text style={styles.label}>اسم المحل</Text>
              <TextInput
                style={styles.input}
                value={editShopName}
                onChangeText={setEditShopName}
                placeholder="اسم المحل"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>اسم المالك</Text>
              <TextInput
                style={styles.input}
                value={editOwnerName}
                onChangeText={setEditOwnerName}
                placeholder="اسم المالك"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>البريد</Text>
              <TextInput
                style={styles.input}
                value={editOwnerEmail}
                onChangeText={setEditOwnerEmail}
                placeholder="email@example.com"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />

              <Text style={styles.label}>الهاتف</Text>
              <TextInput
                style={styles.input}
                value={editOwnerPhone}
                onChangeText={setEditOwnerPhone}
                placeholder="965..."
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>الواتساب</Text>
              <TextInput
                style={styles.input}
                value={editOwnerWhatsapp}
                onChangeText={setEditOwnerWhatsapp}
                placeholder="965..."
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>نوع النشاط</Text>
              <TextInput
                style={styles.input}
                value={editBusinessType}
                onChangeText={setEditBusinessType}
                placeholder="مثال: محل قطع"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>العنوان</Text>
              <TextInput
                style={styles.input}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="عنوان المحل"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>الحالة</Text>
              <View style={styles.chipsRow}>
                {['ACTIVE', 'SUSPENDED', 'BANNED'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, editStatus === s && styles.chipActive]}
                    onPress={() => setEditStatus(s)}>
                    <Text style={[styles.chipText, editStatus === s && styles.chipTextActive]}>
                      {s === 'ACTIVE' ? 'نشط' : s === 'SUSPENDED' ? 'موقوف' : 'محظور'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={closeEdit}>
                  <Text style={styles.btnText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveEdit}>
                  <Text style={styles.btnText}>حفظ</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={closeAdd}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>إضافة محل</Text>

              <Text style={styles.label}>اسم المحل</Text>
              <TextInput
                style={styles.input}
                value={addShopName}
                onChangeText={setAddShopName}
                placeholder="اسم المحل"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>اسم المالك</Text>
              <TextInput
                style={styles.input}
                value={addOwnerName}
                onChangeText={setAddOwnerName}
                placeholder="اسم المالك"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>البريد</Text>
              <TextInput
                style={styles.input}
                value={addOwnerEmail}
                onChangeText={setAddOwnerEmail}
                placeholder="email@example.com"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />

              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput
                style={styles.input}
                value={addPassword}
                onChangeText={setAddPassword}
                placeholder="******"
                placeholderTextColor="#666"
                secureTextEntry
              />

              <Text style={styles.label}>الهاتف</Text>
              <TextInput
                style={styles.input}
                value={addPhone}
                onChangeText={setAddPhone}
                placeholder="965..."
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>الواتساب</Text>
              <TextInput
                style={styles.input}
                value={addWhatsapp}
                onChangeText={setAddWhatsapp}
                placeholder="965..."
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>نوع النشاط</Text>
              <TextInput
                style={styles.input}
                value={addBusinessType}
                onChangeText={setAddBusinessType}
                placeholder="مثال: محل قطع"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>العنوان</Text>
              <TextInput
                style={styles.input}
                value={addAddress}
                onChangeText={setAddAddress}
                placeholder="عنوان المحل"
                placeholderTextColor="#666"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={closeAdd}>
                  <Text style={styles.btnText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={createShop}>
                  <Text style={styles.btnText}>إضافة</Text>
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
  topRow: {
    paddingHorizontal: 15,
    paddingTop: 12,
  },
  addBtn: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
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
    fontSize: 18,
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
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activateBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
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
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  chipText: {
    color: '#999',
    fontWeight: 'bold',
  },
  chipTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#374151',
  },
  saveBtn: {
    backgroundColor: '#10B981',
  },
});

export default ManageShopsScreen;
