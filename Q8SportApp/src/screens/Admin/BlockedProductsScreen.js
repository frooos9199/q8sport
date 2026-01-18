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
  TextInput,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const BlockedProductsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBlockedProducts();
  }, []);

  const fetchBlockedProducts = async () => {
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_BLOCKED_PRODUCTS);
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlockedProducts();
  };

  const filteredLocal = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return (products || []).filter((p) => {
      const haystack = [p.title, p.description, p.blockReason, p.seller?.name || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, search]);

  const handleUnblock = async (productId) => {
    Alert.alert('إلغاء الحظر', 'هل تريد إلغاء حظر هذا المنتج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'نعم',
        onPress: async () => {
          try {
            await apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_UNBLOCK(productId));
            Alert.alert('تم', 'تم إلغاء حظر المنتج');
            fetchBlockedProducts();
          } catch (error) {
            Alert.alert('خطأ', 'فشل إلغاء الحظر');
          }
        },
      },
    ]);
  };

  const deleteProductForever = (productId) => {
    Alert.alert('حذف نهائي', 'هل تريد حذف هذا المنتج نهائياً؟ لا يمكن التراجع.', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف نهائي',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_DELETE(productId));
            Alert.alert('تم', 'تم حذف المنتج نهائياً');
            fetchBlockedProducts();
          } catch (error) {
            const msg = error?.response?.data?.error || 'فشل حذف المنتج نهائياً';
            Alert.alert('خطأ', msg);
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
        <Text style={styles.productSeller}>البائع: {item.seller?.name}</Text>
        <Text style={styles.blockReason}>السبب: {item.blockReason || 'تم إيقاف المنتج'}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.unblockButton}
            onPress={() => handleUnblock(item.id)}>
            <Text style={styles.buttonText}>✓ إلغاء الحظر</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteProductForever(item.id)}>
            <Text style={styles.buttonText}>🗑 حذف نهائي</Text>
          </TouchableOpacity>
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="بحث في المنتجات المحظورة..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filteredLocal}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>لا توجد منتجات محظورة</Text>
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
    borderWidth: 1,
    borderColor: '#333',
  },
  productCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#DC2626',
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
    marginBottom: 5,
  },
  blockReason: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  unblockButton: {
    flex: 1,
    backgroundColor: '#10B981',
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
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
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
    color: '#999',
    fontSize: 18,
  },
});

export default BlockedProductsScreen;
