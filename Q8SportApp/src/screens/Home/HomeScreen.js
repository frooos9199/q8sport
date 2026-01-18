import React, { useState, useEffect, useRef } from 'react';
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
import { ProductService } from '../../services/api/products';
import { CarIcon, PartsIcon, AccessoryIcon, FavoriteIcon } from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';

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

const DUMMY_PRODUCTS = [
  {
    id: 'dummy-1',
    title: 'قير موستنق 2015',
    price: 450,
    condition: 'مستعمل',
    productType: 'PART',
    carBrand: 'Ford',
    carModel: 'Mustang',
    images: JSON.stringify(['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400']),
  },
  {
    id: 'dummy-2',
    title: 'محرك كامري 2018',
    price: 1200,
    condition: 'جديد',
    productType: 'PART',
    carBrand: 'Toyota',
    carModel: 'Camry',
    images: JSON.stringify(['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400']),
  },
  {
    id: 'dummy-3',
    title: 'إطارات رياضية',
    price: 280,
    condition: 'جديد',
    productType: 'PART',
    carBrand: 'BMW',
    images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400']),
  },
  {
    id: 'dummy-4',
    title: 'مقود كورفيت',
    price: 350,
    condition: 'مستعمل',
    productType: 'PART',
    carBrand: 'Chevrolet',
    carModel: 'Corvette',
    images: JSON.stringify(['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400']),
  },
  {
    id: 'dummy-5',
    title: 'شاشة تسلا',
    price: 890,
    condition: 'جديد',
    productType: 'PART',
    carBrand: 'Tesla',
    images: JSON.stringify(['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400']),
  },
  {
    id: 'dummy-6',
    title: 'مصابيح LED',
    price: 150,
    condition: 'جديد',
    productType: 'PART',
    carBrand: 'Mercedes',
    images: JSON.stringify(['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400']),
  },
  {
    id: 'dummy-7',
    title: 'عادم رياضي',
    price: 520,
    condition: 'مستعمل',
    productType: 'PART',
    carBrand: 'Porsche',
    images: JSON.stringify(['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400']),
  },
  {
    id: 'dummy-8',
    title: 'مكابح بريمبو',
    price: 680,
    condition: 'جديد',
    productType: 'PART',
    carBrand: 'Nissan',
    images: JSON.stringify(['https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=400']),
  },
];

const ProductCard = React.memo(({ item, index, onPress, onFavorite, isFavorite }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = item.images ? JSON.parse(item.images) : [];

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    // تغيير الصور تلقائياً
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

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
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(DUMMY_PRODUCTS);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchProducts();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedType, selectedBrand, selectedModel]);

  const fetchProducts = async () => {
    try {
      const response = await ProductService.getProducts();
      const apiProducts = response.products || [];
      setProducts([...DUMMY_PRODUCTS, ...apiProducts]);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(DUMMY_PRODUCTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterProducts = () => {
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

    setFilteredProducts(filtered);
  };

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

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel('');
  };

  const resetFilters = () => {
    setSelectedType('ALL');
    setSelectedBrand('');
    setSelectedModel('');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (productId) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const handleFavorite = async (productId) => {
    if (!isAuthenticated) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول لإضافة منتجات للمفضلة');
      return;
    }

    try {
      const isFav = favorites.includes(productId);
      if (isFav) {
        await fetch(`https://q8sport.vercel.app/api/user/favorites/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(favorites.filter(id => id !== productId));
      } else {
        await fetch('https://q8sport.vercel.app/api/user/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        setFavorites([...favorites, productId]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderProduct = ({ item, index }) => (
    <ProductCard 
      item={item} 
      index={index} 
      onPress={handleProductPress}
      onFavorite={handleFavorite}
      isFavorite={favorites.includes(item.id)}
    />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
          />
        }
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
});

export default HomeScreen;
