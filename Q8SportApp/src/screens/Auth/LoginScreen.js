import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import BiometricService from '../../services/BiometricService';
import apiClient from '../../services/apiClient';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const { available, type } = await BiometricService.checkAvailability();
    setBiometricAvailable(available);
    setBiometricType(type);
    
    if (available) {
      const isEnabled = await BiometricService.isEnabled();
      setBiometricEnabled(isEnabled);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      
      // محاولة المصادقة باستخدام البيومترية
      const credentials = await BiometricService.authenticate();
      
      if (credentials) {
        // تسجيل الدخول باستخدام البيانات المحفوظة
        const result = await login(credentials.email, credentials.password);
        
        if (!result.success) {
          Alert.alert('خطأ', result.error);
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert('خطأ', 'حدث خطأ في المصادقة البيومترية');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('خطأ', 'يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // عرض خيار تفعيل المصادقة البيومترية بعد تسجيل الدخول بنجاح
      if (biometricAvailable && !biometricEnabled) {
        Alert.alert(
          '🔐 المصادقة البيومترية',
          `هل تريد تفعيل تسجيل الدخول باستخدام ${
            biometricType === 'FaceID' ? 'بصمة الوجه' : 
            biometricType === 'TouchID' ? 'بصمة الإصبع' : 
            'المصادقة البيومترية'
          }؟`,
          [
            { text: 'لاحقاً', style: 'cancel' },
            {
              text: 'نعم، فعّل',
              onPress: async () => {
                const enabled = await BiometricService.enableBiometric(email, password);
                if (enabled) {
                  setBiometricEnabled(true);
                  Alert.alert(
                    '✅ تم التفعيل',
                    'يمكنك الآن تسجيل الدخول باستخدام المصادقة البيومترية'
                  );
                }
              },
            },
          ]
        );
      }
    } else {
      Alert.alert('خطأ', result.error);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      Alert.alert('خطأ', 'يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setResetLoading(true);
    try {
      await apiClient.post('/api/auth/forgot-password', { email: resetEmail });
      
      Alert.alert(
        'تم الإرسال ✅',
        `تم إرسال رابط إعادة تعيين كلمة المرور إلى:\n${resetEmail}\n\nيرجى التحقق من بريدك`,
        [{ text: 'حسناً', onPress: () => {
          setShowForgotModal(false);
          setResetEmail('');
        }}]
      );
    } catch (error) {
      Alert.alert('خطأ', error?.response?.data?.error || 'فشل إرسال البريد');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            <Text style={styles.titleRed}>Q8</Text>
            <Text style={styles.titleWhite}> Sport Car</Text>
          </Text>
          <Text style={styles.subtitle}>تسجيل الدخول</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="📧 البريد الإلكتروني"
              placeholderTextColor="#555"
              value={email}
              onChangeText={(text) => setEmail(text.trim())}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="🔒 كلمة المرور"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => setShowForgotModal(true)}
            activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>📧 نسيت كلمة السر؟</Text>
          </TouchableOpacity>

          <Modal
            visible={showForgotModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowForgotModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>🔒 إعادة تعيين كلمة المرور</Text>
                <Text style={styles.modalSubtitle}>
                  أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
                </Text>
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="البريد الإلكتروني"
                  placeholderTextColor="#666"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setShowForgotModal(false);
                      setResetEmail('');
                    }}>
                    <Text style={styles.modalButtonTextCancel}>إلغاء</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSend]}
                    onPress={handleForgotPassword}
                    disabled={resetLoading}>
                    {resetLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.modalButtonTextSend}>إرسال</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* زر المصادقة البيومترية - يظهر فقط إذا كانت متوفرة ومفعلة */}
          {biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
              activeOpacity={0.7}>
              {loading ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Text style={styles.biometricIcon}>
                    {biometricType === 'FaceID' ? '👤' : 
                     biometricType === 'TouchID' ? '👆' : 
                     '🔐'}
                  </Text>
                  <Text style={styles.biometricText}>
                    {biometricType === 'FaceID' ? 'تسجيل الدخول ببصمة الوجه' : 
                     biometricType === 'TouchID' ? 'تسجيل الدخول ببصمة الإصبع' : 
                     'تسجيل الدخول بالبيومترية'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.6}>
            <Text style={styles.linkText}>
              ليس لديك حساب؟ <Text style={styles.linkTextBold}>سجل الآن</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  logo: {
    width: '100%',
    height: 250,
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  titleRed: {
    color: '#DC2626',
  },
  titleWhite: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    textAlign: 'right',
    fontSize: 15,
  },
  eyeIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  biometricButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  biometricIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  biometricText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#DC2626',
    fontWeight: '700',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'right',
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#333',
  },
  modalButtonSend: {
    backgroundColor: '#DC2626',
  },
  modalButtonTextCancel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonTextSend: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LoginScreen;
