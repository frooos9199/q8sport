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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const ManageUsersScreen = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_USERS);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <Text style={[styles.badge, item.role === 'ADMIN' && styles.adminBadge]}>
            {item.role}
          </Text>
          {(item.blocked ?? item.status !== 'ACTIVE') && <Text style={styles.blockedBadge}>محظور</Text>}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.blockButton, (item.blocked ?? item.status !== 'ACTIVE') && styles.unblockButton]}
        onPress={() => handleBlockUser(item.id, item.blocked ?? item.status !== 'ACTIVE')}>
        <Text style={styles.blockButtonText}>
          {(item.blocked ?? item.status !== 'ACTIVE') ? '✓ إلغاء الحظر' : '🚫 حظر'}
        </Text>
      </TouchableOpacity>
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
        />
      </View>
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
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
  userInfo: {
    marginBottom: 10,
  },
  userName: {
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
  blockButton: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  unblockButton: {
    backgroundColor: '#10B981',
  },
  blockButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ManageUsersScreen;
