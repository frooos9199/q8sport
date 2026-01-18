import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { ProductService } from '../../services/api/products';
import EnhancedProductCard from '../../components/EnhancedProductCard';

const DUMMY_PRODUCTS = [
  {
    id: 'dummy-1',
    title: 'قير موستنق 2015',
    price: 450,
    condition: 'مستعمل',
    images: JSON.stringify(['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400']),
    views: 124,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'متوفر',
    phone: '+96599887766',
  },
  {
    id: 'dummy-2',
    title: 'محرك كامري 2018',
    price: 1200,
    condition: 'جديد',
    images: JSON.stringify(['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400']),
    views: 89,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'متوفر',
    phone: '+96599887766',
  },
  {
    id: 'dummy-3',
    title: 'إطارات رياضية',
    price: 280,
    condition: 'جديد',
    images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400']),
    views: 203,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'متوفر',
    phone: '+96599887766',
  },
  {
    id: 'dummy-4',
    title: 'مقود كورفيت',
    price: 350,
    condition: 'مستعمل',
    images: JSON.stringify(['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400']),
    views: 156,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'محجوز',
    phone: '+96599887766',
  },
  {
    id: 'dummy-5',
    title: 'شاشة تسلا',
    price: 890,
    condition: 'جديد',
    images: JSON.stringify(['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400']),
    views: 312,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'متوفر',
    phone: '+96599887766',
  },
  {
    id: 'dummy-6',
    title: 'مصابيح LED',
    price: 150,
    condition: 'جديد',
    images: JSON.stringify(['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400']),
    views: 78,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'متوفر',
    phone: '+96599887766',
  },
  {
    id: 'dummy-7',
    title: 'عادم رياضي',
    price: 520,
    condition: 'مستعمل',
    images: JSON.stringify(['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400']),
    views: 145,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'متوفر',
    phone: '+96599887766',
  },
  {
    id: 'dummy-8',
    title: 'مكابح بريمبو',
    price: 680,
    condition: 'جديد',
    images: JSON.stringify(['https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=400']),
    views: 267,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    status: 'مباع',
    phone: '+96599887766',
  },
];

const ProductCard = React.memo(({ item, index, onPress }) => {
  return (
    <EnhancedProductCard item={item} index={index} onPress={onPress} />
  );
});

const GuestHomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = () => {
    Alert.alert(
      'تسجيل الدخول مطلوب',
      'يجب تسجيل الدخول لعرض تفاصيل المنتج',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'تسجيل الدخول', 
          onPress: () => navigation.navigate('Login') 
        },
      ]
    );
  };

  const renderProduct = ({ item, index }) => (
    <ProductCard item={item} index={index} onPress={handleProductPress} />
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
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerTitleRed}>Q8</Text>
          <Text style={styles.headerTitleWhite}> Sport Car</Text>
        </Text>
        <Text style={styles.headerSubtitle}>سوق السيارات الرياضية</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.loginBanner,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <Text style={styles.bannerText}>سجل الدخول للحصول على تجربة كاملة</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </Animated.View>

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
            <Text style={styles.emptyText}>لا توجد منتجات</Text>
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
  header: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerTitleRed: {
    color: '#DC2626',
  },
  headerTitleWhite: {
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  loginBanner: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  bannerText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loginButtonText: {
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
});

export default GuestHomeScreen;
