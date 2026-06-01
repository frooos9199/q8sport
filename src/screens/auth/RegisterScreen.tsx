import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { useAuth } from '../../hooks/useAuth';
import GccPhoneInput from '../../components/GccPhoneInput';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/LocaleProvider';
import { buildE164, getGccCountry, type GccCountry } from '../../lib/gccPhone';

export default function RegisterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { register, signInWithApple } = useAuth();
  const { locale, setAppLocale } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<GccCountry['code']>('KW');
  const [phoneNational, setPhoneNational] = useState('');
  const [whatsappCountry, setWhatsappCountry] = useState<GccCountry['code']>('KW');
  const [whatsappNational, setWhatsappNational] = useState('');
  const [password, setPassword] = useState('');
  const [samePhone, setSamePhone] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const phoneExpectedLen = getGccCountry(phoneCountry).nationalNumberLength;
    if (!name || !email || phoneNational.length !== phoneExpectedLen || !password) return;

    if (!samePhone) {
      const waExpectedLen = getGccCountry(whatsappCountry).nationalNumberLength;
      if (whatsappNational.length !== waExpectedLen) {
        Alert.alert(t('loginErrorTitle'), t('whatsappDigitsMsg', { n: waExpectedLen }));
        return;
      }
    }

    const phoneE164 = buildE164(phoneCountry, phoneNational);
    const whatsappE164 = samePhone
      ? phoneE164
      : buildE164(whatsappCountry, whatsappNational);

    if (!phoneE164) {
      Alert.alert(t('loginErrorTitle'), t('enterPhoneMsg'));
      return;
    }

    if (!samePhone && !whatsappE164) {
      Alert.alert(t('loginErrorTitle'), t('enterWhatsappMsg'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('loginErrorTitle'), t('passwordMinMsg'));
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, phone: phoneE164, whatsapp: whatsappE164, password });
    } catch (e: any) {
      const code = typeof e?.code === 'string' ? e.code : '';
      const message = typeof e?.message === 'string' ? e.message : '';
      console.log('Register error:', { code, message });

      if (code === 'auth/email-already-in-use') {
        Alert.alert(t('loginErrorTitle'), t('emailAlreadyUsedMsg'));
      } else if (code === 'app/phone-already-in-use') {
        Alert.alert(t('loginErrorTitle'), t('phoneAlreadyUsedMsg'));
      } else if (code === 'auth/invalid-email') {
        Alert.alert(t('loginErrorTitle'), t('invalidEmailMsg'));
      } else if (code === 'auth/weak-password') {
        Alert.alert(t('loginErrorTitle'), t('weakPasswordMsg'));
      } else if (code === 'auth/network-request-failed') {
        Alert.alert(t('loginErrorTitle'), t('networkErrorMsg'));
      } else if (code === 'auth/internal-error') {
        Alert.alert(t('loginErrorTitle'), t('internalFirebaseErrorMsg'));
      } else {
        Alert.alert(
          t('loginErrorTitle'),
          code ? t('registerErrorWithCodeMsg', { code }) : t('registerErrorGenericMsg'),
        );
      }
    }
    setLoading(false);
  };

  const handleAppleRegister = async () => {
    setLoading(true);
    try {
      await signInWithApple();
    } catch (e: any) {
      const code = typeof e?.code === 'string' ? e.code : '';
      if (code === '1001' || code === 'ERR_CANCELED') {
        setLoading(false);
        return;
      }
      Alert.alert(t('loginErrorTitle'), t('appleRegisterFailedMsg'));
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
        </View>

        <View style={s.card}>
          <Text style={s.title}>{t('register')}</Text>

          <InputField icon="👤" placeholder={t('name')} value={name} onChangeText={setName} />
          <InputField icon="📧" placeholder={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <View style={{ marginBottom: 12 }}>
            <GccPhoneInput
              icon="📱"
              country={phoneCountry}
              onCountryChange={(code) => {
                setPhoneCountry(code);
                if (samePhone) setWhatsappCountry(code);
              }}
              nationalNumber={phoneNational}
              onNationalNumberChange={(value) => {
                setPhoneNational(value);
                if (samePhone) setWhatsappNational(value);
              }}
              placeholder={t('phone')}
            />
          </View>

          <TouchableOpacity
            style={s.checkRow}
            onPress={() => {
              setSamePhone((current) => {
                const next = !current;
                if (next) {
                  setWhatsappCountry(phoneCountry);
                  setWhatsappNational(phoneNational);
                }
                return next;
              });
            }}
          >
            <View style={[s.checkbox, samePhone && s.checked]}>
              {samePhone && <Text style={s.checkMark}>✓</Text>}
            </View>
            <Text style={s.checkText}>{t('whatsappSameAsPhone')}</Text>
          </TouchableOpacity>

          {!samePhone ? (
            <View style={{ marginBottom: 12 }}>
              <GccPhoneInput
                icon="💬"
                country={whatsappCountry}
                onCountryChange={setWhatsappCountry}
                nationalNumber={whatsappNational}
                onNationalNumberChange={setWhatsappNational}
                placeholder={t('whatsapp')}
              />
            </View>
          ) : null}

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

          {Platform.OS === 'ios' ? (
            <View style={s.appleWrap}>
              <AppleButton
                buttonStyle={AppleButton.Style.WHITE}
                buttonType={AppleButton.Type.SIGN_UP}
                style={s.appleButton}
                cornerRadius={radius.lg}
                onPress={handleAppleRegister}
              />
            </View>
          ) : null}

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.link}>
            <Text style={s.linkText}>{t('hasAccount')} <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('login')}</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ icon, ...props }: any) {
  const [hidden, setHidden] = useState(Boolean(props.secureTextEntry));

  return (
    <View style={s.inputWrap}>
      <Text style={s.inputIcon}>{icon}</Text>
      <TextInput
        style={s.input}
        placeholderTextColor={colors.silver + '50'}
        {...props}
        secureTextEntry={props.secureTextEntry ? hidden : false}
      />
      {props.secureTextEntry ? (
        <TouchableOpacity onPress={() => setHidden((current) => !current)} style={s.eyeButton}>
          <Text style={s.eyeText}>{hidden ? '👁️' : '🙈'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  scroll: { flexGrow: 1, padding: spacing.xl },
  bgGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },

  logoSection: { alignItems: 'center', marginBottom: 24 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
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
  logoQ8: { fontSize: 40, fontWeight: '900', color: colors.primary },
  logoSport: { fontSize: 16, fontWeight: '800', color: colors.white, letterSpacing: 3 },

  card: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 24, ...shadows.card },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, textAlign: 'center', marginBottom: 24 },

  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.lg, paddingHorizontal: spacing.lg, marginBottom: 12 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, color: colors.white, fontSize: 15 },
  eyeButton: { paddingLeft: 10, paddingVertical: 8 },
  eyeText: { fontSize: 18 },

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
  appleWrap: { marginTop: 12 },
  appleButton: { width: '100%', height: 52 },

  link: { marginTop: 22, alignItems: 'center' },
  linkText: { color: colors.silver, fontSize: 13 },
});
