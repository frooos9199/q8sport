import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Share,
  Alert,
} from 'react-native';
import { openWhatsApp } from '../utils/whatsapp';

// دالة لحساب الوقت منذ النشر
const getTimeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'منذ يوم';
  return `منذ ${diffDays} أيام`;
};

// دالة لتنسيق عدد المشاهدات
const formatViews = (views) => {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views;
};

const EnhancedProductCard = ({ item, index, onPress }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  const APP_PROMO = `\n\n—\nQ8 Sport Car 🏁\nحمّل التطبيق / زور الموقع: https://www.q8sportcar.com`;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleWhatsApp = () => {
    const message = `انا مهتم بـ ${item.title}\nالسعر: ${item.price} د.ك${APP_PROMO}`;
    const phone = item?.whatsapp || item?.contactWhatsapp || item?.contactPhone || item?.phone;
    openWhatsApp({ phone, message });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.title}\nالسعر: ${item.price} د.ك\nالحالة: ${item.condition}\n\nQ8Sport - سوق السيارات الرياضية`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'متوفر': return '#10B981';
      case 'محجوز': return '#F59E0B';
      case 'مباع': return '#EF4444';
      default: return '#10B981';
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
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
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.7}>
        {/* الصورة */}
        <View style={styles.imageContainer}>
          {item.images && JSON.parse(item.images)[0] ? (
            <Image
              source={{ uri: JSON.parse(item.images)[0] }}
              style={styles.image}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📦</Text>
            </View>
          )}
          
          {/* حالة المنتج */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>

          {/* المشاهدات */}
          <View style={styles.viewsBadge}>
            <Text style={styles.viewsText}>👁 {formatViews(item.views)}</Text>
          </View>
        </View>

        {/* المعلومات */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price} د.ك</Text>
            <Text style={styles.condition}>{item.condition}</Text>
          </View>

          {/* الوقت */}
          <Text style={styles.timeAgo}>
            🕐 {getTimeAgo(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* أزرار الإجراءات */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.whatsappButton]}
          onPress={handleWhatsApp}>
          <Text style={styles.actionIcon}>💬</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}>
          <Text style={styles.actionIcon}>📤</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.favoriteButton]}>
          <Text style={styles.actionIcon}>🤍</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
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
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewsBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    height: 36,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  condition: {
    fontSize: 11,
    color: '#999',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeAgo: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    padding: 6,
    gap: 6,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  shareButton: {
    backgroundColor: '#0EA5E9',
  },
  favoriteButton: {
    backgroundColor: '#EF4444',
  },
  actionIcon: {
    fontSize: 16,
  },
});

export default EnhancedProductCard;
