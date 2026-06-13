import React from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, useWindowDimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import LazyImage from '../../components/LazyImage';
import GccPhoneInput from '../../components/GccPhoneInput';
import { useAuth } from '../../hooks/useAuth';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { useLocale } from '../../i18n/LocaleProvider';
import { buildE164, parseToGccNumber, getGccCountry, type GccCountry } from '../../lib/gccPhone';
import { openAdminWhatsapp } from '../../lib/adminWhatsapp';
import { getTotalCredits, normalizeUserCredits } from '../../lib/userCredits';

export default function AccountScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const { user, logout, updateContactInfo, updateProfileAvatar } = useAuth();
  const { locale, setAppLocale } = useLocale();
  const [phoneCountry, setPhoneCountry] = React.useState<GccCountry['code']>('KW');
  const [phoneNational, setPhoneNational] = React.useState('');
  const [whatsappCountry, setWhatsappCountry] = React.useState<GccCountry['code']>('KW');
  const [whatsappNational, setWhatsappNational] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [avatarUploading, setAvatarUploading] = React.useState(false);

  React.useEffect(() => {
    const parsedPhone = parseToGccNumber(user?.phone || '', { defaultCountry: 'KW' });
    const parsedWhatsapp = parseToGccNumber(user?.whatsapp || '', { defaultCountry: 'KW' });
    setPhoneCountry(parsedPhone.country);
    setPhoneNational(parsedPhone.nationalNumber);
    setWhatsappCountry(parsedWhatsapp.country);
    setWhatsappNational(parsedWhatsapp.nationalNumber);
  }, [user?.phone, user?.whatsapp]);

  if (!user) return null;

  const isSuperAdmin = Boolean(user.isSuperAdmin);
  const isAdmin = Boolean(user.isAdmin || user.isSuperAdmin);

  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const compactScreen = width < 360;
  const credits = normalizeUserCredits(user.credits);

  const navigateToTab = (tabName: string, params?: object) => {
    const parent = navigation?.getParent?.();
    if (parent?.navigate) parent.navigate(tabName, params);
    else navigation.navigate(tabName, params);
  };

  const openPopupAdsAdmin = () => navigation.navigate('PopupAdsManagement');

  const contactAdmin = async () => {
    await openAdminWhatsapp(locale === 'ar' ? 'مرحبا، عندي استفسار بخصوص تطبيق Q8 Sport Car' : 'Hi, I have a question about Q8 Sport Car app.');
  };

  const menuItems = isSuperAdmin
    ? [
        {
          key: 'adminListings',
          icon: '🛡️',
          label: t('menuAdminMarketLabel'),
          desc: t('menuAdminMarketDesc'),
          onPress: () => navigation.navigate('MyListings', { adminView: true }),
        },
        {
          key: 'publish',
          icon: '➕',
          label: t('menuPublishHubLabel'),
          desc: t('menuPublishHubDesc'),
          onPress: () => navigateToTab('AccountTab', { screen: 'CreateListingHub' }),
        },
        {
          key: 'userManagement',
          icon: '👥',
          label: t('menuUserManagementLabel'),
          desc: t('menuUserManagementDesc'),
          onPress: () => navigation.navigate('UserManagement'),
        },
        {
          key: 'banners',
          icon: '🖼️',
          label: t('menuBannersLabel'),
          desc: t('menuBannersDesc'),
          onPress: () => navigation.navigate('BannerManagement'),
        },
        {
          key: 'popupAds',
          icon: '🪧',
          label: 'Popup Ads',
          desc: 'إدارة الإعلانات الافتتاحية',
          onPress: openPopupAdsAdmin,
        },
      ]
    : isAdmin
      ? [
          {
            key: 'adminListings',
            icon: '🛡️',
            label: t('menuAdminMarketLabel'),
            desc: t('menuAdminMarketDesc'),
            onPress: () => navigation.navigate('MyListings', { adminView: true }),
          },
          {
            key: 'publish',
            icon: '➕',
            label: t('menuPublishHubLabel'),
            desc: t('menuPublishHubDesc'),
            onPress: () => navigateToTab('AccountTab', { screen: 'CreateListingHub' }),
          },
          {
            key: 'popupAds',
            icon: '🪧',
            label: 'Popup Ads',
            desc: 'إدارة الإعلانات الافتتاحية',
            onPress: openPopupAdsAdmin,
          },
        ]
    : [
        {
          key: 'publish',
          icon: '➕',
          label: t('menuAddAdLabel'),
          desc: t('menuAddAdDesc'),
          onPress: () => navigateToTab('AccountTab', { screen: 'CreateListingHub' }),
        },
        {
          key: 'wanted',
          icon: '🔥',
          label: t('menuPostWantedLabel'),
          desc: t('menuPostWantedDesc'),
          onPress: () => navigateToTab('RequestsTab', { screen: 'CreateRequest' }),
        },
        {
          key: 'myListings',
          icon: '🗂️',
          label: t('menuMyListingsLabel'),
          desc: t('menuMyListingsDesc'),
          onPress: () => navigation.navigate('MyListings'),
        },
      ];

  const nextPhoneValue = buildE164(phoneCountry, phoneNational);
  const nextWhatsappValue = buildE164(whatsappCountry, whatsappNational);
  const hasChanges = nextPhoneValue.trim() !== (user.phone || '').trim() || nextWhatsappValue.trim() !== (user.whatsapp || '').trim();

  const saveContactInfo = async () => {
    const phoneExpectedLen = getGccCountry(phoneCountry).nationalNumberLength;
    const whatsappExpectedLen = getGccCountry(whatsappCountry).nationalNumberLength;

    if (phoneNational && phoneNational.length !== phoneExpectedLen) {
      Alert.alert(t('warningTitle'), t('phoneDigitsMsg', { n: phoneExpectedLen }));
      return;
    }
    if (whatsappNational && whatsappNational.length !== whatsappExpectedLen) {
      Alert.alert(t('warningTitle'), t('whatsappDigitsMsg', { n: whatsappExpectedLen }));
      return;
    }

    const phoneValue = buildE164(phoneCountry, phoneNational).trim();
    const whatsappValue = buildE164(whatsappCountry, whatsappNational).trim();

    if (!phoneValue && !whatsappValue) {
      Alert.alert(t('warningTitle'), t('needAtLeastOneContactMsg'));
      return;
    }

    setSaving(true);
    try {
      await updateContactInfo({ phone: phoneValue, whatsapp: whatsappValue });
      Alert.alert(t('successTitle'), t('contactUpdatedMsg'));
    } catch {
      Alert.alert(t('loginErrorTitle'), t('contactUpdateFailedMsg'));
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
      Alert.alert(t('successTitle'), t('avatarUpdatedMsg'));
    } catch (error: any) {
      Alert.alert(t('loginErrorTitle'), error?.message || t('avatarUploadFailedMsg'));
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
        <View style={s.nameRow}>
          <Text style={s.name}>{user.name}</Text>
          {user.campaign?.founderPosition ? (
            <View style={s.tierBadge}>
              <Text style={s.tierBadgeText}>{user.campaign?.tierLabel || t('founderLabel')}</Text>
            </View>
          ) : null}
        </View>
        {user.campaign?.founderPosition ? (
          <Text style={s.founderRewardText}>{user.campaign?.rewardLabel || 'إعلاناتك مجانية بالكامل'}</Text>
        ) : null}
        <Text style={s.email}>{user.email}</Text>
        <View style={s.marketBadge}>
          <Text style={s.marketText}>{isSuperAdmin ? t('superAdminBadge') : isAdmin ? t('adminBadge') : t('marketName')}</Text>
        </View>

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
      </View>

      {/* Info Card */}
      <View style={s.infoCard}>
        <Text style={s.infoLabel}>{t('creditsSummaryTitle')}</Text>
        <View style={s.creditsRow}>
          <View style={s.creditStat}>
            <Text style={s.creditStatValue}>{credits.trialPoints}</Text>
            <Text style={s.creditStatLabel}>{t('creditsTrialLabel')}</Text>
          </View>
          <View style={s.creditStat}>
            <Text style={s.creditStatValue}>{credits.paidPoints}</Text>
            <Text style={s.creditStatLabel}>{t('creditsPaidLabel')}</Text>
          </View>
          <View style={s.creditStat}>
            <Text style={s.creditStatValue}>{getTotalCredits(credits)}</Text>
            <Text style={s.creditStatLabel}>{t('creditsTotalLabel')}</Text>
          </View>
        </View>
        <Text style={s.creditHint}>{t('creditsPublishCostHint')}</Text>
      </View>

      <View style={s.infoCard}>
        <View style={s.formField}>
          <Text style={s.infoLabel}>{t('phone')}</Text>
          <GccPhoneInput
            icon="📱"
            country={phoneCountry}
            onCountryChange={setPhoneCountry}
            nationalNumber={phoneNational}
            onNationalNumberChange={setPhoneNational}
            placeholder={t('enterPhonePlaceholder')}
            editable={!saving}
          />
        </View>
        <View style={s.infoDivider} />
        <View style={s.formField}>
          <Text style={s.infoLabel}>{t('whatsapp')}</Text>
          <GccPhoneInput
            icon="💬"
            country={whatsappCountry}
            onCountryChange={setWhatsappCountry}
            nationalNumber={whatsappNational}
            onNationalNumberChange={setWhatsappNational}
            placeholder={t('enterWhatsappPlaceholder')}
            editable={!saving}
          />
        </View>
        <TouchableOpacity
          style={[s.saveBtn, (!hasChanges || saving) && s.saveBtnDisabled]}
          activeOpacity={0.85}
          onPress={saveContactInfo}
          disabled={!hasChanges || saving}
        >
          <Text style={s.saveBtnText}>{saving ? t('savingShort') : t('saveContactInfo')}</Text>
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

      <TouchableOpacity style={s.adminWhatsappBtn} activeOpacity={0.88} onPress={contactAdmin}>
        <Text style={s.adminWhatsappText}>💬 {locale === 'ar' ? 'تواصل مع الإدارة واتساب' : 'Contact Admin on WhatsApp'}</Text>
      </TouchableOpacity>

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
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  founderRewardText: { marginTop: 8, color: colors.silver, fontWeight: '700', textAlign: 'center' },
  name: { color: colors.white, fontSize: 22, fontWeight: '900' },
  tierBadge: { backgroundColor: colors.primaryGlow, borderRadius: radius.full, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: 10, paddingVertical: 5 },
  tierBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  email: { color: colors.silver, fontSize: 13, marginTop: 4 },
  marketBadge: { backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.full, marginTop: 12 },
  marketText: { color: colors.primary, fontWeight: '800', fontSize: 12 },

  langRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
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

  // Info
  infoCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 16 },
  creditsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  creditStat: { flex: 1, backgroundColor: colors.metal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.metalBorder, paddingVertical: 12, alignItems: 'center' },
  creditStatValue: { color: colors.white, fontSize: 18, fontWeight: '900' },
  creditStatLabel: { color: colors.silver, fontSize: 10, marginTop: 4, fontWeight: '700' },
  creditHint: { color: colors.silverLight, fontSize: 11, marginTop: 10 },
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

  adminWhatsappBtn: {
    backgroundColor: colors.whatsapp,
    paddingVertical: 15,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: 12,
  },
  adminWhatsappText: { color: colors.white, fontWeight: '900', fontSize: 14 },

  // Logout
  logoutBtn: { backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, paddingVertical: 17, borderRadius: radius.xl, alignItems: 'center' },
  logoutText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
});
