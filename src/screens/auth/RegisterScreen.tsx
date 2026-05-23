import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';

export default function RegisterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [samePhone, setSamePhone] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) return;
    if (password.length < 6) { Alert.alert('خطأ', 'كلمة المرور لازم 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      await register({ name, email, phone, whatsapp: samePhone ? phone : whatsapp, password });
    } catch (e: any) {
      const code = typeof e?.code === 'string' ? e.code : '';
      const message = typeof e?.message === 'string' ? e.message : '';
      console.log('Register error:', { code, message });

      if (code === 'auth/email-already-in-use') {
        Alert.alert('خطأ', 'هذا البريد مستخدم من قبل');
      } else if (code === 'auth/invalid-email') {
        Alert.alert('خطأ', 'البريد الإلكتروني غير صحيح');
      } else if (code === 'auth/weak-password') {
        Alert.alert('خطأ', 'كلمة المرور ضعيفة');
      } else if (code === 'auth/network-request-failed') {
        Alert.alert('خطأ', 'تأكد من اتصال الإنترنت وحاول مرة ثانية');
      } else if (code === 'auth/internal-error') {
        Alert.alert('خطأ', 'خطأ داخلي من Firebase. غالباً مشكلة إعدادات iOS (GoogleService-Info.plist) أو إعدادات مشروع Firebase.');
      } else {
        Alert.alert('خطأ', code ? `حدث خطأ (${code})` : 'حدث خطأ، حاول مرة ثانية');
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          {
            paddingTop: Math.max(60, insets.top + 24),
            paddingBottom: tabBarHeight + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['rgba(227,30,36,0.06)', 'transparent']} style={s.bgGlow} />

        <View style={s.logoSection}>
          <Text style={s.logoQ8}>Q8</Text>
          <Text style={s.logoSport}>SPORT CAR</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>{t('register')}</Text>

          <InputField icon="👤" placeholder={t('name')} value={name} onChangeText={setName} />
          <InputField icon="📧" placeholder={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <InputField icon="📱" placeholder={t('phone')} value={phone} onChangeText={(v: string) => { setPhone(v); if (samePhone) setWhatsapp(v); }} keyboardType="phone-pad" />

          <TouchableOpacity style={s.checkRow} onPress={() => setSamePhone(!samePhone)}>
            <View style={[s.checkbox, samePhone && s.checked]}>
              {samePhone && <Text style={s.checkMark}>✓</Text>}
            </View>
            <Text style={s.checkText}>رقم الواتساب نفس رقم الجوال</Text>
          </TouchableOpacity>

          {!samePhone && <InputField icon="💬" placeholder={t('whatsapp')} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />}

          <InputField icon="🔒" placeholder={t('password')} value={password} onChangeText={setPassword} secureTextEntry />

          <View style={s.btnWrap}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleRegister} disabled={loading} style={s.btnTouch}>
              <View style={s.btn}>
                <LinearGradient
                  colors={colors.gradient.primary as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.btnFill}
                />
                <Text style={s.btnText}>{loading ? t('loading') : t('register')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.link}>
            <Text style={s.linkText}>{t('hasAccount')} <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('login')}</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ icon, ...props }: any) {
  return (
    <View style={s.inputWrap}>
      <Text style={s.inputIcon}>{icon}</Text>
      <TextInput style={s.input} placeholderTextColor={colors.silver + '50'} {...props} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  scroll: { flexGrow: 1, padding: spacing.xl },
  bgGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },

  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoQ8: { fontSize: 40, fontWeight: '900', color: colors.primary },
  logoSport: { fontSize: 16, fontWeight: '800', color: colors.white, letterSpacing: 3 },

  card: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 24, ...shadows.card },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, textAlign: 'center', marginBottom: 24 },

  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.lg, paddingHorizontal: spacing.lg, marginBottom: 12 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, color: colors.white, fontSize: 15 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingHorizontal: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: colors.metalBorder, justifyContent: 'center', alignItems: 'center' },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: colors.white, fontSize: 12, fontWeight: '900' },
  checkText: { color: colors.silver, fontSize: 13 },

  btnWrap: { marginTop: 10, marginBottom: 4 },
  btnTouch: { borderRadius: radius.lg, overflow: 'hidden' },
  btn: { paddingVertical: 18, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', width: '100%' },
  btnFill: { ...StyleSheet.absoluteFillObject },
  btnText: { color: colors.white, fontWeight: '900', fontSize: 17 },

  link: { marginTop: 22, alignItems: 'center' },
  linkText: { color: colors.silver, fontSize: 13 },
});
