import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  ImageBackground,
  ScrollView,
  Animated,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import BurnoutLoader from '../../components/BurnoutLoader';
import { SkeletonGrid } from '../../components/SkeletonLoader';
import { ProductService } from '../../services/api/products';
import { CarIcon, PartsIcon, AccessoryIcon, FavoriteIcon } from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';
import { parseImages } from '../../utils/jsonHelpers';

const SPORT_CARS = {
  Ford: ['Mustang', 'F-150 Raptor', 'GT', 'Shelby GT500'],
  Chevrolet: ['Corvette', 'Camaro', 'Silverado ZR2'],
  Toyota: ['Supra', 'GR86', 'Tundra TRD Pro'],
  Dodge: ['Challenger', 'Charger', 'Viper'],
  Nissan: ['GT-R', '370Z', 'Titan'],
  BMW: ['M3', 'M4', 'M5', 'M8'],
  Mercedes: ['AMG GT', 'C63 AMG', 'E63 AMG'],
  Porsche: ['911', 'Cayman', 'Panamera']
};

const PRODUCT_TYPES = [
  { label: 'الكل', value: 'ALL', icon: 'apps' },
  { label: 'سيارات', value: 'CAR', icon: 'car' },
  { label: 'قطع غيار', value: 'PART', icon: 'parts' }
];

const ProductCard = React.memo(({ item, index, onPress, onFavorite, isFavorite }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = parseImages(item.images); // Safe JSON parsing

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 250, // تقليل من 300 إلى 250
      delay: index * 30, // تقليل من 50 إلى 30
      useNativeDriver: true,
    }).start();

    // تغيير الصور تلقائياً - فقط إذا كان أكثر من صورة واحدة
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 15000); // 15 ثانية لتوفير bandwidth
      return () => clearInterval(interval);
    }
  }, [images.length, index]);

  return (
    <Animated.View
      style={[
        styles.productCard,
        {
          opacity: animValue,
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => onPress(item.id)}
        activeOpacity={0.7}>
        {images.length > 0 ? (
          <Image
            source={{ uri: images[currentImageIndex] }}
            style={styles.productImage}
            resizeMode="cover"
            fadeDuration={100}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        {images.length > 1 && (
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>{currentImageIndex + 1}/{images.length}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onFavorite(item.id)}>
          <FavoriteIcon size={24} color="#EC4899" filled={isFavorite} />
        </TouchableOpacity>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>{item.price} د.ك</Text>
          <Text style={styles.productCondition}>{item.condition}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const HomeScreen = ({ navigation }) => {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // جميع المنتجات
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [silentRefresh, setSilentRefresh] = useState(false); // تحديث صامت
  const [loadingMore, setLoadingMore] = useState(false); // تحميل المزيد
  const [page, setPage] = useState(1); // رقم الصفحة الحالية
  const [hasMore, setHasMore] = useState(true); // هل يوجد المزيد
  const ITEMS_PER_PAGE = 10; // عدد المنتجات لكل صفحة
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchProducts(true);
    // تحسين: الأنيميشن يعمل بشكل أسرع
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchProducts = useCallback(async (reset = false, silent = false) => {
    if (reset) {
      if (silent) {
        setSilentRefresh(true); // تحديث صامت
      } else {
        setLoading(true);
      }
      setPage(1);
    }
    
    try {
      const response = await ProductService.getProducts();
      const apiProducts = response.products || [];
      setAllProducts(apiProducts);
      
      // تحميل أول 10 منتجات فقط
      const initialProducts = apiProducts.slice(0, ITEMS_PER_PAGE);
      setProducts(initialProducts);
      setHasMore(apiProducts.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setAllProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSilentRefresh(false);
    }
  }, [refreshing, ITEMS_PER_PAGE]);

  // دالة لتحميل المزيد من المنتجات
  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    // محاكاة تأخير بسيط للتحميل
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newProducts = allProducts.slice(startIndex, endIndex);
      
      if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
        setHasMore(endIndex < allProducts.length);
      } else {
        setHasMore(false);
      }
      
      setLoadingMore(false);
    }, 500);
  }, [page, allProducts, loadingMore, hasMore, ITEMS_PER_PAGE]);

  // استخدام useMemo لتحسين الأداء
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(p => p.productType === selectedType);
    }

    if (selectedBrand) {
      filtered = filtered.filter(p => p.carBrand === selectedBrand);
    }

    if (selectedModel) {
      filtered = filtered.filter(p => p.carModel === selectedModel);
    }

    return filtered;
  }, [products, selectedType, selectedBrand, selectedModel]);

  // عند تغيير الفلاتر، إعادة تعيين التحميل التدريجي
  useEffect(() => {
    if (selectedType !== 'ALL' || selectedBrand || selectedModel) {
      // إعادة تعيين الصفحة عند تطبيق فلاتر
      setPage(1);
      setHasMore(true);
    }
  }, [selectedType, selectedBrand, selectedModel]);

  const activeFiltersCount =
    (selectedType !== 'ALL' ? 1 : 0) + (selectedBrand ? 1 : 0) + (selectedModel ? 1 : 0);

  const selectedTypeLabel =
    PRODUCT_TYPES.find((t) => t.value === selectedType)?.label || 'الكل';

  const filtersSummary = [
    selectedTypeLabel,
    selectedBrand || null,
    selectedModel || null,
  ]
    .filter(Boolean)
    .join(' • ');

  const handleBrandChange = useCallback((brand) => {
    setSelectedBrand(brand);
    setSelectedModel('');
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedType('ALL');
    setSelectedBrand('');
    setSelectedModel('');
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchProducts(true, false); // refresh عادي
  }, [fetchProducts]);

  // تم إلغاء Auto-Refresh لتوفير 90% من استهلاك Vercel
  // المستخدم يمكنه السحب للتحديث يدوياً عبر Pull-to-Refresh

  const handleProductPress = useCallback((productId) => {
    navigation.navigate('ProductDetails', { productId });
  }, [navigation]);

  const handleFavorite = useCallback(async (productId) => {
    if (!isAuthenticated) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول لإضافة منتجات للمفضلة');
      return;
    }

    try {
      const isFav = favorites.includes(productId);
      if (isFav) {
        await apiClient.delete(API_CONFIG.ENDPOINTS.USER_FAVORITE_DETAILS(productId));
        setFavorites(favorites.filter(id => id !== productId));
      } else {
        await apiClient.post(API_CONFIG.ENDPOINTS.USER_FAVORITES, { productId });
        setFavorites([...favorites, productId]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [isAuthenticated, favorites]);

  const renderProduct = ({ item, index }) => (
    <ProductCard 
      item={item} 
      index={index} 
      onPress={handleProductPress}
      onFavorite={handleFavorite}
      isFavorite={favorites.includes(item.id)}
    />
  );

  // عرض BurnoutLoader فقط عند التحميل الأولي (ليس عند refresh)
  if (loading && !refreshing && products.length === 0) {
    return <BurnoutLoader text="جاري تحميل السيارات..." />;
  }

  return (
    <ImageBackground
      source={require('../../../assets/background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <View style={styles.headerContent}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              <Text style={styles.headerTitleRed}>Q8</Text>
              <Text style={styles.headerTitleWhite}> Sport Car</Text>
            </Text>
          </View>
          {silentRefresh && (
            <View style={styles.silentRefreshIndicator}>
              <ActivityIndicator size="small" color="#DC2626" />
            </View>
          )}
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.filtersBar,
          { opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setFiltersOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.filtersButtonText}>🎛️ فلتر</Text>
          <View style={styles.filtersRight}>
            <Text style={styles.filtersSummary} numberOfLines={1}>
              {filtersSummary}
            </Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filtersCountBadge}>
                <Text style={styles.filtersCountText}>{activeFiltersCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {activeFiltersCount > 0 && (
          <TouchableOpacity style={styles.filtersResetSmall} onPress={resetFilters}>
            <Text style={styles.filtersResetSmallText}>إعادة تعيين</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <Modal
        visible={filtersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFiltersOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>تصفية المنتجات</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setFiltersOpen(false)}>
                <Text style={styles.closeText}>إغلاق</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetContent} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>النوع</Text>
                <View style={styles.typeButtons}>
                  {PRODUCT_TYPES.map(type => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeButton,
                        selectedType === type.value && styles.typeButtonActive
                      ]}
                      onPress={() => setSelectedType(type.value)}>
                      {type.icon === 'apps' && <Text style={styles.typeButtonIcon}>☰</Text>}
                      {type.icon === 'car' && <CarIcon size={20} color={selectedType === type.value ? '#fff' : '#999'} />}
                      {type.icon === 'parts' && <PartsIcon size={20} color={selectedType === type.value ? '#fff' : '#999'} />}
                      <Text style={[
                        styles.typeButtonText,
                        selectedType === type.value && styles.typeButtonTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>البحث حسب السيارة</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.scrollFilter}>
                  <TouchableOpacity
                    style={[
                      styles.chipButton,
                      selectedBrand === '' && styles.chipButtonActive
                    ]}
                    onPress={() => handleBrandChange('')}>
                    <Text style={[
                      styles.chipButtonText,
                      selectedBrand === '' && styles.chipButtonTextActive
                    ]}>
                      🏷️ جميع الماركات
                    </Text>
                  </TouchableOpacity>

                  {Object.keys(SPORT_CARS).map(brand => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        styles.chipButton,
                        selectedBrand === brand && styles.chipButtonActive
                      ]}
                      onPress={() => handleBrandChange(brand)}>
                      <Text style={[
                        styles.chipButtonText,
                        selectedBrand === brand && styles.chipButtonTextActive
                      ]}>
                        🚗 {brand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {selectedBrand && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>الموديل</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollFilter}>
                    <TouchableOpacity
                      style={[
                        styles.chipButton,
                        selectedModel === '' && styles.chipButtonActive
                      ]}
                      onPress={() => setSelectedModel('')}>
                      <Text style={[
                        styles.chipButtonText,
                        selectedModel === '' && styles.chipButtonTextActive
                      ]}>
                        جميع الموديلات
                      </Text>
                    </TouchableOpacity>

                    {SPORT_CARS[selectedBrand]?.map(model => (
                      <TouchableOpacity
                        key={model}
                        style={[
                          styles.chipButton,
                          selectedModel === model && styles.chipButtonActive
                        ]}
                        onPress={() => setSelectedModel(model)}>
                        <Text style={[
                          styles.chipButtonText,
                          selectedModel === model && styles.chipButtonTextActive
                        ]}>
                          {model}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {activeFiltersCount > 0 && (
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Text style={styles.resetButtonText}>🔄 إعادة تعيين الفلاتر</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFiltersOpen(false)}>
                <Text style={styles.applyButtonText}>تم</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        // ⚡ Performance Optimizations
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        // Refresh
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
          />
        }
        // Pagination
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => {
          if (loadingMore) {
            return (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#DC2626" />
                <Text style={styles.loadingMoreText}>جاري تحميل المزيد...</Text>
              </View>
            );
          }
          if (!hasMore && filteredProducts.length > 0) {
            return (
              <View style={styles.endMessage}>
                <Text style={styles.endMessageText}>✓ تم عرض جميع المنتجات</Text>
              </View>
            );
          }
          return null;
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد منتجات</Text>
          </View>
        }
      />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  headerTextContainer: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerTitleWhite: {
    color: '#fff',
  },
  headerTitleRed: {
    color: '#DC2626',
  },
  silentRefreshIndicator: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  filtersBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  filtersButton: {
    backgroundColor: 'rgba(26, 26, 26, 0.92)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filtersButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filtersRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  filtersSummary: {
    color: '#aaa',
    fontSize: 12,
    maxWidth: 220,
  },
  filtersCountBadge: {
    marginLeft: 8,
    backgroundColor: '#DC2626',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filtersResetSmall: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  filtersResetSmallText: {
    color: '#ddd',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0b0b0b',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: '#222',
    maxHeight: '85%',
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  closeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sheetContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  applyButton: {
    marginTop: 12,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    padding: 10,
    paddingBottom: 100,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#2a2a2a',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 160,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageIndicatorText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
    marginBottom: 5,
  },
  productCondition: {
    fontSize: 12,
    color: '#999',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  filtersWrapper: {
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
    paddingBottom: 15,
  },
  filterSection: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  filterSectionTitle: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  typeButtonIcon: {
    fontSize: 18,
    color: '#999',
  },
  typeButtonText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '700',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  scrollFilter: {
    flexDirection: 'row',
  },
  chipButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
  },
  chipButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  chipButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  chipButtonTextActive: {
    color: '#fff',
  },
  resetButton: {
    marginHorizontal: 15,
    marginTop: 15,
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loadingMoreText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
  endMessage: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endMessageText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default HomeScreen;
