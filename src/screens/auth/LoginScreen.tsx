import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth, sendPasswordResetEmail } from '@react-native-firebase/auth';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { useAuth } from '../../hooks/useAuth';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/LocaleProvider';

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { login, signInWithApple } = useAuth();
  const { locale, setAppLocale } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      if (e?.message === 'user-disabled-by-admin') {
        Alert.alert(t('accountDisabledTitle'), t('accountDisabledMsg'));
      } else {
        Alert.alert(t('loginErrorTitle'), t('loginErrorMsg'));
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert(t('forgotPassword'), t('resetNeedEmailMsg'));
      return;
    }

    setResetting(true);
    try {
      const authInstance = getAuth();
      await sendPasswordResetEmail(authInstance, normalizedEmail);
      Alert.alert(t('resetSentTitle'), t('resetSentMsg'));
    } catch (e: any) {
      const code = typeof e?.code === 'string' ? e.code : '';
      const message = typeof e?.message === 'string' ? e.message : '';
      console.log('Password reset error:', { code, message });

      if (code === 'auth/user-not-found') {
        Alert.alert(t('loginErrorTitle'), t('userNotFoundMsg'));
      } else if (code === 'auth/invalid-email') {
        Alert.alert(t('loginErrorTitle'), t('invalidEmailMsg'));
      } else if (code === 'auth/network-request-failed') {
        Alert.alert(t('loginErrorTitle'), t('networkErrorMsg'));
      } else if (code === 'auth/internal-error') {
        Alert.alert(t('loginErrorTitle'), t('internalFirebaseErrorMsg'));
      } else {
        Alert.alert(
          t('loginErrorTitle'),
          code ? t('resetLinkFailedWithCodeMsg', { code }) : t('resetLinkFailedMsg'),
        );
      }
    }
    setResetting(false);
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithApple();
    } catch (e: any) {
      const code = typeof e?.code === 'string' ? e.code : '';
      if (code === '1001' || code === 'ERR_CANCELED') {
        setLoading(false);
        return;
      }
      if (e?.message === 'user-disabled-by-admin') {
        Alert.alert(t('accountDisabledTitle'), t('accountDisabledMsg'));
      } else {
        Alert.alert(t('loginErrorTitle'), t('appleLoginFailedMsg'));
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
      <LinearGradient colors={['rgba(227,30,36,0.06)', 'transparent', 'transparent']} style={s.bgGlow} />

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          {
            paddingTop: Math.max(spacing.xl, insets.top + spacing.xl),
            paddingBottom: tabBarHeight + spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.logoSection}>
          <View style={s.langRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setAppLocale('ar')}
              style={[s.langBtn, locale === 'ar' && s.langBtnActive]}
            >
              <Text style={s.langFlag}>🇰🇼</Text>
              <Text style={[s.langText, locale === 'ar' && s.langTextActive]}>{t('languageArabic')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setAppLocale('en')}
              style={[s.langBtn, locale === 'en' && s.langBtnActive]}
            >
              <Text style={s.langFlag}>🇺🇸</Text>
              <Text style={[s.langText, locale === 'en' && s.langTextActive]}>{t('languageEnglish')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.logoQ8}>Q8</Text>
          <Text style={s.logoSport}>SPORT CAR</Text>
          <View style={s.logoLine} />
        </View>

        <View style={s.card}>
          <Text style={s.title}>{t('login')}</Text>

          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>📧</Text>
            <TextInput
              style={s.input}
              placeholder={t('email')}
              placeholderTextColor={colors.silver + '50'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput
              style={s.input}
              placeholder={t('password')}
              placeholderTextColor={colors.silver + '50'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((current) => !current)} style={s.eyeButton}>
              <Text style={s.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={s.btnWrap}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleLogin} disabled={loading} style={s.btnTouch}>
              <View style={s.btn}>
                <LinearGradient
                  colors={colors.gradient.primary as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.btnFill}
                />
                <Text style={s.btnText}>{loading ? t('loading') : t('login')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'ios' ? (
            <View style={s.appleWrap}>
              <AppleButton
                buttonStyle={AppleButton.Style.WHITE}
                buttonType={AppleButton.Type.SIGN_IN}
                style={s.appleButton}
                cornerRadius={radius.lg}
                onPress={handleAppleSignIn}
              />
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={resetting}
            style={s.forgotLink}
          >
            <Text style={s.forgotText}>{resetting ? t('loading') : t('forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.link}>
            <Text style={s.linkText}>{t('noAccount')} <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('register')}</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  bgGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },

  logoSection: { alignItems: 'center', marginBottom: 32 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.metal,
  },
  langBtnActive: { borderColor: colors.primaryBorder, backgroundColor: colors.darkCard },
  langFlag: { fontSize: 16 },
  langText: { color: colors.silver, fontSize: 12, fontWeight: '800' },
  langTextActive: { color: colors.white },
  logoQ8: { fontSize: 50, fontWeight: '900', color: colors.primary },
  logoSport: { fontSize: 18, fontWeight: '800', color: colors.white, letterSpacing: 3 },
  logoLine: { width: 40, height: 3, backgroundColor: colors.primary, borderRadius: 2, marginTop: 12 },

  card: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 28, ...shadows.card },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, textAlign: 'center', marginBottom: 24 },

  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.lg, paddingHorizontal: spacing.lg, marginBottom: 14 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, color: colors.white, fontSize: 15 },
  eyeButton: { paddingLeft: 10, paddingVertical: 8 },
  eyeText: { fontSize: 18 },

  btnWrap: { marginTop: 10, marginBottom: 4 },
  btnTouch: { borderRadius: radius.lg, overflow: 'hidden' },
  btn: { paddingVertical: 18, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', width: '100%' },
  btnFill: { ...StyleSheet.absoluteFillObject },
  btnText: { color: colors.white, fontWeight: '900', fontSize: 17 },
  appleWrap: { marginTop: 12 },
  appleButton: { width: '100%', height: 52 },

  forgotLink: { marginTop: 14, alignItems: 'center' },
  forgotText: { color: colors.silver, fontSize: 13, textDecorationLine: 'underline' },

  link: { marginTop: 22, alignItems: 'center' },
  linkText: { color: colors.silver, fontSize: 13 },
});
