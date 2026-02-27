import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const MyShowcasesScreen = ({ navigation }) => {
  const { token, user } = useAuth();
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log('🎨 MyShowcasesScreen Render - showcases count:', showcases.length);

  const fetchMyShowcases = async () => {
    try {
      let response;
      let showcasesData = [];
      
      try {
        // Try user-specific endpoint first
        response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_SHOWCASES);
        showcasesData = response.data?.showcases || [];
      } catch (error) {
        if (error?.response?.status === 404 || error?.response?.status === 405) {
          // Fallback: fetch all showcases and filter by current user
          console.log('⚠️ Endpoint not found, using fallback...');
          const allResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHOWCASES}`);
          const allData = await allResponse.json();
          
          // Filter showcases by current user
          showcasesData = (allData?.showcases || []).filter(
            showcase => showcase.userId === user?.id || showcase.user?.id === user?.id
          );
        } else {
          throw error;
        }
      }
      
      console.log('✅ MyShowcasesScreen: Showcases fetched:', showcasesData.length);
      console.log('📋 First showcase data:', JSON.stringify(showcasesData[0], null, 2));
      console.log('📋 Second showcase data:', JSON.stringify(showcasesData[1], null, 2));
      
      // Filter out deleted showcases
      const activeShowcases = showcasesData.filter(showcase => {
        console.log('🔍 Checking showcase:', showcase.id, {
          status: showcase.status,
          deletedAt: showcase.deletedAt,
          isDeleted: showcase.isDeleted
        });
        
        // Fixed: Use != null to check for both null AND undefined
        const isDeleted = 
          showcase.status === 'DELETED' || 
          showcase.deletedAt != null || // != checks for both null and undefined
          showcase.isDeleted === true;
        
        if (isDeleted) {
          console.log('🗑️ Filtered out deleted showcase:', showcase.id);
        }
        
        return !isDeleted;
      });
      
      console.log('✅ Active showcases after filter:', activeShowcases.length);
      console.log('🚗 Setting showcases to state...');
      setShowcases(activeShowcases);
      console.log('✅ State updated successfully');
    } catch (error) {
      console.error('❌ MyShowcasesScreen: Error fetching showcases:', error);
      Alert.alert('خطأ', 'فشل جلب الكار شو');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('🎯 useFocusEffect triggered, user:', user?.id);
      if (user?.id) {
        fetchMyShowcases();
      } else {
        console.warn('⚠️ User not available yet');
      }
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyShowcases();
  };

  const handleDeleteShowcase = (showcaseId) => {
    Alert.alert(
      'حذف الكار شو',
      'هل أنت متأكد من حذف هذا الكار شو؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`${API_CONFIG.ENDPOINTS.SHOWCASES}/${showcaseId}`);
              
              // Update local state
              setShowcases(prevShowcases => 
                prevShowcases.filter(showcase => showcase.id !== showcaseId)
              );
              
              Alert.alert('✅', 'تم حذف الكار شو بنجاح');
            } catch (error) {
              console.error('❌ MyShowcasesScreen: Error deleting showcase:', error);
              Alert.alert('❌', 'فشل حذف الكار شو');
            }
          },
        },
      ]
    );
  };

  const handleEditShowcase = (showcase) => {
    // Pass essential data only (remove large fields)
    const { user, images, ...essentialData } = showcase;
    
    navigation.navigate('AddShowcase', {
      editMode: true,
      showcaseData: essentialData,
      imagesString: images // Pass as string to avoid parsing
    });
  };

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    const raw = typeof imageUrl === 'string' ? imageUrl : String(imageUrl);
    
    // Data URL (base64)
    if (/^data:/i.test(raw)) return raw;
    
    // Full URL
    if (/^https?:\/\//i.test(raw)) return raw;
    
    // Relative path
    return `${API_CONFIG.BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  const renderItem = ({ item }) => {
    console.log('🎨 Rendering showcase item:', item.id, item.carBrand);
    console.log('📷 Item images:', typeof item.images, item.images);
    
    // Parse images if they are JSON string
    let images = item.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        console.error('❌ Failed to parse images:', e);
        images = [];
      }
    }
    
    const firstImage = images && images.length > 0 
      ? resolveImageUrl(images[0]) 
      : null;
    
    console.log('🖼️ First image URL:', firstImage);

    return (
      <View style={styles.showcaseCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ShowcaseDetails', { showcase: item })}>
          {firstImage && (
            <Image
              source={{ uri: firstImage }}
              style={styles.showcaseImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.showcaseInfo}>
            <Text style={styles.brandText}>
              {item.carBrand} {item.carModel}
            </Text>
            <Text style={styles.yearText}>{item.carYear}</Text>
            {item.horsepower && (
              <Text style={styles.horsepowerText}>
                {item.horsepower} حصان
              </Text>
            )}
            {item.description && (
              <Text style={styles.descriptionText} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditShowcase(item)}>
            <Ionicons name="pencil" size={18} color="#fff" />
            <Text style={styles.editButtonText}>تعديل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteShowcase(item.id)}>
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.deleteButtonText}>حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  console.log('🔍 Render - showcases.length:', showcases.length);
  console.log('🔍 Render - showcases:', showcases);

  if (showcases.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="star-outline" size={80} color="#666" />
        <Text style={styles.emptyText}>لا توجد كار شو حتى الآن</Text>
        <Text style={styles.emptySubText}>
          اضغط على زر + في الأسفل لإضافة كار شو جديد
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={showcases}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
            colors={['#DC2626']}
          />
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#999',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  listContainer: {
    padding: 15,
  },
  showcaseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  showcaseImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
  },
  showcaseInfo: {
    padding: 15,
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  yearText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 5,
  },
  horsepowerText: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#3B82F6',
    borderRightWidth: 0.5,
    borderRightColor: '#333',
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#DC2626',
    borderLeftWidth: 0.5,
    borderLeftColor: '#333',
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyShowcasesScreen;
