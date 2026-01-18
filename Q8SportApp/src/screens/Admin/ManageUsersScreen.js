import React, { useState, useEffect } from 'react';
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

const ManageUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('USER');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (loading) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
        params: {
          limit: 200,
          ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
          ...(roleFilter !== 'ALL' ? { role: roleFilter } : {}),
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      });
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const openEdit = (user) => {
    setEditing(user);
    setEditName(user?.name || '');
    setEditRole(user?.role || 'USER');
    setEditStatus(user?.status || 'ACTIVE');
  };

  const closeEdit = () => {
    setEditing(null);
    setEditName('');
    setEditRole('USER');
    setEditStatus('ACTIVE');
  };

  const saveEdit = async () => {
    if (!editing) return;

    if (!editName.trim()) {
      Alert.alert('تنبيه', 'الاسم مطلوب');
      return;
    }

    try {
      await apiClient.put(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
        userId: editing.id,
        name: editName.trim(),
        role: editRole,
        status: editStatus,
      });
      Alert.alert('تم', 'تم تحديث المستخدم');
      closeEdit();
      fetchUsers();
    } catch (error) {
      const msg = error?.response?.data?.error || 'فشل تحديث المستخدم';
      Alert.alert('خطأ', msg);
    }
  };

  const handleBlockUser = (userId, isBlocked) => {
    Alert.alert(
      isBlocked ? 'إلغاء الحظر' : 'حظر المستخدم',
      `هل تريد ${isBlocked ? 'إلغاء حظر' : 'حظر'} هذا المستخدم؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          onPress: async () => {
            try {
              await apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN_USER_BLOCK(userId), {
                blocked: !isBlocked,
              });
              Alert.alert('تم', 'تم تحديث حالة المستخدم');
              fetchUsers();
            } catch (error) {
              Alert.alert('خطأ', 'فشل تحديث المستخدم');
            }
          },
        },
      ]
    );
  };

  const deleteUser = (userId) => {
    Alert.alert('حذف المستخدم', 'اختر الإجراء المطلوب:', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حظر نهائي',
        onPress: async () => {
          try {
            const res = await apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
              data: { userId },
            });
            Alert.alert('تم', res?.data?.message || 'تم حظر المستخدم');
            fetchUsers();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل حظر المستخدم';
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
            Alert.alert('تم', res?.data?.message || 'تم حذف المستخدم نهائياً');
            fetchUsers();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل حذف المستخدم نهائياً';
            Alert.alert('خطأ', msg);
          }
        },
      },
    ]);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

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

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.rowBetween}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>{item.status || '—'}</Text>
          </View>
        </View>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        <View style={styles.userMeta}>
          <Text style={[styles.badge, item.role === 'ADMIN' && styles.adminBadge]}>
            {item.role}
          </Text>
          {(item.blocked ?? item.status !== 'ACTIVE') && <Text style={styles.blockedBadge}>محظور</Text>}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.actionText}>✏️ تعديل</Text>
        </TouchableOpacity>
        {(item.blocked ?? item.status !== 'ACTIVE') ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.activateBtn]}
            onPress={() => handleBlockUser(item.id, true)}>
            <Text style={styles.actionText}>✅ تفعيل</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.stopBtn]}
            onPress={() => handleBlockUser(item.id, false)}>
            <Text style={styles.actionText}>⛔ إيقاف</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => deleteUser(item.id)}>
          <Text style={styles.actionText}>🗑 حذف</Text>
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
          placeholder="بحث عن مستخدم..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchUsers}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={fetchUsers}>
          <Text style={styles.searchBtnText}>بحث</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['ALL', 'ACTIVE', 'SUSPENDED'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]}
            onPress={() => setStatusFilter(s)}>
            <Text style={[styles.filterText, statusFilter === s && styles.filterTextActive]}>
              {s === 'ALL' ? 'الكل' : s === 'ACTIVE' ? 'نشط' : 'موقوف'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterRow}>
        {['ALL', 'USER', 'ADMIN'].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.filterBtn, roleFilter === r && styles.filterBtnActive]}
            onPress={() => setRoleFilter(r)}>
            <Text style={[styles.filterText, roleFilter === r && styles.filterTextActive]}>
              {r === 'ALL' ? 'الكل' : r === 'USER' ? 'مستخدم' : 'أدمن'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />}
      />

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={closeEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>تعديل المستخدم</Text>

              <Text style={styles.label}>الاسم</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="اسم المستخدم"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>الدور</Text>
              <View style={styles.chipsRow}>
                {['USER', 'ADMIN'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.chip, editRole === r && styles.chipActive]}
                    onPress={() => setEditRole(r)}>
                    <Text style={[styles.chipText, editRole === r && styles.chipTextActive]}>
                      {r === 'USER' ? 'مستخدم' : 'أدمن'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>الحالة</Text>
              <View style={styles.chipsRow}>
                {['ACTIVE', 'SUSPENDED'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, editStatus === s && styles.chipActive]}
                    onPress={() => setEditStatus(s)}>
                    <Text style={[styles.chipText, editStatus === s && styles.chipTextActive]}>
                      {s === 'ACTIVE' ? 'نشط' : 'موقوف'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={closeEdit}>
                  <Text style={styles.actionText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={saveEdit}>
                  <Text style={styles.actionText}>حفظ</Text>
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
  list: {
    padding: 15,
  },
  userCard: {
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
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  adminBadge: {
    backgroundColor: '#DC2626',
  },
  blockedBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 12,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterBtnActive: {
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

  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: '#EF4444',
  },
  activateBtn: {
    backgroundColor: '#10B981',
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginBottom: 4,
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
  cancelBtn: {
    backgroundColor: '#374151',
  },
  saveBtn: {
    backgroundColor: '#10B981',
  },
});

export default ManageUsersScreen;
