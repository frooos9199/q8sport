import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../lib/theme';
import { t } from '../../i18n';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      Alert.alert('خطأ', 'البريد أو كلمة المرور غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.logo}><Text style={{ color: colors.primary }}>Q8</Text> SPORT CAR</Text>
        <Text style={s.title}>{t('login')}</Text>

        <TextInput style={s.input} placeholder={t('email')} placeholderTextColor={colors.silver + '60'}
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder={t('password')} placeholderTextColor={colors.silver + '60'}
          value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          <Text style={s.btnText}>{loading ? t('loading') : t('login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.link}>
          <Text style={s.linkText}>{t('noAccount')} <Text style={{ color: colors.primary }}>{t('register')}</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: colors.darkCard, borderRadius: 20, borderWidth: 1, borderColor: colors.metal, padding: 24 },
  logo: { fontSize: 22, fontWeight: '900', color: colors.white, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: colors.white, textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.white, marginBottom: 12 },
  btn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: colors.silver, fontSize: 13 },
});
