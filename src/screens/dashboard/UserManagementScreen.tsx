import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ref as dbRef, update } from '@react-native-firebase/database';

import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { deleteUserAccountFromMarketplace } from '../../lib/adminUserManagement';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { User } from '../../types';

function toMillis(value: any): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) return numericValue;
    const parsedValue = Date.parse(value);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }
  if (value && typeof value === 'object') {
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value.seconds === 'number') return value.seconds * 1000;
    if (typeof value._seconds === 'number') return value._seconds * 1000;
  }
  return 0;
}

export default function UserManagementScreen({ navigation }: any) {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const snap = await getDbSnapshot(dbRef(db, 'users'), 'users');
    const nextUsers: User[] = [];

    snap.forEach((child: any) => {
      nextUsers.push({ uid: child.key, ...child.val() });
      return undefined;
    });

    nextUsers.sort((left, right) => {
      if (Boolean(left.deletedAt) !== Boolean(right.deletedAt)) {
        return left.deletedAt ? 1 : -1;
      }

      if (Boolean(left.disabled) !== Boolean(right.disabled)) {
        return left.disabled ? 1 : -1;
      }

      if (Boolean(left.isAdmin) !== Boolean(right.isAdmin)) {
        return left.isAdmin ? -1 : 1;
      }

      const leftTime = toMillis((left as any).updatedAt ?? left.createdAt);
      const rightTime = toMillis((right as any).updatedAt ?? right.createdAt);
      return rightTime - leftTime;
    });

    setUsers(nextUsers);
  }, []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await loadUsers();
      } catch (error: any) {
        if (mounted) {
          Alert.alert('خطأ', error?.message || 'تعذر جلب المستخدمين');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [loadUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUsers();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter(item =>
      [item.name, item.email, item.phone, item.whatsapp]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query)),
    );
  }, [search, users]);

  const adminCount = users.filter(item => item.isAdmin).length;

  const toggleAdmin = async (item: User) => {
    if (item.uid === user?.uid) {
      Alert.alert('تنبيه', 'ما تقدر تسحب صلاحية الإدارة من حسابك من هذه الشاشة');
      return;
    }

    const nextIsAdmin = !item.isAdmin;
    setPendingUid(item.uid);
    try {
      await update(dbRef(db, `users/${item.uid}`), {
        isAdmin: nextIsAdmin,
        updatedAt: Date.now(),
      });

      setUsers(prev => prev.map(entry => (entry.uid === item.uid ? { ...entry, isAdmin: nextIsAdmin } : entry)));
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر تحديث صلاحية المستخدم');
    } finally {
      setPendingUid(null);
      await loadUsers();
    }
  };

  const toggleDisabled = async (item: User) => {
    if (item.deletedAt) {
      Alert.alert('تنبيه', 'هذا الحساب محذوف بالفعل');
      return;
    }

    if (item.uid === user?.uid) {
      Alert.alert('تنبيه', 'ما تقدر تعطل حسابك من شاشة الإدارة');
      return;
    }

    const nextDisabled = !item.disabled;
    setPendingUid(item.uid);
    try {
      await update(dbRef(db, `users/${item.uid}`), {
        disabled: nextDisabled,
        updatedAt: Date.now(),
      });

      setUsers(prev => prev.map(entry => (entry.uid === item.uid ? { ...entry, disabled: nextDisabled } : entry)));
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر تحديث حالة الحساب');
    } finally {
      setPendingUid(null);
      await loadUsers();
    }
  };

  const deleteAccount = (item: User) => {
    if (item.uid === user?.uid) {
      Alert.alert('تنبيه', 'ما تقدر حذف حسابك من شاشة الإدارة');
      return;
    }

    if (item.deletedAt) {
      Alert.alert('تنبيه', 'هذا الحساب محذوف بالفعل');
      return;
    }

    Alert.alert(
      'حذف الحساب',
      `سيتم حذف حساب ${item.name || item.email || 'هذا المستخدم'} من السوق مع كل السيارات والقطع والطلبات التابعة له. هذا الإجراء نهائي.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف الحساب',
          style: 'destructive',
          onPress: async () => {
            setPendingUid(item.uid);
            try {
              await deleteUserAccountFromMarketplace({ uid: item.uid, email: item.email });
              await loadUsers();
            } catch (error: any) {
              Alert.alert('خطأ', error?.message || 'تعذر حذف الحساب');
            } finally {
              setPendingUid(null);
            }
          },
        },
      ],
    );
  };

  if (!user?.isAdmin) {
    return (
      <View style={s.centerState}>
        <Text style={s.centerTitle}>هذه الصفحة للمشرف فقط</Text>
        <Text style={s.centerSub}>صلاحيات إدارة المستخدمين متاحة فقط لحسابات الإدارة.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.heroCard}>
        <Text style={s.heroTitle}>إدارة المستخدمين</Text>
        <Text style={s.heroSub}>راقب الحسابات، وابحث بسرعة، وامنح أو اسحب صلاحية الإدارة من مكان واحد.</Text>
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{users.length}</Text>
            <Text style={s.statLabel}>إجمالي المستخدمين</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{adminCount}</Text>
            <Text style={s.statLabel}>المشرفون</Text>
          </View>
        </View>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث بالاسم أو الإيميل أو الرقم"
          placeholderTextColor={colors.silver + '70'}
          style={s.searchInput}
        />
      </View>

      {loading ? (
        <View style={s.centerState}>
          <ActivityIndicator color={colors.primary} />
          <Text style={s.centerSub}>جاري تحميل المستخدمين...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.uid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <View style={s.centerState}>
              <Text style={s.centerTitle}>لا يوجد مستخدمون</Text>
              <Text style={s.centerSub}>جرّب تعديل البحث أو اسحب للتحديث.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelf = item.uid === user.uid;
            const isPending = pendingUid === item.uid;

            return (
              <View style={s.userCard}>
                <View style={s.userHeader}>
                  <View style={s.avatar}><Text style={s.avatarText}>{item.name?.[0] || item.email?.[0] || '?'}</Text></View>
                  <View style={s.userMain}>
                    <View style={s.nameRow}>
                      <Text style={s.userName}>{item.name || 'بدون اسم'}</Text>
                      {item.isAdmin ? (
                        <View style={s.adminBadge}><Text style={s.adminBadgeText}>مشرف</Text></View>
                      ) : null}
                      {item.disabled ? (
                        <View style={s.disabledBadge}><Text style={s.disabledBadgeText}>معطل</Text></View>
                      ) : null}
                      {item.deletedAt ? (
                        <View style={s.deletedBadge}><Text style={s.deletedBadgeText}>محذوف</Text></View>
                      ) : null}
                      {isSelf ? (
                        <View style={s.selfBadge}><Text style={s.selfBadgeText}>أنت</Text></View>
                      ) : null}
                    </View>
                    <Text style={s.userMeta}>{item.email || 'بدون إيميل'}</Text>
                    <Text style={s.userMeta}>{item.whatsapp || item.phone || 'بدون رقم تواصل'}</Text>
                  </View>
                </View>

                <View style={s.actionsRow}>
                  <TouchableOpacity
                    style={[s.secondaryBtn, isPending && s.actionBtnDisabled]}
                    activeOpacity={0.85}
                    disabled={isPending}
                    onPress={() => navigation.navigate('SellerProfile', { sellerId: item.uid, sellerName: item.name || item.email || 'مستخدم', sellerWhatsapp: item.whatsapp || item.phone || '' })}
                  >
                    <Text style={s.secondaryBtnText}>عرض التفاصيل</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.deleteBtn, (isPending || isSelf || Boolean(item.deletedAt)) && s.actionBtnDisabled]}
                    activeOpacity={0.85}
                    disabled={isPending || isSelf || Boolean(item.deletedAt)}
                    onPress={() => deleteAccount(item)}
                  >
                    <Text style={s.deleteBtnText}>{isPending ? 'جاري...' : 'حذف الحساب'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.actionBtn, item.disabled ? s.actionBtnPrimary : s.actionBtnMuted, (isPending || isSelf) && s.actionBtnDisabled]}
                    activeOpacity={0.85}
                    disabled={isPending || isSelf || Boolean(item.deletedAt)}
                    onPress={() => toggleDisabled(item)}
                  >
                    <Text style={[s.actionBtnText, item.disabled ? s.actionBtnTextPrimary : s.actionBtnTextMuted]}>
                      {isPending ? 'جاري التحديث...' : item.disabled ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.actionBtn, item.isAdmin ? s.actionBtnMuted : s.actionBtnPrimary, (isPending || isSelf) && s.actionBtnDisabled]}
                    activeOpacity={0.85}
                    disabled={isPending || isSelf || Boolean(item.deletedAt)}
                    onPress={() => toggleAdmin(item)}
                  >
                    <Text style={[s.actionBtnText, item.isAdmin ? s.actionBtnTextMuted : s.actionBtnTextPrimary]}>
                      {isPending ? 'جاري التحديث...' : item.isAdmin ? 'سحب الإدارة' : 'منح الإدارة'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  heroCard: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: 20,
    margin: spacing.xl,
    marginBottom: 14,
    ...shadows.card,
  },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '900', marginBottom: 6 },
  heroSub: { color: colors.silverLight, fontSize: 13, lineHeight: 21 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: colors.metal, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.metalBorder },
  statValue: { color: colors.white, fontSize: 22, fontWeight: '900' },
  statLabel: { color: colors.silver, fontSize: 11, marginTop: 4 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkCard,
    marginHorizontal: spacing.xl,
    marginBottom: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    paddingHorizontal: spacing.lg,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: colors.white, fontSize: 15, paddingVertical: 14 },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  userCard: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    padding: 16,
    marginBottom: 12,
    ...shadows.card,
  },
  userHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  userMain: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  userName: { color: colors.white, fontSize: 16, fontWeight: '800' },
  userMeta: { color: colors.silver, fontSize: 12, marginTop: 2 },
  adminBadge: { backgroundColor: colors.primaryGlow, borderRadius: radius.full, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: 10, paddingVertical: 4 },
  adminBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  disabledBadge: { backgroundColor: 'rgba(245, 158, 11, 0.16)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  disabledBadgeText: { color: colors.yellow, fontSize: 11, fontWeight: '800' },
  deletedBadge: { backgroundColor: 'rgba(227, 30, 36, 0.16)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  deletedBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  selfBadge: { backgroundColor: colors.greenGlow, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  selfBadgeText: { color: colors.green, fontSize: 11, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: { flex: 1, borderRadius: radius.lg, paddingVertical: 13, alignItems: 'center', borderWidth: 1 },
  actionBtnPrimary: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
  actionBtnMuted: { backgroundColor: colors.metal, borderColor: colors.metalBorder },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontSize: 13, fontWeight: '900' },
  actionBtnTextPrimary: { color: colors.primary },
  actionBtnTextMuted: { color: colors.silverLight },
  secondaryBtn: { flex: 1, borderRadius: radius.lg, paddingVertical: 13, alignItems: 'center', borderWidth: 1, backgroundColor: colors.metal, borderColor: colors.metalBorder },
  secondaryBtnText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  deleteBtn: { flex: 1, borderRadius: radius.lg, paddingVertical: 13, alignItems: 'center', borderWidth: 1, backgroundColor: 'rgba(227, 30, 36, 0.12)', borderColor: colors.primaryBorder },
  deleteBtnText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 10 },
  centerTitle: { color: colors.white, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  centerSub: { color: colors.silver, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});