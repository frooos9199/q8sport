import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';

const RequestsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.REQUESTS);
      const data = response.data;
      
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const normalizePhone = (phone) => {
    if (!phone) return null;
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 8) return `965${digits}`;
    return digits;
  };

  const openWhatsApp = async (phone) => {
    const normalized = normalizePhone(phone);
    if (!normalized) return;
    const url = `https://wa.me/${normalized}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
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

  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.requestImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <Text style={styles.requestDescription} numberOfLines={3}>
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

        <View style={styles.requestFooter}>
          <View style={styles.userInfo}>
            {item.user.avatar ? (
              <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Ionicons name="person" size={16} color="#DC2626" />
              </View>
            )}
            <Text style={styles.userName}>{item.user.name}</Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => openWhatsApp(item.contactWhatsapp || item.contactPhone || item.phone)}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.callButtonText}>واتساب</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../../../assets/images/icon.png')}
        style={styles.emptyLogo}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>لا توجد طلبات حالياً</Text>
      <Text style={styles.emptyText}>كن أول من يضيف طلب</Text>
      <TouchableOpacity
        style={styles.emptyAddButton}
        onPress={() => navigation.navigate('AddRequest')}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.emptyAddText}>أضف طلبك الأول</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المطلوب</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddRequest')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={requests.length === 0 ? styles.emptyList : styles.list}
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
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#DC2626',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  requestImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#0a0a0a',
  },
  requestContent: {
    padding: 16,
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
    fontWeight: '700',
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
    color: '#aaa',
    lineHeight: 20,
    marginBottom: 12,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  carInfoText: {
    fontSize: 13,
    color: '#888',
    marginLeft: 8,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callButtonText: {
    color: '#fff',
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
  emptyLogo: {
    width: 120,
    height: 120,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RequestsScreen;
