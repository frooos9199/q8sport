import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const AddOptionsModal = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const handleOptionPress = (route, screen) => {
    if (!isAuthenticated) {
      onClose();
      navigation.navigate('Profile', { screen: 'Auth' });
      return;
    }
    
    onClose();
    setTimeout(() => {
      navigation.navigate(route, { screen });
    }, 300);
  };

  const options = [
    {
      id: 'product',
      title: 'سيارة أو قطع غيار للبيع',
      icon: 'car-sport',
      color: '#DC2626',
      route: 'Profile',
      screen: 'AddProduct',
    },
    {
      id: 'showcase',
      title: 'إضافة كار شو VIP',
      icon: 'star',
      color: '#8B5CF6',
      route: 'Stores',
      screen: 'AddShowcase',
    },
    {
      id: 'auction',
      title: 'إضافة مزاد',
      icon: 'hammer',
      color: '#10B981',
      route: 'Profile',
      screen: 'AddAuction',
    },
    {
      id: 'request',
      title: 'إضافة مطلوب',
      icon: 'megaphone',
      color: '#3B82F6',
      route: 'Profile',
      screen: 'AddRequest',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>اختر نوع الإضافة</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  {
                    borderLeftColor: option.color,
                  },
                ]}
                onPress={() => handleOptionPress(option.route, option.screen)}
                activeOpacity={0.7}>
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={28} color="#fff" />
                </View>
                <Text style={styles.optionText}>{option.title}</Text>
                <Ionicons name="chevron-back" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>

          {!isAuthenticated && (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={['#DC2626', '#991B1B', '#7F1D1D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.footer}>
                <View style={styles.warningIcon}>
                  <Ionicons name="lock-closed" size={22} color="#fff" />
                </View>
                <View style={styles.footerContent}>
                  <Text style={styles.footerTitle}>تسجيل الدخول مطلوب</Text>
                  <Text style={styles.footerSubtitle}>سجل دخول للمتابعة</Text>
                </View>
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </LinearGradient>
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#DC2626',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  optionsContainer: {
    padding: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 3,
    borderTopColor: '#000',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  warningIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  footerContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  footerTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 2,
  },
  footerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
});

export default AddOptionsModal;
