import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';

const MyProductsScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      console.log('Fetching products with token:', token ? 'Token exists' : 'No token');

      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_PRODUCTS);
      const data = response.data;
      console.log('Products received:', data?.products?.length || 0);
      setProducts(data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('خطأ', error?.response?.data?.error || 'حدث خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyProducts();
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'حذف المنتج',
      'هل أنت متأكد من حذف هذا المنتج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(productId));
              Alert.alert('تم', 'تم حذف المنتج بنجاح');
              fetchMyProducts();
            } catch (error) {
              Alert.alert('خطأ', error?.response?.data?.error || 'حدث خطأ في حذف المنتج');
            }
          },
        },
      ]
    );
  };

  const handleMarkAsSold = (productId) => {
    Alert.alert(
      'تأكيد البيع',
      'هل تريد تحديد هذا المنتج كمباع؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم، تم البيع',
          onPress: async () => {
            try {
              await apiClient.patch(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(productId), {
                status: 'sold',
              });
              Alert.alert('تم', 'تم تحديث حالة المنتج إلى مباع');
              fetchMyProducts();
            } catch (error) {
              Alert.alert('خطأ', error?.response?.data?.error || 'حدث خطأ في تحديث المنتج');
            }
          },
        },
      ]
    );
  };

  const parseImages = (images) => {
    try {
      if (!images) return null;
      
      // If already a URL string
      if (typeof images === 'string' && (images.startsWith('http') || images.startsWith('data:image'))) {
        return images;
      }
      
      // Try to parse JSON
      const parsed = JSON.parse(images);
      
      // Get first image from array
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing images:', error);
      return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'ACTIVE':
        return '#16A34A'; // Green
      case 'sold':
      case 'SOLD':
        return '#DC2626'; // Red
      case 'pending':
      case 'PENDING':
        return '#F59E0B'; // Orange
      default:
        return '#16A34A';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
      case 'ACTIVE':
        return 'نشط';
      case 'sold':
      case 'SOLD':
        return 'مباع';
      case 'pending':
      case 'PENDING':
        return 'معلق';
      default:
        return status || 'نشط';
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}>
      {item.images ? (
        <Image
          source={{ uri: parseImages(item.images) }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>{item.price.toFixed(3)} د.ك</Text>
        
        <View style={styles.productFooter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <View style={styles.viewsContainer}>
            <Text style={styles.viewsText}>👁 {item.views || 0}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProduct', { product: item })}>
            <Text style={styles.editButtonText}>✏️ تعديل</Text>
          </TouchableOpacity>
          
          {item.status !== 'sold' && item.status !== 'SOLD' && (
            <TouchableOpacity
              style={styles.soldButton}
              onPress={() => handleMarkAsSold(item.id)}>
              <Text style={styles.soldButtonText}>✓ تم البيع</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item.id)}>
          <Text style={styles.deleteButtonText}>🗑️ حذف</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>منتجاتي</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}>
          <Text style={styles.addButtonText}>+ إضافة منتج</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>لا توجد منتجات</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddProduct')}>
              <Text style={styles.emptyButtonText}>إضافة منتج جديد</Text>
            </TouchableOpacity>
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
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#2a2a2a',
  },
  placeholderImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    color: '#999',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  soldButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  soldButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
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
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyProductsScreen;
