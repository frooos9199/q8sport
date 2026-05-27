import React from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, useWindowDimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import LazyImage from '../../components/LazyImage';
import { useAuth } from '../../hooks/useAuth';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';

export default function AccountScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const { user, logout, updateContactInfo, updateProfileAvatar } = useAuth();
  const [phone, setPhone] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [avatarUploading, setAvatarUploading] = React.useState(false);

  React.useEffect(() => {
    setPhone(user?.phone || '');
    setWhatsapp(user?.whatsapp || '');
  }, [user?.phone, user?.whatsapp]);

  if (!user) return null;

  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const compactScreen = width < 360;

  const navigateToTab = (tabName: string, params?: object) => {
    const parent = navigation?.getParent?.();
    if (parent?.navigate) parent.navigate(tabName, params);
    else navigation.navigate(tabName, params);
  };

  const menuItems = user.isAdmin
    ? [
        {
          key: 'adminListings',
          icon: '🛡️',
          label: 'إدارة السوق',
          desc: 'إدارة كل السيارات والقطع والطلبات مع تعديل وحذف وتغيير الحالة',
          onPress: () => navigation.navigate('MyListings', { adminView: true }),
        },
        {
          key: 'publish',
          icon: '➕',
          label: 'مركز النشر',
          desc: 'إضافة سيارة أو قطعة أو مطلوب جديد من مكان واحد',
          onPress: () => navigateToTab('AccountTab', { screen: 'CreateListingHub' }),
        },
        {
          key: 'userManagement',
          icon: '👥',
          label: 'إدارة المستخدمين',
          desc: 'عرض كل الحسابات والبحث فيها ومنح أو سحب صلاحية الإدارة',
          onPress: () => navigation.navigate('UserManagement'),
        },
        {
          key: 'banners',
          icon: '🖼️',
          label: 'إدارة البانرات',
          desc: 'رفع بانرات إعلانية وتفعيلها أو إخفاؤها من التطبيق',
          onPress: () => navigation.navigate('BannerManagement'),
        },
      ]
    : [
        {
          key: 'publish',
          icon: '➕',
          label: 'أضف إعلان',
          desc: 'نشر سيارة أو قطعة جديدة مباشرة في السوق',
          onPress: () => navigateToTab('AccountTab', { screen: 'CreateListingHub' }),
        },
        {
          key: 'wanted',
          icon: '🔥',
          label: 'انشر مطلوب',
          desc: 'أضف طلبك وخله ظاهر لكل السوق',
          onPress: () => navigateToTab('RequestsTab', { screen: 'CreateRequest' }),
        },
        {
          key: 'myListings',
          icon: '🗂️',
          label: 'إعلاناتي',
          desc: 'إدارة كل سياراتك وقطعك ومطلوباتك',
          onPress: () => navigation.navigate('MyListings'),
        },
      ];

  const hasChanges = phone.trim() !== (user.phone || '').trim() || whatsapp.trim() !== (user.whatsapp || '').trim();

  const saveContactInfo = async () => {
    const phoneValue = phone.trim();
    const whatsappValue = whatsapp.trim();

    if (!phoneValue && !whatsappValue) {
      Alert.alert('تنبيه', 'أدخل رقم الموبايل أو الواتساب على الأقل');
      return;
    }

    setSaving(true);
    try {
      await updateContactInfo({ phone: phoneValue, whatsapp: whatsappValue });
      Alert.alert('تم', 'تم تحديث بيانات التواصل');
    } catch {
      Alert.alert('خطأ', 'تعذر تحديث بيانات التواصل');
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8 });
    if (result.didCancel) return;

    const avatarUri = result.assets?.[0]?.uri;
    if (!avatarUri) return;

    setAvatarUploading(true);
    try {
      await updateProfileAvatar(avatarUri);
      Alert.alert('تم', 'تم تحديث صورة الحساب وستظهر في إعلاناتك');
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر رفع صورة الحساب');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: screenPadding }} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <View style={[s.profileCard, compactScreen && s.profileCardCompact]}>
        <LinearGradient colors={['rgba(227,30,36,0.1)', 'transparent']} style={s.profileGlow} />
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            {user.avatar ? (
              <LazyImage
                uri={user.avatar}
                style={s.avatarImage}
                fallback={
                  <>
                    <LinearGradient colors={colors.gradient.primary as string[]} style={s.avatarFill} />
                    <Text style={s.avatarText}>{user.name?.[0] || '?'}</Text>
                  </>
                }
              />
            ) : (
              <>
                <LinearGradient colors={colors.gradient.primary as string[]} style={s.avatarFill} />
                <Text style={s.avatarText}>{user.name?.[0] || '?'}</Text>
              </>
            )}
          </View>
          <TouchableOpacity style={s.avatarEditBtn} activeOpacity={0.88} onPress={pickAvatar} disabled={avatarUploading}>
            {avatarUploading ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={s.avatarEditText}>📷</Text>}
          </TouchableOpacity>
        </View>
        <Text style={s.name}>{user.name}</Text>
        <Text style={s.email}>{user.email}</Text>
        <View style={s.marketBadge}>
          <Text style={s.marketText}>{user.isAdmin ? 'صلاحية إدارة كاملة' : 'KUWAIT SPORT MARKET'}</Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={s.infoCard}>
        <View style={s.formField}>
          <Text style={s.infoLabel}>{t('phone')}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={s.input}
            placeholder="اكتب رقم الموبايل"
            placeholderTextColor={colors.silver + '66'}
            keyboardType="phone-pad"
          />
        </View>
        <View style={s.infoDivider} />
        <View style={s.formField}>
          <Text style={s.infoLabel}>{t('whatsapp')}</Text>
          <TextInput
            value={whatsapp}
            onChangeText={setWhatsapp}
            style={s.input}
            placeholder="اكتب رقم الواتساب"
            placeholderTextColor={colors.silver + '66'}
            keyboardType="phone-pad"
          />
        </View>
        <TouchableOpacity
          style={[s.saveBtn, (!hasChanges || saving) && s.saveBtnDisabled]}
          activeOpacity={0.85}
          onPress={saveContactInfo}
          disabled={!hasChanges || saving}
        >
          <Text style={s.saveBtnText}>{saving ? 'جاري الحفظ...' : 'حفظ بيانات التواصل'}</Text>
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <View style={s.menuSection}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={item.key ?? i} style={[s.menuItem, compactScreen && s.menuItemCompact]} activeOpacity={0.85} onPress={item.onPress}>
            <View style={s.menuIconWrap}><Text style={s.menuIcon}>{item.icon}</Text></View>
            <View style={s.menuContent}>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuDesc}>{item.desc}</Text>
            </View>
            {!compactScreen ? <Text style={s.menuArrow}>←</Text> : null}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} activeOpacity={0.85} onPress={logout}>
        <Text style={s.logoutText}>🚪 {t('logout')}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },

  // Profile
  profileCard: { alignItems: 'center', backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 28, marginBottom: 16, overflow: 'hidden', ...shadows.card },
  profileCardCompact: { padding: 22 },
  profileGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatarFill: { ...StyleSheet.absoluteFillObject },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '900' },
  avatarEditBtn: { position: 'absolute', right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.darkCard, alignItems: 'center', justifyContent: 'center' },
  avatarEditText: { fontSize: 14 },
  name: { color: colors.white, fontSize: 22, fontWeight: '900' },
  email: { color: colors.silver, fontSize: 13, marginTop: 4 },
  marketBadge: { backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.full, marginTop: 12 },
  marketText: { color: colors.primary, fontWeight: '800', fontSize: 12 },

  // Info
  infoCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 16 },
  formField: { paddingVertical: 6 },
  infoLabel: { color: colors.silver, fontSize: 11 },
  input: { marginTop: 8, backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.lg, color: colors.white, fontSize: 15, paddingHorizontal: 14, paddingVertical: 14 },
  infoDivider: { height: 1, backgroundColor: colors.metalBorder, marginVertical: 12 },
  saveBtn: { marginTop: 16, backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: colors.primary, fontWeight: '900', fontSize: 14 },

  // Menu
  menuSection: { marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 16, marginBottom: 10 },
  menuItemCompact: { alignItems: 'flex-start' },
  menuIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuIcon: { fontSize: 20 },
  menuContent: { flex: 1 },
  menuLabel: { color: colors.white, fontWeight: '700', fontSize: 15 },
  menuDesc: { color: colors.silver, fontSize: 11, marginTop: 2 },
  menuArrow: { color: colors.silver, fontSize: 18 },

  // Logout
  logoutBtn: { backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, paddingVertical: 17, borderRadius: radius.xl, alignItems: 'center' },
  logoutText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
});
