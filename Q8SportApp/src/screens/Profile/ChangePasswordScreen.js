import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import KeyboardAvoidingScrollView from '../../components/KeyboardAvoidingScrollView';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';

const ChangePasswordScreen = ({ navigation }) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleForgotPassword = async () => {
    if (!user?.email) {
      Alert.alert('خطأ', 'لا يوجد بريد إلكتروني مسجل في حسابك');
      return;
    }

    Alert.alert(
      'إعادة تعيين كلمة المرور',
      `سيتم إرسال رابط إعادة تعيين كلمة المرور إلى:\n${user.email}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'إرسال', 
          onPress: async () => {
            setResetLoading(true);
            try {
              await apiClient.post('/auth/forgot-password', {
                email: user.email
              });
              
              Alert.alert(
                'تم الإرسال ✅',
                `تم إرسال رابط إعادة تعيين كلمة المرور إلى:\n${user.email}\n\nيرجى التحقق من بريدك الإلكتروني (وصندوق الرسائل غير المرغوب فيها)`,
                [{ text: 'حسناً' }]
              );
            } catch (error) {
              console.error('Reset password error:', error);
              const errorMessage = error?.response?.data?.error || 'فشل إرسال البريد الإلكتروني';
              Alert.alert('خطأ', errorMessage);
            } finally {
              setResetLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!token) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول');
      return;
    }

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert('خطأ', 'جميع الحقول مطلوبة');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.USER_CHANGE_PASSWORD, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Alert.alert('تم', 'تم تغيير كلمة المرور بنجاح', [
        { text: 'حسناً', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message = error?.response?.data?.error || 'فشل تغيير كلمة المرور';
      Alert.alert('خطأ', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🔒 تغيير كلمة المرور</Text>
        <Text style={styles.subtitle}>أدخل كلمة المرور الحالية والجديدة</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>كلمة المرور الحالية *</Text>
          <TextInput
            style={styles.input}
            value={formData.currentPassword}
            onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
            placeholder="أدخل كلمة المرور الحالية"
            placeholderTextColor="#666"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.forgotButton}
          onPress={handleForgotPassword}
          disabled={resetLoading}>
          {resetLoading ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Text style={styles.forgotText}>📧 نسيت كلمة السر؟</Text>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>كلمة المرور الجديدة *</Text>
          <TextInput
            style={styles.input}
            value={formData.newPassword}
            onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
            placeholder="أدخل كلمة المرور الجديدة"
            placeholderTextColor="#666"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>تأكيد كلمة المرور *</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            placeholder="أعد إدخال كلمة المرور الجديدة"
            placeholderTextColor="#666"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>💾 حفظ كلمة المرور</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 20,
    padding: 8,
  },
  forgotText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
