import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const AdminSettingsScreen = () => {
  const [autoApprove, setAutoApprove] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [maxProductsPerUser, setMaxProductsPerUser] = useState('10');
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_SETTINGS);
      const settings = res?.data?.settings;

      if (settings) {
        setAutoApprove(Boolean(settings.autoApprove));
        setMaintenanceMode(Boolean(settings.maintenanceMode));
        setAllowRegistration(Boolean(settings.allowRegistrations));
        setMaxProductsPerUser(String(settings.maxProductsPerUser ?? 10));
      }
    } catch (error) {
      // Keep defaults and allow save
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN_SETTINGS, {
        autoApprove,
        maintenanceMode,
        allowRegistrations: allowRegistration,
        maxProductsPerUser: parseInt(maxProductsPerUser, 10),
      });

        Alert.alert('تم', 'تم حفظ الإعدادات بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  const SettingToggle = ({ icon, title, subtitle, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ إعدادات الإدارة</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#DC2626" />
          <Text style={styles.loadingText}>جاري تحميل الإعدادات...</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إعدادات المنتجات</Text>
        <SettingToggle
          icon="✅"
          title="الموافقة التلقائية"
          subtitle="الموافقة على المنتجات تلقائياً"
          value={autoApprove}
          onValueChange={setAutoApprove}
        />
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📊</Text>
            <Text style={styles.settingTitle}>الحد الأقصى للمنتجات</Text>
          </View>
          <TextInput
            style={styles.numberInput}
            value={maxProductsPerUser}
            onChangeText={setMaxProductsPerUser}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إعدادات النظام</Text>
        <SettingToggle
          icon="🔧"
          title="وضع الصيانة"
          subtitle="إيقاف التطبيق مؤقتاً"
          value={maintenanceMode}
          onValueChange={setMaintenanceMode}
        />
        <SettingToggle
          icon="👥"
          title="السماح بالتسجيل"
          subtitle="السماح للمستخدمين الجدد بالتسجيل"
          value={allowRegistration}
          onValueChange={setAllowRegistration}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إجراءات خطيرة</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() =>
            Alert.alert('تحذير', 'هذا الإجراء سيحذف جميع البيانات المؤقتة')
          }>
          <Text style={styles.dangerButtonText}>🗑️ مسح الذاكرة المؤقتة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() =>
            Alert.alert('تحذير', 'هذا الإجراء سيعيد تشغيل الخادم')
          }>
          <Text style={styles.dangerButtonText}>🔄 إعادة تشغيل الخادم</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
        <Text style={styles.saveButtonText}>💾 حفظ الإعدادات</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
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
  settingTextContainer: {
    flex: 1,
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
  numberInput: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    fontSize: 16,
    width: 60,
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    margin: 15,
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#999',
    fontSize: 12,
  },
});

export default AdminSettingsScreen;
