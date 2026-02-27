import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';
import { parseImages } from '../../utils/jsonHelpers';

const FavoritesScreen = ({ navigation }) => {
  const { token, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchFavorites = async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_FAVORITES);
      setFavorites(response.data?.favorites || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await apiClient.delete(API_CONFIG.ENDPOINTS.USER_FAVORITE_DETAILS(productId));
      setFavorites(favorites.filter((f) => f.id !== productId));
      Alert.alert('تم', 'تم إزالة المنتج من المفضلة');
    } catch (error) {
      Alert.alert('خطأ', 'فشل إزالة المنتج');
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
        <Image source={{ uri: firstImage }} style={styles.productImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>{item.price} د.ك</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id)}>
          <Text style={styles.removeButtonText}>💔 إزالة من المفضلة</Text>
        </TouchableOpacity>
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

  // إذا المستخدم غير مسجل دخول
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyText}>يجب تسجيل الدخول لرؤية المفضلة</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.browseButtonText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
            colors={['#DC2626']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💔</Text>
            <Text style={styles.emptyText}>لا توجد منتجات في المفضلة</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Home')}>
              <Text style={styles.browseButtonText}>تصفح المنتجات</Text>
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
  list: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
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
  removeButton: {
    backgroundColor: '#DC2626',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 11,
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
  browseButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
