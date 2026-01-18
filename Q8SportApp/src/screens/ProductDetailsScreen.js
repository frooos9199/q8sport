import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Share,
  Animated,
  ActivityIndicator,
  FlatList,
} from 'react-native';

import { ProductService } from '../services/api/products';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      console.log('Fetching product:', productId);
      const data = await ProductService.getProductDetails(productId);
      console.log('Product data:', data);
      setProduct(data?.product || data);
    } catch (error) {
      console.error('Error fetching product:', error);
      // عرض رسالة خطأ
      setProduct({
        title: 'خطأ في التحميل',
        price: 0,
        description: 'حدث خطأ أثناء تحميل المنتج. يرجى المحاولة لاحقاً.',
        condition: 'غير متوفر',
      });
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const normalizePhone = (phone) => {
    if (!phone) return null;
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 8) return `965${digits}`;
    return digits;
  };

  const handleWhatsApp = () => {
    const phone = product.contactPhone || product.phone || product.seller?.phone;
    const normalized = normalizePhone(phone);
    if (!normalized) return;

    const message = `مرحباً، أنا مهتم بـ ${product.title} - السعر: ${product.price} د.ك`;
    const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const handleShare = async () => {
    await Share.share({
      message: `${product.title}\nالسعر: ${product.price} د.ك\n\nQ8Sport`,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {product && (
          <>
            {/* معرض الصور */}
            <View style={styles.imageGallery}>
              <FlatList
                data={product.images ? JSON.parse(product.images) : []}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setCurrentImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.mainImage}
                    resizeMode="cover"
                  />
                )}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={
                  <View style={[styles.mainImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 60 }}>📦</Text>
                  </View>
                }
              />
              <View style={styles.imageBadges}>
                <View style={styles.viewsBadge}>
                  <Text style={styles.badgeText}>👁 {product.views || 0}</Text>
                </View>
                <TouchableOpacity style={styles.shareBadge} onPress={handleShare}>
                  <Text style={styles.badgeText}>📤</Text>
                </TouchableOpacity>
              </View>
              {product.images && JSON.parse(product.images).length > 1 && (
                <View style={styles.pagination}>
                  {JSON.parse(product.images).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        currentImageIndex === index && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

        {/* المعلومات الأساسية */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{product.title}</Text>
              <TouchableOpacity style={styles.favoriteButton}>
                <Text style={styles.favoriteIcon}>🤍</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.price}>{product.price} د.ك</Text>
          </View>

          {/* التفاصيل */}
          <View style={styles.detailsCard}>
            <DetailRow icon="🏷️" label="الحالة" value={product.condition || 'غير محدد'} />
            {product.carBrand && <DetailRow icon="🚗" label="الماركة" value={product.carBrand} />}
            {product.carModel && <DetailRow icon="🔧" label="الموديل" value={product.carModel} />}
            {product.carYear && <DetailRow icon="📅" label="السنة" value={product.carYear} />}
            <DetailRow icon="📍" label="الحالة" value={product.status || 'متوفر'} color="#10B981" />
          </View>

          {/* الوصف */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 الوصف</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* معلومات البائع */}
          <View style={styles.sellerCard}>
            <View style={styles.sellerHeader}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{product.seller?.name || 'البائع'}</Text>
                  {product.seller?.verified && <Text style={styles.verifiedBadge}>✓</Text>}
                </View>
                <Text style={styles.sellerRating}>⭐ {product.seller?.rating || '5.0'} ({product.seller?.totalProducts || 0} منتج)</Text>
              </View>
            </View>
          </View>

          {/* أزرار الإجراءات */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
              <Text style={styles.buttonIcon}>💬</Text>
              <Text style={styles.buttonText}>واتساب</Text>
            </TouchableOpacity>
          </View>
        </View>
        </>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const DetailRow = ({ icon, label, value, color }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailIcon}>{icon}</Text>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, color && { color }]}>{value}</Text>
  </View>
);

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
  imageGallery: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: width,
    backgroundColor: '#1a1a1a',
  },
  pagination: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#DC2626',
    width: 24,
  },
  imageBadges: {
    position: 'absolute',
    top: 15,
    right: 15,
    gap: 10,
  },
  viewsBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  shareBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 28,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  detailsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 24,
  },
  sellerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedBadge: {
    fontSize: 16,
    color: '#10B981',
  },
  sellerRating: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailsScreen;
