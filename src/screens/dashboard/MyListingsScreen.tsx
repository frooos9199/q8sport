import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ref as dbRef, remove, update } from '@react-native-firebase/database';

import { useAuth } from '../../hooks/useAuth';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { db } from '../../lib/firebase';
import { colors, radius, shadows, spacing } from '../../lib/theme';

type ListingType = 'car' | 'part' | 'request';
type FilterType = 'all' | ListingType;

type ListingRow = {
  id: string;
  type: ListingType;
  title: string;
  subtitle: string;
  priceLine: string;
  status: string;
  raw: any;
};

export default function MyListingsScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [items, setItems] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const compactScreen = width < 390;
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const canManageAllListings = Boolean(user?.isAdmin || user?.isSuperAdmin);

  const loadListings = useCallback(async () => {
    if (!user) return;

    const [carsSnap, partsSnap, requestsSnap] = await Promise.all([
      getDbSnapshot(dbRef(db, 'cars'), 'cars'),
      getDbSnapshot(dbRef(db, 'parts'), 'parts'),
      getDbSnapshot(dbRef(db, 'requests'), 'requests'),
    ]);

    const nextItems: ListingRow[] = [];

    const shouldIncludeListing = (ownerUserId?: string) => canManageAllListings || ownerUserId === user.uid;

    const sellerLine = (value: any) => {
      if (!canManageAllListings) {
        return null;
      }

      const sellerName = value?.userName?.trim() || 'معلن غير معروف';
      const sellerWhatsapp = value?.userWhatsapp?.trim();
      return sellerWhatsapp ? `${sellerName} • ${sellerWhatsapp}` : sellerName;
    };

    carsSnap.forEach((child: any) => {
      const value = child.val();
      if (shouldIncludeListing(value?.userId)) {
        const seller = sellerLine(value);
        nextItems.push({
          id: child.key,
          type: 'car',
          title: value?.title?.ar || 'سيارة',
          subtitle: [value?.brand, value?.model, value?.year, seller].filter(Boolean).join(' • '),
          priceLine: value?.price ? `${Number(value.price).toLocaleString()} د.ك` : 'بدون سعر',
          status: value?.status || 'active',
          raw: value,
        });
      }
      return undefined;
    });

    partsSnap.forEach((child: any) => {
      const value = child.val();
      if (shouldIncludeListing(value?.userId) && value?.category?.trim() !== 'عادم') {
        const seller = sellerLine(value);
        nextItems.push({
          id: child.key,
          type: 'part',
          title: value?.title?.ar || 'قطعة',
          subtitle: [value?.category, ...(value?.compatibleBrands || []).slice(0, 2), seller].filter(Boolean).join(' • '),
          priceLine: value?.price ? `${Number(value.price).toLocaleString()} د.ك` : 'بدون سعر',
          status: value?.status || 'active',
          raw: value,
        });
      }
      return undefined;
    });

    requestsSnap.forEach((child: any) => {
      const value = child.val();
      if (shouldIncludeListing(value?.userId)) {
        const seller = sellerLine(value);
        nextItems.push({
          id: child.key,
          type: 'request',
          title: value?.title?.ar || 'مطلوب',
          subtitle: [value?.category === 'car' ? 'طلب سيارة' : value?.category === 'part' ? 'طلب قطعة' : 'طلب خاص', seller]
            .filter(Boolean)
            .join(' • '),
          priceLine: value?.budget ? `${Number(value.budget).toLocaleString()} د.ك` : 'بدون ميزانية محددة',
          status: value?.status || 'open',
          raw: value,
        });
      }
      return undefined;
    });

    nextItems.sort((a, b) => {
      const aTime = a.raw?.updatedAt || a.raw?.createdAt || 0;
      const bTime = b.raw?.updatedAt || b.raw?.createdAt || 0;
      return String(bTime).localeCompare(String(aTime));
    });

    setItems(nextItems);
  }, [user, canManageAllListings]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await loadListings();
      } catch (e: any) {
        if (mounted) {
          Alert.alert('خطأ', e?.message || 'تعذر جلب إعلاناتك');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [loadListings]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadListings();
    } finally {
      setRefreshing(false);
    }
  };

  const editListing = (item: ListingRow) => {
    if (item.type === 'car') {
      navigation.navigate('CreateCar', { listing: { id: item.id, ...item.raw } });
      return;
    }
    if (item.type === 'part') {
      navigation.navigate('CreatePart', { listing: { id: item.id, ...item.raw } });
      return;
    }
    navigation.navigate('CreateRequest', { listing: { id: item.id, ...item.raw } });
  };

  const deleteListing = (item: ListingRow) => {
    const path = item.type === 'car' ? `cars/${item.id}` : item.type === 'part' ? `parts/${item.id}` : `requests/${item.id}`;
    Alert.alert('تأكيد', `حذف الإعلان: ${item.title}؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(dbRef(db, path));
            setItems(prev => prev.filter(entry => !(entry.type === item.type && entry.id === item.id)));
          } catch (e: any) {
            Alert.alert('خطأ', e?.message || 'تعذر حذف الإعلان');
          }
        },
      },
    ]);
  };

  const toggleListingStatus = async (item: ListingRow) => {
    const path = item.type === 'car' ? `cars/${item.id}` : item.type === 'part' ? `parts/${item.id}` : `requests/${item.id}`;
    const nextStatus = item.type === 'request'
      ? item.status === 'open' ? 'closed' : 'open'
      : item.status === 'sold' ? 'active' : 'sold';

    try {
      await update(dbRef(db, path), { status: nextStatus, updatedAt: Date.now() });
      setItems(prev => prev.map(entry => (
        entry.id === item.id && entry.type === item.type
          ? { ...entry, status: nextStatus, raw: { ...entry.raw, status: nextStatus, updatedAt: Date.now() } }
          : entry
      )));
    } catch (e: any) {
      Alert.alert('خطأ', e?.message || 'تعذر تحديث حالة الإعلان');
    }
  };

  const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

  const filterLabel = (value: FilterType) => {
    if (value === 'car') return 'سيارات';
    if (value === 'part') return 'قطع';
    if (value === 'request') return 'طلبات';
    return 'الكل';
  };

  const statusActionLabel = (item: ListingRow) => {
    if (item.type === 'request') {
      return item.status === 'open' ? 'إغلاق' : 'إعادة فتح';
    }

    return item.status === 'sold' ? 'تنشيط' : 'تعليم كمباع';
  };

  if (loading) {
    return (
      <View style={s.center}>
        <Text style={s.loading}>جاري تحميل إعلاناتك...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={s.container}
      data={filteredItems}
      keyExtractor={item => `${item.type}-${item.id}`}
      contentContainerStyle={{ padding: screenPadding, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={
        <>
          <View style={s.heroCard}>
            <Text style={s.heroTitle}>{canManageAllListings ? 'إدارة كل الإعلانات' : 'إعلاناتك في السوق'}</Text>
            <Text style={s.heroSub}>
              {canManageAllListings
                ? 'بصفتك أدمن، تراجع وتعدل وتحذف وتغيّر حالة أي سيارة أو قطعة أو مطلوب في السوق.'
                : 'من هنا تعدل أو تحذف أو تغيّر حالة أي سيارة أو قطعة أو مطلوب نزلته.'}
            </Text>
          </View>

          <View style={s.filtersRow}>
            {(['all', 'car', 'part', 'request'] as FilterType[]).map(value => (
              <TouchableOpacity
                key={value}
                activeOpacity={0.85}
                onPress={() => setFilter(value)}
                style={[s.filterChip, filter === value && s.filterChipActive]}
              >
                <Text style={[s.filterChipText, filter === value && s.filterChipTextActive]}>{filterLabel(value)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={s.centerCard}>
          <Text style={s.emptyTitle}>{canManageAllListings ? 'ما فيه عناصر على هذا الفلتر' : 'ما عندك عناصر على هذا الفلتر'}</Text>
          <Text style={s.emptySub}>
            {canManageAllListings
              ? 'جرّب تغيير الفلتر أو انتظر حتى يضاف إعلان جديد ليظهر هنا مباشرة.'
              : 'ابدأ بنشر أول سيارة أو قطعة أو مطلوب، وبعدها راح تظهر هنا كلها.'}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={[s.topRow, compactScreen && s.topRowCompact]}>
            <View style={s.typeBadge}><Text style={s.typeText}>{item.type === 'car' ? 'سيارة' : item.type === 'part' ? 'قطعة' : 'مطلوب'}</Text></View>
            <Text style={s.status}>{item.status}</Text>
          </View>
          <Text style={s.title}>{item.title}</Text>
          <Text style={s.subtitle}>{item.subtitle || 'بدون تفاصيل إضافية'}</Text>
          <Text style={s.price}>{item.priceLine}</Text>
          <View style={[s.actionsRow, compactScreen && s.actionsRowCompact]}>
            <TouchableOpacity style={[s.editBtn, compactScreen && s.actionBtnCompact]} activeOpacity={0.85} onPress={() => editListing(item)}>
              <Text style={s.editText}>تعديل</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.statusBtn, compactScreen && s.actionBtnCompact]} activeOpacity={0.85} onPress={() => toggleListingStatus(item)}>
              <Text style={s.statusBtnText}>{statusActionLabel(item)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.deleteBtn, compactScreen && s.actionBtnCompact]} activeOpacity={0.85} onPress={() => deleteListing(item)}>
              <Text style={s.deleteText}>حذف</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  loading: { color: colors.silver, fontSize: 15 },
  heroCard: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.primaryBorder, padding: 20, marginBottom: 16 },
  heroTitle: { color: colors.white, fontWeight: '900', fontSize: 22, marginBottom: 6 },
  heroSub: { color: colors.silverLight, fontSize: 13, lineHeight: 21 },
  filtersRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  filterChip: { backgroundColor: colors.darkCard, borderRadius: radius.full, borderWidth: 1, borderColor: colors.metalBorder, paddingHorizontal: 14, paddingVertical: 9 },
  filterChipActive: { borderColor: colors.primaryBorder, backgroundColor: colors.primaryGlow },
  filterChipText: { color: colors.silverLight, fontSize: 12, fontWeight: '800' },
  filterChipTextActive: { color: colors.primary },
  centerCard: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 22, alignItems: 'center' },
  emptyTitle: { color: colors.white, fontWeight: '900', fontSize: 18, marginBottom: 8 },
  emptySub: { color: colors.silver, fontSize: 13, textAlign: 'center', lineHeight: 21 },
  card: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 12, ...shadows.card },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  topRowCompact: { alignItems: 'flex-start', gap: 8 },
  typeBadge: { backgroundColor: colors.primaryGlow, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.primaryBorder },
  typeText: { color: colors.primary, fontWeight: '900', fontSize: 11 },
  status: { color: colors.silver, fontSize: 11, fontWeight: '700' },
  title: { color: colors.white, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: colors.silverLight, fontSize: 13, marginBottom: 8 },
  price: { color: colors.primary, fontSize: 14, fontWeight: '900', marginBottom: 14 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionsRowCompact: { flexWrap: 'wrap' },
  actionBtnCompact: { minWidth: '48%' },
  editBtn: { flex: 1, backgroundColor: colors.metal, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.metalBorder },
  editText: { color: colors.white, fontWeight: '800' },
  statusBtn: { flex: 1, backgroundColor: colors.dark, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.primaryBorder },
  statusBtnText: { color: colors.primary, fontWeight: '900', fontSize: 12 },
  deleteBtn: { flex: 1, backgroundColor: colors.primaryGlow, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.primaryBorder },
  deleteText: { color: colors.primary, fontWeight: '900' },
});