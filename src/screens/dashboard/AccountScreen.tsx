import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';

export default function AccountScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navigateToTab = (tabName: string, params?: object) => {
    const parent = navigation?.getParent?.();
    if (parent?.navigate) parent.navigate(tabName, params);
    else navigation.navigate(tabName, params);
  };

  const menuItems = [
    {
      key: 'cars',
      icon: '🏎️',
      label: t('cars'),
      desc: 'استكشف السيارات السبورت المعروضة الآن',
      onPress: () => navigateToTab('CarsTab'),
    },
    {
      key: 'parts',
      icon: '⚙️',
      label: t('parts'),
      desc: 'ابحث عن القطع الجاهزة والنادرة',
      onPress: () => navigateToTab('PartsTab'),
    },
    {
      key: 'requests',
      icon: '📋',
      label: t('requests'),
      desc: 'طلبات السوق المفتوحة والمطلوبات',
      onPress: () => navigateToTab('RequestsTab'),
    },
    {
      key: 'wanted',
      icon: '🔥',
      label: 'انشر مطلوب',
      desc: 'خل السوق كله يشوف اللي تحتاجه',
      onPress: () => navigateToTab('RequestsTab', { screen: 'CreateRequest' }),
    },
    {
      key: 'publish',
      icon: '➕',
      label: 'أضف إعلان',
      desc: 'نشر سيارة أو قطعة مباشرة بدون موافقات',
      onPress: () => navigateToTab('AccountTab', { screen: 'CreateListingHub' }),
    },
    {
      key: 'myListings',
      icon: '🗂️',
      label: 'إعلاناتي',
      desc: 'إدارة كل سياراتك وقطعك ومطلوباتك',
      onPress: () => navigation.navigate('MyListings'),
    },
  ];

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <View style={s.profileCard}>
        <LinearGradient colors={['rgba(227,30,36,0.1)', 'transparent']} style={s.profileGlow} />
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <LinearGradient colors={colors.gradient.primary as string[]} style={s.avatarFill} />
            <Text style={s.avatarText}>{user.name?.[0] || '?'}</Text>
          </View>
        </View>
        <Text style={s.name}>{user.name}</Text>
        <Text style={s.email}>{user.email}</Text>
        <View style={s.marketBadge}>
          <Text style={s.marketText}>KUWAIT SPORT MARKET</Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={s.infoCard}>
        <View style={s.infoRow}>
          <View style={s.infoIconWrap}><Text style={s.infoIcon}>📱</Text></View>
          <View style={s.infoContent}>
            <Text style={s.infoLabel}>{t('phone')}</Text>
            <Text style={s.infoValue}>{user.phone}</Text>
          </View>
        </View>
        <View style={s.infoDivider} />
        <View style={s.infoRow}>
          <View style={s.infoIconWrap}><Text style={s.infoIcon}>💬</Text></View>
          <View style={s.infoContent}>
            <Text style={s.infoLabel}>{t('whatsapp')}</Text>
            <Text style={s.infoValue}>{user.whatsapp}</Text>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={s.menuSection}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={item.key ?? i} style={s.menuItem} activeOpacity={0.85} onPress={item.onPress}>
            <View style={s.menuIconWrap}><Text style={s.menuIcon}>{item.icon}</Text></View>
            <View style={s.menuContent}>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={s.menuArrow}>←</Text>
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
  container: { flex: 1, backgroundColor: colors.dark, padding: spacing.xl },

  // Profile
  profileCard: { alignItems: 'center', backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 28, marginBottom: 16, overflow: 'hidden', ...shadows.card },
  profileGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatarFill: { ...StyleSheet.absoluteFillObject },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '900' },
  name: { color: colors.white, fontSize: 22, fontWeight: '900' },
  email: { color: colors.silver, fontSize: 13, marginTop: 4 },
  marketBadge: { backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.full, marginTop: 12 },
  marketText: { color: colors.primary, fontWeight: '800', fontSize: 12 },

  // Info
  infoCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  infoIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoIcon: { fontSize: 16 },
  infoContent: { flex: 1 },
  infoLabel: { color: colors.silver, fontSize: 11 },
  infoValue: { color: colors.white, fontWeight: '700', fontSize: 15, marginTop: 2 },
  infoDivider: { height: 1, backgroundColor: colors.metalBorder, marginVertical: 12 },

  // Menu
  menuSection: { marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 16, marginBottom: 10 },
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
