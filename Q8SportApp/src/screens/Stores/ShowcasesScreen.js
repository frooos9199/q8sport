import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ShowcaseCard = ({ item, onPress }) => {
  // Parse images safely with fallback
  let images = [];
  try {
    if (item.images) {
      images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
    }
  } catch (error) {
    console.error('Error parsing images:', error);
    images = [];
  }
  
  // إضافة صورة افتراضية إذا لم توجد صور
  if (!images || images.length === 0) {
    images = ['https://via.placeholder.com/400x500/1a1a1a/DC2626?text=No+Image'];
  }
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Auto-rotate images with smooth animation
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      // Fade out & slide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change image
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        
        // Reset position
        slideAnim.setValue(20);
        
        // Fade in & slide back
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000); // تغيير كل 3 ثواني
    
    return () => clearInterval(interval);
  }, [images.length]);
  
  const isPending = item.status === 'PENDING';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.9}>
      
      {/* Animated Image Carousel */}
      <View style={styles.imageContainer}>
        <Animated.View
          style={[
            styles.imageWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}>
          <Image
            source={{ uri: images[currentImageIndex] }}
            style={styles.cardImage}
            defaultSource={require('../../../assets/images/icon.png')}
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          />
        </Animated.View>
        
        {/* Image Indicators */}
        {images.length > 1 && (
          <View style={styles.indicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        )}
        
        {/* Image Counter Badge */}
        {images.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Text style={styles.imageCountText}>
              📸 {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
        )}
      </View>
      
      {isPending && (
        <View style={styles.pendingOverlay}>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>⏳</Text>
          </View>
        </View>
      )}

      <View style={styles.cardInfo}>
        <View style={styles.userRow}>
          {item.user?.avatar ? (
            <Image
              source={{ uri: item.user.avatar }}
              style={styles.smallAvatar}
            />
          ) : (
            <View style={[styles.smallAvatar, { backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#DC2626', fontSize: 10, fontWeight: 'bold' }}>
                {item.user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.userName} numberOfLines={1}>
            {item.user?.name || 'مستخدم'}
          </Text>
        </View>
        
        <Text style={styles.carName} numberOfLines={1}>
          {item.carBrand} {item.carModel}
        </Text>
        
        <View style={styles.stats}>
          <Text style={styles.statText}>❤️ {item.likes}</Text>
          <Text style={styles.statText}>👁️ {item.views}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ShowcasesScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [showcases, setShowcases] = useState([]);
  const [likedShowcases, setLikedShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchShowcases();
  }, []);

  const fetchShowcases = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHOWCASES}`);
      if (response.ok) {
        const data = await response.json();
        setShowcases(data.showcases || []);
      }
    } catch (error) {
      console.error('Error fetching showcases:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShowcases();
  };

  const handleShowcasePress = (item) => {
    navigation.navigate('ShowcaseDetails', { showcase: item });
  };

  const handleLike = async (showcaseId) => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    // تجربة وهمية - سيتم استبدالها بـ API
    const isLiked = likedShowcases.includes(showcaseId);
    if (isLiked) {
      setLikedShowcases(likedShowcases.filter(id => id !== showcaseId));
      setShowcases(showcases.map(s =>
        s.id === showcaseId ? { ...s, likes: s.likes - 1 } : s
      ));
    } else {
      setLikedShowcases([...likedShowcases, showcaseId]);
      setShowcases(showcases.map(s =>
        s.id === showcaseId ? { ...s, likes: s.likes + 1 } : s
      ));
    }
  };

  const handleAddShowcase = () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    navigation.navigate('AddShowcase');
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerTitleRed}>Car </Text>
          <Text style={styles.headerTitleWhite}>Show</Text>
        </Text>
        <Text style={styles.headerSubtitle}>أجمل وأقوى السيارات في الكويت</Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddShowcase}>
        <Text style={styles.addButtonText}>+ أضف سيارتك</Text>
      </TouchableOpacity>

      {/* Showcases Grid */}
      <FlatList
        data={showcases}
        renderItem={({ item }) => (
          <ShowcaseCard
            item={item}
            onPress={handleShowcasePress}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>لا توجد عروض حالياً</Text>
            <Text style={styles.emptySubtext}>كن أول من يعرض سيارته!</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
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
  },
  addButton: {
    margin: 16,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    position: 'relative',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
  },
  indicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    backgroundColor: '#DC2626',
    width: 20,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  imageCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingText: {
    fontSize: 20,
  },
  cardInfo: {
    padding: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  userName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  carName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    color: '#999',
    fontSize: 11,
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
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
  },
});

export default ShowcasesScreen;
