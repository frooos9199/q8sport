import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';
import { openWhatsApp } from '../../utils/whatsapp';

const MyRequestsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyRequests = useCallback(async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.REQUESTS_MY);
      const data = response.data;
      if (data?.success) {
        setRequests(data.requests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching my requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyRequests();
    });
    return unsubscribe;
  }, [navigation, fetchMyRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyRequests();
  };

  const handleDelete = (id) => {
    Alert.alert(
      'حذف الطلب',
      'هل أنت متأكد من حذف هذا الطلب؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.delete(API_CONFIG.ENDPOINTS.REQUEST_DETAILS(id));
              const data = response.data;

              if (data?.success) {
                setRequests(requests.filter(r => r.id !== id));
                Alert.alert('نجح', 'تم حذف الطلب بنجاح');
              } else {
                Alert.alert('خطأ', data.error || 'فشل حذف الطلب');
              }
            } catch (error) {
              console.error('Error deleting request:', error);
              const message = error?.response?.data?.error || 'حدث خطأ أثناء حذف الطلب';
              Alert.alert('خطأ', message);
            }
          },
        },
      ]
    );
  };

  const handleMarkAsFound = async (id) => {
    try {
      const response = await apiClient.patch(API_CONFIG.ENDPOINTS.REQUEST_DETAILS(id), {
        status: 'FOUND',
      });
      const data = response.data;

      if (data?.success) {
        fetchMyRequests();
        Alert.alert('نجح', 'تم تحديث حالة الطلب');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      const message = error?.response?.data?.error || 'حدث خطأ أثناء تحديث الطلب';
      Alert.alert('خطأ', message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#10B981';
      case 'FOUND':
        return '#3B82F6';
      case 'CANCELLED':
        return '#6B7280';
      default:
        return '#10B981';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'نشط';
      case 'FOUND':
        return 'تم الإيجاد';
      case 'CANCELLED':
        return 'ملغي';
      default:
        return 'نشط';
    }
  };

  const APP_PROMO = `\n\n—\nQ8 Sport Car 🏁\nحمّل التطبيق / زور الموقع: https://www.q8sportcar.com`;

  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <Text style={styles.requestDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {(item.carBrand || item.carModel || item.carYear) && (
          <View style={styles.carInfo}>
            <Ionicons name="car-outline" size={16} color="#999" />
            <Text style={styles.carInfoText}>
              {[item.carBrand, item.carModel, item.carYear].filter(Boolean).join(' • ')}
            </Text>
          </View>
        )}

        {!!(item?.user?.whatsapp || item?.user?.phone || item.contactWhatsapp || item.contactPhone || item.phone) && (
          <TouchableOpacity
            style={styles.phoneInfo}
            onPress={() =>
              openWhatsApp({
                phone: item?.user?.whatsapp || item?.user?.phone || item.contactWhatsapp || item.contactPhone || item.phone,
                message: `انا مهتم بطلب: ${item?.title || ''}${APP_PROMO}`,
              })
            }
          >
            <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
            <Text style={styles.phoneText}>
              {item?.user?.whatsapp || item?.user?.phone || item.contactWhatsapp || item.contactPhone || item.phone}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          {item.status === 'ACTIVE' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMarkAsFound(item.id)}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
              <Text style={[styles.actionButtonText, { color: '#10B981' }]}>
                تم الإيجاد
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
            <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="file-tray-outline" size={80} color="#DC2626" />
      <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
      <Text style={styles.emptyText}>لم تقم بإضافة أي طلبات بعد</Text>
      <Text style={styles.emptyHint}>استخدم زر (+) في الأسفل لإضافة طلب</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={requests.length === 0 ? styles.emptyList : [styles.list, { paddingBottom: 65 + insets.bottom + 20 }]}
        ListEmptyComponent={!loading && <EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
            colors={['#DC2626']}
          />
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
  list: {
    padding: 15,
  },
  emptyList: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  requestImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#0a0a0a',
  },
  requestContent: {
    padding: 15,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  requestTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  requestDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#0a0a0a',
    borderRadius: 6,
  },
  carInfoText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },
  phoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 8,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0a0a0a',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 30,
  },
  emptyHint: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: 'bold',
  },
});

export default MyRequestsScreen;
