import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../lib/theme';
import { t } from '../../i18n';

export default function RegisterScreen({ navigation }: any) {
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
      Alert.alert('خطأ', 'حدث خطأ، حاول مرة ثانية');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.card}>
        <Text style={s.logo}><Text style={{ color: colors.primary }}>Q8</Text> SPORT CAR</Text>
        <Text style={s.title}>{t('register')}</Text>

        <TextInput style={s.input} placeholder={t('name')} placeholderTextColor={colors.silver + '60'} value={name} onChangeText={setName} />
        <TextInput style={s.input} placeholder={t('email')} placeholderTextColor={colors.silver + '60'} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder={t('phone')} placeholderTextColor={colors.silver + '60'} value={phone} onChangeText={(v) => { setPhone(v); if (samePhone) setWhatsapp(v); }} keyboardType="phone-pad" />

        <TouchableOpacity style={s.checkRow} onPress={() => setSamePhone(!samePhone)}>
          <View style={[s.checkbox, samePhone && s.checked]} />
          <Text style={s.checkText}>رقم الواتساب نفس رقم الجوال</Text>
        </TouchableOpacity>

        {!samePhone && (
          <TextInput style={s.input} placeholder={t('whatsapp')} placeholderTextColor={colors.silver + '60'} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />
        )}

        <TextInput style={s.input} placeholder={t('password')} placeholderTextColor={colors.silver + '60'} value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
          <Text style={s.btnText}>{loading ? t('loading') : t('register')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.link}>
          <Text style={s.linkText}>{t('hasAccount')} <Text style={{ color: colors.primary }}>{t('login')}</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  content: { justifyContent: 'center', padding: 20, paddingTop: 60 },
  card: { backgroundColor: colors.darkCard, borderRadius: 20, borderWidth: 1, borderColor: colors.metal, padding: 24 },
  logo: { fontSize: 22, fontWeight: '900', color: colors.white, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: colors.white, textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.white, marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: colors.metalLight },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { color: colors.silver, fontSize: 13 },
  btn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: colors.silver, fontSize: 13 },
});
