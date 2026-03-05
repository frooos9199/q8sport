import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../utils/storage';
import BiometricService from '../../services/BiometricService';

const SettingsScreen = ({ navigation }) => {
  const { user, logout, setUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // 🔄 Refresh user data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshUserData = async () => {
        try {
          const storedUser = await StorageService.getUser();
          if (storedUser) {
            setUser(storedUser);
          }
        } catch (error) {
          console.error('❌ SettingsScreen: Error refreshing user data:', error);
        }
      };

      refreshUserData();
    }, [setUser])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const storedUser = await StorageService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const { available } = await BiometricService.checkAvailability();
    setBiometricAvailable(available);
    
    if (available) {
      const isEnabled = await BiometricService.isEnabled();
      setBiometricEnabled(isEnabled);
    }
  };

  const handleBiometricToggle = async (value) => {
    if (value) {
      // تفعيل البيومترية
      Alert.alert(
        '🔐 تفعيل المصادقة البيومترية',
        'سيتم حفظ معلومات تسجيل الدخول بشكل آمن على جهازك',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'موافق',
            onPress: () => {
              // سيتم التفعيل عند تسجيل الدخول التالي
              Alert.alert('ملاحظة', 'قم بتسجيل الدخول مرة أخرى لتفعيل المصادقة البيومترية');
            },
          },
        ]
      );
    } else {
      // تعطيل البيومترية
      Alert.alert(
        '⚠️ تعطيل المصادقة البيومترية',
        'سيتم حذف بيانات المصادقة المحفوظة من جهازك. يمكنك إعادة تفعيلها لاحقاً من خلال تسجيل الدخول.',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'تعطيل',
            style: 'destructive',
            onPress: async () => {
              const disabled = await BiometricService.disableBiometric();
              if (disabled) {
                setBiometricEnabled(false);
                Alert.alert('✅ تم', 'تم تعطيل المصادقة البيومترية بنجاح');
              }
            },
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'حذف الحساب',
      'هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            Alert.alert('تم', 'سيتم حذف حسابك قريباً');
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <Text style={styles.arrow}>←</Text>}
    </TouchableOpacity>
  );

  const SettingToggle = ({ icon, title, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#333', true: '#DC2626' }}
        thumbColor={value ? '#fff' : '#999'}
      />
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#DC2626"
          colors={['#DC2626']}
        />
      }
    >
      {/* Profile Header with Avatar */}
      <View style={styles.profileHeader}>
        {user?.avatar && typeof user.avatar === 'string' && user.avatar.trim() && 
         (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/')) ? (
          <Image
            source={{ 
              uri: user.avatar.startsWith('http') || user.avatar.startsWith('data:')
                ? user.avatar 
                : `https://www.q8sportcar.com${user.avatar}` 
            }}
            style={styles.profileAvatar}
            defaultSource={require('../../../assets/images/icon.png')}
          />
        ) : (
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '👤'}
            </Text>
          </View>
        )}
        <Text style={styles.profileName}>{user?.name || 'مستخدم'}</Text>
        <Text style={styles.profileEmail}>{user?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الحساب</Text>
        <SettingItem
          icon="👤"
          title="تعديل الملف الشخصي"
          subtitle="الاسم، البريد، الصورة"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingItem
          icon="🔒"
          title="تغيير كلمة المرور"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        {biometricAvailable && (
          <SettingToggle
            icon="👤"
            title="المصادقة البيومترية"
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
          />
        )}
        <SettingItem
          icon="📱"
          title="رقم الهاتف"
          subtitle={user?.phone || 'غير محدد'}
          onPress={() => navigation.navigate('EditPhone')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإشعارات</Text>
        <SettingToggle
          icon="🔔"
          title="تفعيل الإشعارات"
          value={notifications}
          onValueChange={setNotifications}
        />
        <SettingToggle
          icon="📧"
          title="تنبيهات البريد"
          value={emailAlerts}
          onValueChange={setEmailAlerts}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>التطبيق</Text>
        <SettingToggle
          icon="🌙"
          title="الوضع الليلي"
          value={darkMode}
          onValueChange={setDarkMode}
        />
        <SettingItem icon="🌐" title="اللغة" subtitle="العربية" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الدعم</Text>
        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={() => {
            const { openWhatsApp } = require('../../utils/whatsapp');
            openWhatsApp('+96550540999', 'مرحبا، أحتاج للمساعدة');
          }}>
          <Text style={styles.whatsappIcon}>💬</Text>
          <View style={styles.whatsappTextContainer}>
            <Text style={styles.whatsappTitle}>تواصل مع الإدارة</Text>
            <Text style={styles.whatsappSubtitle}>WhatsApp: +965 50540999</Text>
          </View>
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>
        <SettingItem
          icon="❓"
          title="المساعدة والدعم"
          onPress={() => Alert.alert('الدعم', 'تواصل معنا على support@q8sport.com')}
        />
        <SettingItem
          icon="📄"
          title="الشروط والأحكام"
          onPress={() => Alert.alert('الشروط', 'قريباً')}
        />
        <SettingItem
          icon="🔒"
          title="سياسة الخصوصية"
          onPress={() => Alert.alert('الخصوصية', 'قريباً')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>خطر</Text>
        <TouchableOpacity 
          style={[styles.dangerButton, { backgroundColor: '#F59E0B', marginBottom: 10 }]} 
          onPress={async () => {
            Alert.alert(
              '⚠️ مسح البيانات',
              'هل تريد مسح جميع البيانات المحفوظة؟ ستحتاج لتسجيل الدخول مرة أخرى',
              [
                { text: 'إلغاء', style: 'cancel' },
                {
                  text: 'مسح',
                  style: 'destructive',
                  onPress: async () => {
                    const { StorageService } = require('../../utils/storage');
                    await StorageService.clearAll();
                    await logout();
                    Alert.alert('✅ تم', 'تم مسح جميع البيانات بنجاح');
                  },
                },
              ]
            );
          }}>
          <Text style={styles.dangerButtonText}>🔄 مسح البيانات المحفوظة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>🗑️ حذف الحساب</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.dangerButton, { backgroundColor: '#DC2626' }]} 
          onPress={async () => {
            Alert.alert(
              '👋 تسجيل الخروج',
              'هل تريد تسجيل الخروج من التطبيق؟',
              [
                { text: 'إلغاء', style: 'cancel' },
                {
                  text: 'تسجيل الخروج',
                  style: 'destructive',
                  onPress: async () => {
                    await logout();
                  },
                },
              ]
            );
          }}>
          <Text style={styles.dangerButtonText}>🚪 تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 40,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: '#666',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#1DA851',
  },
  whatsappIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  whatsappTextContainer: {
    flex: 1,
  },
  whatsappTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  whatsappSubtitle: {
    fontSize: 13,
    color: '#E8F5E9',
    marginTop: 2,
  },
});

export default SettingsScreen;
