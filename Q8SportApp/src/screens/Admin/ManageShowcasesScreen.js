import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';
import { parseImages } from '../../utils/jsonHelpers';

const ManageShowcasesScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [showcases, setShowcases] = useState([]);
  const [allShowcases, setAllShowcases] = useState([]);
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, ALL
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingShowcases();
  }, [filter]);

  const fetchPendingShowcases = async () => {
    try {
      console.log('🔍 Fetching showcases with token:', !!token);
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.SHOWCASES);
      console.log('✅ Showcases response:', res.data);
      const all = res.data.showcases || [];
      console.log('Total showcases:', all.length);
      console.log('PENDING:', all.filter(s => s.status === 'PENDING').length);
      console.log('APPROVED:', all.filter(s => s.status === 'APPROVED').length);
      setAllShowcases(all);
      
      if (filter === 'PENDING') {
        setShowcases(all.filter(s => s.status === 'PENDING'));
      } else if (filter === 'APPROVED') {
        setShowcases(all.filter(s => s.status === 'APPROVED'));
      } else {
        setShowcases(all);
      }
    } catch (error) {
      console.error('❌ Error fetching showcases:', error);
      console.error('Error response:', error?.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (item) => {
    Alert.alert(
      'الموافقة على العرض',
      'هل أنت متأكد من الموافقة على هذا العرض؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'موافقة',
          onPress: async () => {
            try {
              await apiClient.patch(`${API_CONFIG.ENDPOINTS.SHOWCASES}/${item.id}`, {
                status: 'APPROVED'
              });
              fetchPendingShowcases();
              Alert.alert('✅', 'تمت الموافقة على العرض بنجاح');
            } catch (error) {
              Alert.alert('خطأ', 'حدث خطأ أثناء الموافقة');
            }
          }
        }
      ]
    );
  };

  const handleReject = (id) => {
    Alert.alert(
      'رفض العرض',
      'هل أنت متأكد من رفض هذا العرض؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'رفض',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`${API_CONFIG.ENDPOINTS.SHOWCASES}/${id}`);
              fetchPendingShowcases();
              Alert.alert('❌', 'تم رفض العرض');
            } catch (error) {
              Alert.alert('خطأ', 'حدث خطأ أثناء الرفض');
            }
          }
        }
      ]
    );
  };

  const handleDelete = (id) => {
    Alert.alert(
      'حذف العرض',
      'هل أنت متأكد من حذف هذا العرض؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`${API_CONFIG.ENDPOINTS.SHOWCASES}/${id}`);
              fetchPendingShowcases();
              Alert.alert('✅', 'تم حذف العرض');
            } catch (error) {
              Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
            }
          }
        }
      ]
    );
  };

  const renderShowcase = ({ item }) => {
    const images = parseImages(item.images);
    const firstImage = images && images.length > 0 ? images[0] : null;
    
    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ShowcaseDetails', { showcase: item })}
          activeOpacity={0.9}>
          {firstImage ? (
            <Image 
              source={{ uri: firstImage }} 
              style={styles.cardImage}
              onError={(e) => console.log('⚠️ ManageShowcasesScreen: Image load error')}
            />
          ) : (
            <View style={[styles.cardImage, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#DC2626', fontSize: 40 }}>🚗</Text>
            </View>
          )}
          <View style={styles.previewBadge}>
            <Text style={styles.previewText}>👁️ معاينة</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.cardContent}>
          <View style={styles.userRow}>
            {item.user?.avatar && typeof item.user.avatar === 'string' && item.user.avatar.trim() &&
             (item.user.avatar.startsWith('http') || item.user.avatar.startsWith('data:') || item.user.avatar.startsWith('/')) ? (
              <Image 
                source={{ 
                  uri: item.user.avatar.startsWith('http') || item.user.avatar.startsWith('data:')
                    ? item.user.avatar
                    : `https://www.q8sportcar.com${item.user.avatar}`
                }} 
                style={styles.avatar}
                onError={(e) => console.log('⚠️ ManageShowcasesScreen: Avatar load error')}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#DC2626', fontSize: 14, fontWeight: 'bold' }}>
                  {item.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Text style={styles.userName}>{item.user.name}</Text>
          </View>

          <Text style={styles.carTitle}>
            {item.carBrand} {item.carModel} {item.carYear}
          </Text>

          {item.horsepower && (
            <Text style={styles.hp}>⚡ {item.horsepower} HP</Text>
          )}

          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.actions}>
            {item.status === 'PENDING' ? (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(item)}>
                  <Text style={styles.actionButtonText}>✓ موافقة</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(item.id)}>
                  <Text style={styles.actionButtonText}>✕ رفض</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id)}>
                <Text style={styles.actionButtonText}>🗑️ حذف</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 مراجعة العروض</Text>
        <Text style={styles.headerSubtitle}>
          {allShowcases.filter(s => s.status === 'PENDING').length} في انتظار الموافقة | {allShowcases.filter(s => s.status === 'APPROVED').length} معتمد
        </Text>
      </View>

      {/* فلاتر */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'PENDING' && styles.filterBtnActive]}
          onPress={() => setFilter('PENDING')}>
          <Text style={[styles.filterBtnText, filter === 'PENDING' && styles.filterBtnTextActive]}>
            ⏳ معلقة
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'APPROVED' && styles.filterBtnActive]}
          onPress={() => setFilter('APPROVED')}>
          <Text style={[styles.filterBtnText, filter === 'APPROVED' && styles.filterBtnTextActive]}>
            ✅ معتمدة
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]}
          onPress={() => setFilter('ALL')}>
          <Text style={[styles.filterBtnText, filter === 'ALL' && styles.filterBtnTextActive]}>
            📊 الكل
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={showcases}
        renderItem={renderShowcase}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPendingShowcases();
            }}
            tintColor="#DC2626"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>لا توجد عروض معلقة</Text>
            <Text style={styles.emptySubtext}>جميع العروض تمت مراجعتها</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#999',
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterBtnText: {
    color: '#999',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#2a2a2a',
  },
  previewBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  previewText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  carTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hp: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#DC2626',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
  },
});

export default ManageShowcasesScreen;
