import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// أيقونة المحلات
export const StoreIcon = ({ size = 24, color = '#DC2626' }) => (
  <Icon name="store" size={size} color={color} />
);

// أيقونة المفضلة
export const FavoriteIcon = ({ size = 24, color = '#DC2626', filled = false }) => (
  <Ionicons 
    name={filled ? "heart" : "heart-outline"} 
    size={size} 
    color={color} 
  />
);

// أيقونة قطع الغيار
export const PartsIcon = ({ size = 24, color = '#DC2626' }) => (
  <FontAwesome5 name="cog" size={size} color={color} />
);

// أيقونة السيارة
export const CarIcon = ({ size = 24, color = '#DC2626' }) => (
  <Ionicons name="car-sport" size={size} color={color} />
);

// أيقونة الإكسسوارات
export const AccessoryIcon = ({ size = 24, color = '#DC2626' }) => (
  <Icon name="car-wrench" size={size} color={color} />
);

// أيقونة المنتجات
export const ProductIcon = ({ size = 24, color = '#DC2626' }) => (
  <Icon name="package-variant" size={size} color={color} />
);

// أيقونة الرسائل
export const MessageIcon = ({ size = 24, color = '#DC2626' }) => (
  <Ionicons name="chatbubbles" size={size} color={color} />
);

// أيقونة الإشعارات
export const NotificationIcon = ({ size = 24, color = '#DC2626', badge = false }) => (
  <Ionicons 
    name={badge ? "notifications" : "notifications-outline"} 
    size={size} 
    color={color} 
  />
);

// أيقونة الإعدادات
export const SettingsIcon = ({ size = 24, color = '#DC2626' }) => (
  <Ionicons name="settings" size={size} color={color} />
);

// أيقونة الإحصائيات
export const StatsIcon = ({ size = 24, color = '#DC2626' }) => (
  <Ionicons name="stats-chart" size={size} color={color} />
);

// أيقونة المستخدمين
export const UsersIcon = ({ size = 24, color = '#DC2626' }) => (
  <Ionicons name="people" size={size} color={color} />
);

// أيقونة الأدمن
export const AdminIcon = ({ size = 24, color = '#DC2626' }) => (
  <Icon name="shield-crown" size={size} color={color} />
);

export default {
  StoreIcon,
  FavoriteIcon,
  PartsIcon,
  CarIcon,
  AccessoryIcon,
  ProductIcon,
  MessageIcon,
  NotificationIcon,
  SettingsIcon,
  StatsIcon,
  UsersIcon,
  AdminIcon,
};
