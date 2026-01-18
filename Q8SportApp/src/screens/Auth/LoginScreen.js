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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import BiometricService from '../../services/BiometricService';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

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
              placeholder="البريد الإلكتروني"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
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
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 24,
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
});

export default LoginScreen;
