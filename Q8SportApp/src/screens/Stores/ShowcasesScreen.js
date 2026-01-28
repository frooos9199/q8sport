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
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ShowcaseCard = ({ item, onPress }) => {
  const images = item.images ? JSON.parse(item.images) : [];
  const isPending = item.status === 'PENDING';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.9}>
      <Image
        source={{ uri: images[0] }}
        style={styles.cardImage}
      />
      
      {isPending && (
        <View style={styles.pendingOverlay}>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>⏳</Text>
          </View>
        </View>
      )}

      <View style={styles.cardInfo}>
        <View style={styles.userRow}>
          <Image
            source={{ uri: item.user?.avatar }}
            style={styles.smallAvatar}
          />
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
    // بيانات وهمية للعرض
    const dummyData = [
      {
        id: '1',
        carBrand: 'Ford',
        carModel: 'Mustang GT',
        carYear: 2024,
        horsepower: 500,
        description: 'سيارة معدلة بالكامل مع تيربو وعادم كامل',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1584345604476-8ec5f5d3e0c0?w=800',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
        ]),
        status: 'APPROVED',
        likes: 234,
        views: 1520,
        user: {
          id: '1',
          name: 'أحمد الكويتي',
          avatar: 'https://i.pravatar.cc/150?img=12'
        },
        showcaseComments: [{}, {}, {}]
      },
      {
        id: '2',
        carBrand: 'Chevrolet',
        carModel: 'Corvette C8',
        carYear: 2023,
        horsepower: 650,
        description: 'كورفيت C8 معدلة بالكامل',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'
        ]),
        status: 'APPROVED',
        likes: 189,
        views: 890,
        user: {
          id: '2',
          name: 'محمد العنزي',
          avatar: 'https://i.pravatar.cc/150?img=33'
        },
        showcaseComments: [{}, {}]
      },
      {
        id: '3',
        carBrand: 'Dodge',
        carModel: 'Challenger SRT',
        carYear: 2024,
        horsepower: 717,
        description: 'تشالنجر هيلكات معدلة',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'
        ]),
        status: 'APPROVED',
        likes: 456,
        views: 2340,
        user: {
          id: '3',
          name: 'خالد المطيري',
          avatar: 'https://i.pravatar.cc/150?img=52'
        },
        showcaseComments: [{}, {}, {}, {}, {}]
      },
      {
        id: '4',
        carBrand: 'BMW',
        carModel: 'M4 Competition',
        carYear: 2023,
        horsepower: 510,
        description: 'M4 كومبتيشن مع كت كامل',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'
        ]),
        status: 'APPROVED',
        likes: 312,
        views: 1670,
        user: {
          id: '4',
          name: 'فهد الدوسري',
          avatar: 'https://i.pravatar.cc/150?img=68'
        },
        showcaseComments: [{}]
      }
    ];
    
    // جلب العروض المعتمدة من AsyncStorage
    const loadApprovedShowcases = async () => {
      try {
        const approved = await AsyncStorage.getItem('approvedShowcases');
        if (approved) {
          const approvedList = JSON.parse(approved);
          setShowcases([...dummyData, ...approvedList]);
        } else {
          setShowcases(dummyData);
        }
      } catch (error) {
        setShowcases(dummyData);
      }
      setLoading(false);
      setRefreshing(false);
    };
    
    loadApprovedShowcases();
  }, []);

  const fetchShowcases = async () => {
    // سيتم استبدالها بـ API call لاحقاً
    setRefreshing(false);
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
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    backgroundColor: '#2a2a2a',
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
