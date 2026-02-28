import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';
import { StoreIcon } from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';

const StoresScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStores(false);

    const unsubscribe = navigation.addListener('focus', () => {
      fetchStores(true);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const canEdit = !!isAuthenticated && (user?.role === 'SHOP_OWNER' || user?.permissions?.canManageShop);
    navigation.setOptions({
      headerRight: canEdit
        ? () => (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigation.navigate('EditStore')}
            >
              <Text style={styles.headerBtnText}>تعديل محلي</Text>
            </TouchableOpacity>
          )
        : undefined,
    });
  }, [navigation, isAuthenticated, user?.role, user?.permissions?.canManageShop]);

  const fetchStores = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.USERS, {
        params: { role: 'SHOP_OWNER', status: 'ACTIVE', limit: 200 },
      });

      const payload = res.data;
      const users = Array.isArray(payload?.users) ? payload.users : [];

      const mapped = users.map((u) => ({
        id: u.id,
        name: u.shopName || u.name,
        address: u.shopAddress || 'العنوان غير محدد',
        image: u.shopImage || u.avatar || null,
        rating: typeof u.rating === 'number' ? u.rating : Number(u.rating || 0),
        productsCount: u.counts?.products ?? 0,
        verified: !!u.verified,
      }));

      setStores(mapped);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StoreCard = ({ item }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <TouchableOpacity
        style={styles.storeCard}
        onPress={() => navigation.navigate('StoreDetails', { storeId: item.id, title: item.name })}>
        <View style={styles.storeHeader}>
          <View style={styles.avatar}>
            {!imageError && item.image && typeof item.image === 'string' && item.image.trim() &&
             (item.image.startsWith('http') || item.image.startsWith('data:') || item.image.startsWith('/')) ? (
              <Image 
                source={{ 
                  uri: item.image.startsWith('http') || item.image.startsWith('data:')
                    ? item.image
                    : `https://www.q8sportcar.com${item.image}`
                }} 
                style={styles.avatarImage}
                onError={(e) => {
                  console.log('⚠️ StoresScreen: Image load error for', item.name);
                  setImageError(true);
                }}
              />
            ) : (
              <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'M'}</Text>
            )}
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{item.name}</Text>
            <Text style={styles.storeLocation}>📍 {item.address}</Text>
          </View>
          <StoreIcon size={24} color="#DC2626" />
        </View>
        <View style={styles.storeStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.productsCount || 0}</Text>
            <Text style={styles.statLabel}>منتج</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Number(item.rating || 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>⭐</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.verified ? '✓' : '—'}</Text>
            <Text style={styles.statLabel}>موثق</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStore = ({ item }) => <StoreCard item={item} />;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stores}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: 65 + insets.bottom + 20 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchStores(true)}
            tintColor="#DC2626"
            colors={["#DC2626"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <StoreIcon size={80} color="#666" />
            <Text style={styles.emptyText}>لا توجد محلات</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  list: {
    padding: 15,
  },
  headerBtn: {
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC2626',
    backgroundColor: '#0b0b0b',
  },
  headerBtnText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
  },
  storeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  storeLocation: {
    fontSize: 14,
    color: '#999',
  },
  storeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    marginTop: 20,
  },
});

export default StoresScreen;
