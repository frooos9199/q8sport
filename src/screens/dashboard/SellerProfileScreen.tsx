import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { get, ref as dbRef } from '@react-native-firebase/database';

import { db } from '../../lib/firebase';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { Car, Part, Request } from '../../types';

type SellerFeedItem =
  | { type: 'car'; item: Car }
  | { type: 'part'; item: Part }
  | { type: 'request'; item: Request };

export default function SellerProfileScreen({ route, navigation }: any) {
  const { sellerId, sellerName, sellerWhatsapp } = route.params;
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSellerData = async () => {
    const [carsSnap, partsSnap, requestsSnap] = await Promise.all([
      get(dbRef(db, 'cars')),
      get(dbRef(db, 'parts')),
      get(dbRef(db, 'requests')),
    ]);

    const nextCars: Car[] = [];
    const nextParts: Part[] = [];
    const nextRequests: Request[] = [];

    carsSnap.forEach((child: any) => {
      const value = child.val();
      if (value?.userId === sellerId) nextCars.unshift({ id: child.key, ...value });
      return undefined;
    });

    partsSnap.forEach((child: any) => {
      const value = child.val();
      if (value?.userId === sellerId) nextParts.unshift({ id: child.key, ...value });
      return undefined;
    });

    requestsSnap.forEach((child: any) => {
      const value = child.val();
      if (value?.userId === sellerId) nextRequests.unshift({ id: child.key, ...value });
      return undefined;
    });

    setCars(nextCars);
    setParts(nextParts);
    setRequests(nextRequests);
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await loadSellerData();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [sellerId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSellerData();
    } finally {
      setRefreshing(false);
    }
  };

  const feed = useMemo<SellerFeedItem[]>(() => {
    const carFeed = cars.map(item => ({ type: 'car' as const, item }));
    const partFeed = parts.map(item => ({ type: 'part' as const, item }));
    const requestFeed = requests.map(item => ({ type: 'request' as const, item }));
    return [...carFeed, ...partFeed, ...requestFeed];
  }, [cars, parts, requests]);

  const openWhatsApp = () => {
    const phone = String(sellerWhatsapp || '').replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(`مرحبا ${sellerName}، عندي اهتمام بمعروضاتك في Q8 Sport Market`)}`);
  };

  const goToListing = (entry: SellerFeedItem) => {
    if (entry.type === 'car') {
      navigation.navigate('CarDetails', { id: entry.item.id });
      return;
    }
    if (entry.type === 'part') {
      navigation.navigate('PartDetails', { id: entry.item.id });
      return;
    }
  };

  return (
    <FlatList
      style={s.container}
      data={feed}
      keyExtractor={entry => `${entry.type}-${entry.item.id}`}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40 }}
      ListHeaderComponent={
        <>
          <View style={s.profileCard}>
            <View style={s.avatar}><Text style={s.avatarText}>{sellerName?.[0] || '?'}</Text></View>
            <Text style={s.name}>{sellerName}</Text>
            <Text style={s.handle}>معلن مباشر في السوق</Text>

            <View style={s.statsRow}>
              <Stat label="سيارات" value={cars.length} />
              <Stat label="قطع" value={parts.length} />
              <Stat label="مطلوبات" value={requests.length} />
            </View>

            <View style={s.trustCard}>
              <Text style={s.trustTitle}>مؤشرات الثقة</Text>
              <Text style={s.trustLine}>عضو نشط مع {cars.length + parts.length + requests.length} إعلان ظاهر في السوق</Text>
              <Text style={s.trustLine}>تواصل مباشر على الواتساب بدون وسيط</Text>
            </View>

            <TouchableOpacity style={s.cta} activeOpacity={0.88} onPress={openWhatsApp}>
              <Text style={s.ctaText}>💬 تواصل مع المعلن</Text>
            </TouchableOpacity>
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>كل معروضاته</Text>
            <Text style={s.sectionSub}>{loading ? 'جاري التحميل...' : `${feed.length} عنصر`}</Text>
          </View>
        </>
      }
      ListEmptyComponent={
        !loading ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>لا توجد معروضات حالياً</Text>
            <Text style={s.emptySub}>يمكن التواصل مع المعلن مباشرة إذا كان عنده شيء متوفر قريبًا.</Text>
          </View>
        ) : null
      }
      renderItem={({ item: entry }) => (
        <TouchableOpacity
          activeOpacity={0.88}
          style={s.itemCard}
          onPress={() => entry.type !== 'request' && goToListing(entry)}
          disabled={entry.type === 'request'}
        >
          <View style={s.itemTopRow}>
            <View style={s.badge}><Text style={s.badgeText}>{entry.type === 'car' ? 'سيارة' : entry.type === 'part' ? 'قطعة' : 'مطلوب'}</Text></View>
            <Text style={s.itemStatus}>{entry.item.status}</Text>
          </View>
          <Text style={s.itemTitle}>{entry.item.title?.ar}</Text>
          <Text style={s.itemMeta}>
            {entry.type === 'car'
              ? `${entry.item.brand} • ${entry.item.model} • ${entry.item.year}`
              : entry.type === 'part'
                ? `${entry.item.category} • ${(entry.item.compatibleBrands || []).slice(0, 2).join(' • ') || 'توافق غير محدد'}`
                : entry.item.description?.ar}
          </Text>
          <Text style={s.itemPrice}>
            {entry.type === 'request'
              ? entry.item.budget ? `${entry.item.budget.toLocaleString()} د.ك` : 'بدون ميزانية محددة'
              : `${entry.item.price?.toLocaleString()} د.ك`}
          </Text>
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  profileCard: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.primaryBorder, padding: 22, marginBottom: 18, ...shadows.card },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginBottom: 14, alignSelf: 'center' },
  avatarText: { color: colors.primary, fontSize: 28, fontWeight: '900' },
  name: { color: colors.white, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  handle: { color: colors.silver, fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
  statItem: { flex: 1, backgroundColor: colors.metal, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center' },
  statValue: { color: colors.white, fontSize: 20, fontWeight: '900' },
  statLabel: { color: colors.silver, fontSize: 11, marginTop: 4 },
  trustCard: { backgroundColor: colors.metal, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 16, marginBottom: 16 },
  trustTitle: { color: colors.white, fontSize: 15, fontWeight: '900', marginBottom: 10 },
  trustLine: { color: colors.silverLight, fontSize: 13, lineHeight: 20, marginBottom: 4 },
  cta: { backgroundColor: colors.whatsapp, borderRadius: radius.xl, paddingVertical: 15, alignItems: 'center' },
  ctaText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '900' },
  sectionSub: { color: colors.silver, fontSize: 12 },
  emptyCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 20, alignItems: 'center' },
  emptyTitle: { color: colors.white, fontSize: 17, fontWeight: '900', marginBottom: 8 },
  emptySub: { color: colors.silver, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  itemCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 12, ...shadows.card },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { backgroundColor: colors.primaryGlow, borderRadius: radius.full, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  itemStatus: { color: colors.silver, fontSize: 11, fontWeight: '700' },
  itemTitle: { color: colors.white, fontSize: 17, fontWeight: '900', marginBottom: 6 },
  itemMeta: { color: colors.silverLight, fontSize: 13, lineHeight: 20, marginBottom: 8 },
  itemPrice: { color: colors.primary, fontWeight: '900', fontSize: 14 },
});