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
import { parseImages } from '../../utils/jsonHelpers';

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
      console.log('📥 جلب المنتجات من API...');
      console.log('🔐 Token موجود:', token ? 'نعم' : 'لا');

      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_PRODUCTS);
      const data = response.data;
      
      console.log('📊 عدد المنتجات المستلمة (قبل الفلترة):', data?.products?.length || 0);
      
      // 🔍 فحص البيانات الفعلية للمنتجات
      if (data?.products?.length > 0) {
        console.log('🔍 فحص أول منتج:', {
          id: data.products[0].id,
          status: data.products[0].status,
          deletedAt: data.products[0].deletedAt,
          isDeleted: data.products[0].isDeleted,
          title: data.products[0].title
        });
      }
      
      // ✅ فلترة المنتجات المحذوفة (soft delete) - بشرط أن deletedAt ليس undefined
      const activeProducts = (data?.products || []).filter(product => {
        const hasDeletedAtField = product.deletedAt !== undefined;
        const isDeleted = 
          product.status === 'DELETED' || 
          (hasDeletedAtField && product.deletedAt !== null) || 
          product.isDeleted === true;
        
        if (isDeleted) {
          console.log('🗑️ تم تجاهل منتج محذوف:', product.id, {
            status: product.status,
            deletedAt: product.deletedAt,
            isDeleted: product.isDeleted
          });
        }
        
        return !isDeleted;
      });
      
      console.log('✅ عدد المنتجات النشطة (بعد الفلترة):', activeProducts.length);
      
      if (activeProducts.length > 0) {
        console.log('🆔 معرفات المنتجات النشطة:', activeProducts.map(p => p.id));
      }
      
      setProducts(activeProducts);
    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات:', error);
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
              console.log('🗑️ محاولة حذف المنتج:', productId);
              console.log('🔗 DELETE endpoint:', API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(productId));
              
              const response = await apiClient.delete(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(productId));
              
              console.log('✅ استجابة الحذف:', response.data);
              console.log('📊 Status:', response.status);
              
              // ✅ تحديث القائمة محلياً فقط إذا نجح الحذف من API
              if (response.status === 200 || response.status === 204) {
                setProducts(prevProducts => 
                  prevProducts.filter(product => product.id !== productId)
                );
                Alert.alert('✅ تم', 'تم حذف المنتج بنجاح');
              } else {
                console.warn('⚠️ استجابة غير متوقعة:', response.status);
                Alert.alert('⚠️ تحذير', 'قد لا يكون الحذف قد اكتمل. يرجى التحقق.');
              }
            } catch (error) {
              console.error('❌ خطأ في حذف المنتج:', error);
              console.error('📋 تفاصيل الخطأ:', error?.response?.data);
              console.error('🔢 Status code:', error?.response?.status);
              
              Alert.alert('❌ خطأ', error?.response?.data?.error || error?.message || 'حدث خطأ في حذف المنتج');
              
              // عكس الحذف المحلي إذا فشل
              fetchMyProducts();
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
              
              // ✅ تحديث حالة المنتج محلياً فوراً
              setProducts(prevProducts =>
                prevProducts.map(product =>
                  product.id === productId
                    ? { ...product, status: 'sold' }
                    : product
                )
              );
              
              Alert.alert('✅ تم', 'تم تحديث حالة المنتج إلى مباع');
            } catch (error) {
              Alert.alert('❌ خطأ', error?.response?.data?.error || 'حدث خطأ في تحديث المنتج');
            }
          },
        },
      ]
    );
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

  const renderProduct = ({ item }) => {
    const images = parseImages(item.images);
    const firstImage = images && images.length > 0 ? images[0] : null;

    return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}>
      {firstImage ? (
        <Image
          source={{ uri: firstImage }}
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
  };

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
