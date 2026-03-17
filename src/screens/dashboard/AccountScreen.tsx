import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../lib/theme';
import { t } from '../../i18n';

export default function AccountScreen({ navigation }: any) {
  const { user, isAdmin, logout } = useAuth();

  if (!user) return null;

  const menuItems = [
    { icon: '🏎️', label: t('cars'), screen: 'MyCars' },
    { icon: '⚙️', label: t('parts'), screen: 'MyParts' },
    { icon: '📋', label: t('requests'), screen: 'MyRequests' },
  ];

  return (
    <View style={s.container}>
      {/* Profile */}
      <View style={s.profile}>
        <View style={s.avatar}><Text style={s.avatarText}>{user.name?.[0] || '?'}</Text></View>
        <Text style={s.name}>{user.name}</Text>
        <Text style={s.email}>{user.email}</Text>
        {isAdmin && (
          <View style={s.adminBadge}><Text style={s.adminText}>ADMIN</Text></View>
        )}
      </View>

      {/* Info */}
      <View style={s.infoCard}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>📱 {t('phone')}</Text>
          <Text style={s.infoValue}>{user.phone}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>💬 {t('whatsapp')}</Text>
          <Text style={s.infoValue}>{user.whatsapp}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={s.menu}>
        {menuItems.map(item => (
          <TouchableOpacity key={item.screen} style={s.menuItem} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={s.menuIcon}>{item.icon}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={s.menuArrow}>←</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark, padding: 20 },
  profile: { alignItems: 'center', paddingTop: 20, marginBottom: 24 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: colors.white, fontSize: 28, fontWeight: '900' },
  name: { color: colors.white, fontSize: 20, fontWeight: '800' },
  email: { color: colors.silver, fontSize: 13, opacity: 0.6, marginTop: 2 },
  adminBadge: { backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '40', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  adminText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  infoCard: { backgroundColor: colors.darkCard, borderRadius: 16, borderWidth: 1, borderColor: colors.metal, padding: 16, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { color: colors.silver, fontSize: 13 },
  infoValue: { color: colors.white, fontWeight: '600', fontSize: 13 },
  menu: { marginBottom: 20 },
  menuItem: { backgroundColor: colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: colors.metal, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  menuIcon: { fontSize: 20, marginLeft: 12 },
  menuLabel: { flex: 1, color: colors.white, fontWeight: '600', fontSize: 15, marginLeft: 12 },
  menuArrow: { color: colors.silver, fontSize: 16 },
  logoutBtn: { backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  logoutText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
