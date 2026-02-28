import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';
import { openWhatsApp } from '../../utils/whatsapp';

const safeParseImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter((x) => typeof x === 'string');
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string');
    } catch {
      return images.startsWith('http') ? [images] : [];
    }
  }
  return [];
};

const StoreDetailsScreen = ({ route, navigation }) => {
  const storeId = route?.params?.storeId;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get(API_CONFIG.ENDPOINTS.USER_DETAILS(storeId));
        const data = res.data;

        if (!data?.success) {
          throw new Error(data?.error || 'فشل تحميل بيانات المحل');
        }

        setStore(data.seller);
        setProducts(Array.isArray(data.products) ? data.products : []);

        const title = route?.params?.title || data.seller?.shopName || data.seller?.name || 'تفاصيل المحل';
        navigation.setOptions({ title });
      } catch (e) {
        const status = e?.response?.status;
        if (status === 404) {
          setError('هذا المحل غير موجود أو تم حذفه');
        } else {
          setError(e instanceof Error ? e.message : 'فشل تحميل بيانات المحل');
        }
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      load();
    } else {
      setLoading(false);
      setError('معرف المحل غير صحيح');
    }
  }, [storeId]);

  const defaultProductImage = 'https://cdn-icons-png.flaticon.com/512/2331/2331970.png';
  const renderProduct = ({ item }) => {
    const imgs = safeParseImages(item.images);
    const image = imgs[0] || defaultProductImage;
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      >
        <Image source={{ uri: image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.productPrice}>{item.price} د.ك</Text>
          <Text style={styles.productMeta} numberOfLines={1}>
            {[item.category, item.carBrand, item.carModel, item.carYear].filter(Boolean).join(' • ') || '—'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // صورة محل افتراضية
  const defaultStoreImage = 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png';
  const storeImage = store?.shopImage || store?.avatar || defaultStoreImage;

  return (

    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: storeImage }} style={styles.storeMainImage} />
        <Text style={styles.storeName}>{store?.shopName || store?.name || 'محل'}</Text>
        <Text style={styles.storeSub}>{store?.shopAddress || 'العنوان غير محدد'}</Text>
        <Text style={styles.storeSub}>⭐ {Number(store?.rating || 0).toFixed(1)}  •  منتجات: {products.length}</Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: 65 + insets.bottom + 20 }]}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد منتجات لهذا المحل</Text>
          </View>
        }
      />

      {store && (store.whatsapp || store.phone) && (
        <View style={styles.contactBar}>
          {store.whatsapp && (
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => openWhatsApp({ phone: store.whatsapp, message: `مرحبا، أود الاستفسار عن منتجات محلك: ${store.shopName || store.name}` })}
            >
              <Text style={styles.whatsappButtonText}>تواصل واتساب</Text>
            </TouchableOpacity>
          )}
          {store.phone && (
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => {
                const url = `tel:${store.phone}`;
                Linking.openURL(url);
              }}
            >
              <Text style={styles.phoneButtonText}>{store.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  storeMainImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 10,
    backgroundColor: '#222',
  },
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  errorText: { color: '#F87171', fontSize: 16, textAlign: 'center' },
  backButton: { marginTop: 12, backgroundColor: '#DC2626', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
  header: { padding: 16, borderBottomWidth: 2, borderBottomColor: '#DC2626' },
  storeName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  storeSub: { color: '#999', fontSize: 13, marginBottom: 3 },
  list: { padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  productCard: { backgroundColor: '#1a1a1a', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333', marginBottom: 12, flex: 1, marginHorizontal: 4 },
    contactBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: '#181818',
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: '#222',
      zIndex: 10,
    },
    whatsappButton: {
      backgroundColor: '#25D366',
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 10,
      marginHorizontal: 8,
    },
    whatsappButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    phoneButton: {
      backgroundColor: '#DC2626',
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 10,
      marginHorizontal: 8,
    },
    phoneButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  productImage: { width: '100%', height: 160, backgroundColor: '#2a2a2a' },
  placeholderImage: { width: '100%', height: 160, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 50 },
  productInfo: { padding: 12 },
  productTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  productPrice: { color: '#DC2626', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  productMeta: { color: '#999', fontSize: 12 },
  emptyContainer: { paddingTop: 80, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});

export default StoreDetailsScreen;
