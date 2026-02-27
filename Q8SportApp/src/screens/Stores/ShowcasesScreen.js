import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ShowcaseCard = ({ item, onPress }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // ✅ Safe parse images with validation
  const parseImages = (imgs) => {
    try {
      if (!imgs) return [];
      const parsed = typeof imgs === 'string' ? JSON.parse(imgs) : imgs;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(img => 
        img && 
        typeof img === 'string' && 
        img.trim() &&
        (img.startsWith('http') || img.startsWith('data:'))
      );
    } catch {
      return [];
    }
  };
  
  const images = parseImages(item.images);
  const isPending = item.status === 'PENDING';
  const currentImage = images[currentImageIndex];

  // ✅ Auto-rotate images every 3 seconds
  useEffect(() => {
    if (images.length > 1 && !imageError) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [images.length, imageError]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.9}>
      {images.length > 0 && currentImage && !imageError ? (
        <Image
          source={{ uri: currentImage }}
          style={styles.cardImage}
          resizeMode="cover"
          onError={(e) => {
            console.log('⚠️ Image load error:', currentImage);
            setImageError(true);
          }}
        />
      ) : (
        <View style={[styles.cardImage, styles.placeholderImage]}>
          <Text style={styles.placeholderEmoji}>🚗</Text>
          <Text style={styles.placeholderText}>
            {item.carBrand || 'سيارة'}
          </Text>
        </View>
      )}
      
      {/* ✅ Image counter indicator */}
      {images.length > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1}/{images.length}
          </Text>
        </View>
      )}
      
      {isPending && (
        <View style={styles.pendingOverlay}>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>⏳</Text>
          </View>
        </View>
      )}

      <View style={styles.cardInfo}>
        {/* ✅ Image dots indicator - moved above user name */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.dotActive
                ]}
              />
            ))}
          </View>
        )}
        
        <View style={styles.userRow}>
          {item.user?.avatar && typeof item.user.avatar === 'string' && item.user.avatar.trim() ? (
            <Image
              source={{ 
                uri: item.user.avatar.startsWith('http') || item.user.avatar.startsWith('data:')
                  ? item.user.avatar
                  : `https://www.q8sportcar.com${item.user.avatar}`
              }}
              style={styles.smallAvatar}
            />
          ) : (
            <View style={[styles.smallAvatar, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#DC2626', fontSize: 10, fontWeight: 'bold' }}>
                {item.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.userName} numberOfLines={1}>
            {item.user?.name}
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
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    backgroundColor: '#2a2a2a',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    backgroundColor: '#DC2626',
    width: 20,
  },
  imageCounter: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  imageCounterText: {
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
