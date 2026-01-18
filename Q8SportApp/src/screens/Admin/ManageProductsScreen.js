import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const ManageProductsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, {
        params: filter !== 'ALL' ? { status: filter } : undefined,
      });
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      await apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_APPROVE(productId));
      Alert.alert('تم', 'تم الموافقة على المنتج');
      fetchProducts();
    } catch (error) {
      Alert.alert('خطأ', 'فشل الموافقة على المنتج');
    }
  };

  const handleBlock = async (productId) => {
    Alert.alert('حظر المنتج', 'هل تريد حظر هذا المنتج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حظر',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_BLOCK(productId), {
              blocked: true,
            });
            Alert.alert('تم', 'تم حظر المنتج');
            fetchProducts();
          } catch (error) {
            Alert.alert('خطأ', 'فشل حظر المنتج');
          }
        },
      },
    ]);
  };

  const handleReject = async (productId) => {
    Alert.alert('رفض المنتج', 'هل تريد رفض هذا المنتج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'رفض',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(productId));
            Alert.alert('تم', 'تم رفض المنتج');
            fetchProducts();
          } catch (error) {
            Alert.alert('خطأ', 'فشل رفض المنتج');
          }
        },
      },
    ]);
  };

  const parseImages = (images) => {
    try {
      if (!images) return null;
      if (typeof images === 'string' && images.startsWith('http')) return images;
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : null;
    } catch {
      return null;
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      {item.images ? (
        <Image source={{ uri: parseImages(item.images) }} style={styles.productImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price} د.ك</Text>
        <Text style={styles.productSeller}>البائع: {item.seller?.name || '—'}</Text>
        <View style={styles.actions}>
          {item.status === 'PENDING' && (
            <>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApprove(item.id)}>
                <Text style={styles.buttonText}>✓ موافقة</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleReject(item.id)}>
                <Text style={styles.buttonText}>✕ رفض</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'ACTIVE' && (
            <TouchableOpacity style={styles.rejectButton} onPress={() => handleBlock(item.id)}>
              <Text style={styles.buttonText}>🚫 حظر</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}>
            <Text style={styles.buttonText}>👁 عرض</Text>
          </TouchableOpacity>
        </View>
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
      <View style={styles.filterContainer}>
        {['ALL', 'PENDING', 'ACTIVE'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'ALL' ? 'الكل' : f === 'PENDING' ? 'معلق' : 'نشط'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={products}
        renderItem={renderProduct}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  filterButton: {
    flex: 1,
    padding: 12,
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
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 15,
  },
  productCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#2a2a2a',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 60,
  },
  productInfo: {
    padding: 15,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#DC2626',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productSeller: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ManageProductsScreen;
