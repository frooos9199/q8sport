import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import BiometricService from '../../services/BiometricService';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
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
        'هل أنت متأكد من تعطيل المصادقة البيومترية؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'تعطيل',
            style: 'destructive',
            onPress: async () => {
              const disabled = await BiometricService.disableBiometric();
              if (disabled) {
                setBiometricEnabled(false);
                Alert.alert('✅ تم', 'تم تعطيل المصادقة البيومترية');
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
    <ScrollView style={styles.container}>
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

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
});

export default SettingsScreen;
