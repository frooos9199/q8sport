import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Linking, Animated, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { db } from '../../lib/firebase';
import { orderByChild, query, ref as dbRef } from '@react-native-firebase/database';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { sortListingsByFreshnessAndStatus } from '../../lib/listingSort';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { BannerAd, Part } from '../../types';
import { fetchActiveBanners } from '../../lib/bannerAds';
import SponsoredBannerCard from '../../components/SponsoredBannerCard';
import { formatListingPublishedAt } from '../../lib/listingDate';

type PartsFeedItem =
  | { kind: 'row'; id: string; parts: Part[]; startIndex: number }
  | { kind: 'banner'; id: string; banner: BannerAd };

export default function PartsScreen({ navigation }: any) {
  const [parts, setParts] = useState<Part[]>([]);
  const [banners, setBanners] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [smartFilterOpen, setSmartFilterOpen] = useState(false);
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [withImagesOnly, setWithImagesOnly] = useState(false);

  const fetchParts = async () => {
    try {
      const partsQuery = query(dbRef(db, 'parts'), orderByChild('createdAt'));
      const [snap, activeBanners] = await Promise.all([
        getDbSnapshot(partsQuery, 'parts'),
        fetchActiveBanners('parts'),
      ]);
      const data: Part[] = [];
      snap.forEach((child: any) => { data.push({ id: child.key, ...child.val() }); return undefined; });
      setParts(sortListingsByFreshnessAndStatus(data));
      setBanners(activeBanners);
    } catch (e) {
      console.log('Error:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchParts(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetchParts(); setRefreshing(false); };

  const searchQuery = search.trim().toLowerCase();
  const matchesSearch = (value?: string) => (value || '').toLowerCase().includes(searchQuery);

  const searchFiltered = parts.filter(p => {
    if (!searchQuery) return true;
    return (p.title?.ar || '').includes(search.trim()) || matchesSearch(p.title?.en);
  });

  const filtered = searchFiltered.filter(p => {
    if (conditionFilter !== 'all' && p.condition !== conditionFilter) return false;
    if (withImagesOnly && !(p.images && p.images.length)) return false;
    return true;
  });

  const clearSmartFilters = () => {
    setConditionFilter('all');
    setWithImagesOnly(false);
  };

  const rows: Part[][] = [];
  for (let index = 0; index < filtered.length; index += 2) {
    rows.push(filtered.slice(index, index + 2));
  }

  const feedItems: PartsFeedItem[] = [];
  rows.forEach((rowParts, rowIndex) => {
    feedItems.push({ kind: 'row', id: `row-${rowIndex}`, parts: rowParts, startIndex: rowIndex * 2 });

    if ((rowIndex + 1) % 2 === 0 && banners.length > 0) {
      const bannerIndex = Math.floor(rowIndex / 2) % banners.length;
      const banner = banners[bannerIndex];
      feedItems.push({ kind: 'banner', id: `banner-${banner.id}-${rowIndex}`, banner });
    }
  });

  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput style={s.search} placeholder={t('search')} placeholderTextColor={colors.silver + '50'} value={search} onChangeText={setSearch} />

        <TouchableOpacity
          onPress={() => setSmartFilterOpen(v => !v)}
          activeOpacity={0.85}
          style={s.filterBtn}
          accessibilityRole="button"
          accessibilityLabel="Smart filter"
        >
          <Text style={s.filterBtnIcon}>🎛️</Text>
        </TouchableOpacity>

        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}><Text style={s.clearText}>✕</Text></TouchableOpacity>
        )}
      </View>

      {smartFilterOpen && !loading && (
        <View style={s.smartFilterCard}>
          <View style={s.smartFilterHeader}>
            <Text style={s.smartFilterTitle}>فلتر ذكي</Text>
            <View style={s.smartFilterHeaderActions}>
              <TouchableOpacity onPress={clearSmartFilters} activeOpacity={0.85} style={s.smartFilterActionBtn}>
                <Text style={s.smartFilterActionText}>مسح</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSmartFilterOpen(false)} activeOpacity={0.85} style={s.smartFilterCloseBtn}>
                <Text style={s.smartFilterCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={s.smartFilterLabel}>الحالة</Text>
          <View style={s.chipsRow}>
            <Chip label="الكل" active={conditionFilter === 'all'} onPress={() => setConditionFilter('all')} />
            <Chip label={t('new')} active={conditionFilter === 'new'} onPress={() => setConditionFilter('new')} />
            <Chip label={t('used')} active={conditionFilter === 'used'} onPress={() => setConditionFilter('used')} />
          </View>

          <Text style={s.smartFilterLabel}>صور</Text>
          <View style={s.chipsRow}>
            <Chip
              label={withImagesOnly ? 'مع صور ✓' : 'مع صور'}
              active={withImagesOnly}
              onPress={() => setWithImagesOnly(v => !v)}
            />
          </View>
        </View>
      )}

      {!loading && <Text style={s.count}>{filtered.length} {t('parts')}</Text>}

      <FlatList
        data={feedItems}
        renderItem={({ item }) => {
          if (item.kind === 'banner') {
            return (
              <View style={s.bannerWrap}>
                <SponsoredBannerCard banner={item.banner} />
              </View>
            );
          }

          const left = item.parts[0];
          const right = item.parts[1];

          return (
            <View style={s.row}>
              <View style={s.rowItem}>
                <AnimatedPartCard item={left} index={item.startIndex} navigation={navigation} />
              </View>
              <View style={s.rowItem}>
                {right ? <AnimatedPartCard item={right} index={item.startIndex + 1} navigation={navigation} /> : <View style={s.rowSpacer} />}
              </View>
            </View>
          );
        }}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        ListEmptyComponent={
          loading ? null : (
            <View style={s.emptyWrap}><Text style={s.emptyIcon}>⚙️</Text><Text style={s.emptyText}>{t('noResults')}</Text></View>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[s.chip, active ? s.chipActive : s.chipIdle]}
    >
      <Text style={[s.chipText, active ? s.chipTextActive : s.chipTextIdle]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function AnimatedPartCard({ item, index, navigation }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[s.cardWrap, { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PartDetails', { id: item.id })}
      >
        <View style={s.imgWrap}>
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={s.img} />
          ) : (
            <View style={[s.img, s.placeholder]}><Text style={{ fontSize: 30 }}>⚙️</Text></View>
          )}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={s.imgGradient} />
          <View style={[s.condBadge, { backgroundColor: item.condition === 'new' ? colors.green : colors.yellow }]}>
            <Text style={s.condText}>{item.condition === 'new' ? t('new') : t('used')}</Text>
          </View>
        </View>
        <View style={s.info}>
          <Text style={s.title} numberOfLines={2}>{item.title?.ar}</Text>
          <Text style={s.price}>{item.price?.toLocaleString()} {t('kwd')}</Text>
          {formatListingPublishedAt(item.createdAt) ? (
            <Text style={s.publishedAtText}>📅 {formatListingPublishedAt(item.createdAt)}</Text>
          ) : null}
          <TouchableOpacity
            style={s.waBtn}
            onPress={() => Linking.openURL(`https://wa.me/${item.userWhatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحبا، أبي أستفسر عن: ${item.title?.ar}`)}`)}
          >
            <View style={s.waIconWrap}>
              <Text style={s.waBtnIcon}>💬</Text>
            </View>
            <Text style={s.waBtnText}>تواصل</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.darkCard, margin: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.metalBorder, paddingHorizontal: spacing.lg },
  searchIcon: { fontSize: 16, marginRight: 8 },
  search: { flex: 1, paddingVertical: 14, color: colors.white, fontSize: 15 },
  filterBtn: { paddingVertical: 10, paddingLeft: 10, paddingRight: 6 },
  filterBtnIcon: { fontSize: 18 },
  clearText: { color: colors.silver, fontSize: 16, padding: 6 },
  count: { color: colors.silver, fontSize: 12, paddingHorizontal: spacing.xl, marginBottom: 4 },

  smartFilterCard: {
    marginHorizontal: spacing.lg,
    marginTop: -6,
    marginBottom: 8,
    backgroundColor: colors.darkCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    padding: spacing.lg,
    ...shadows.card,
  },
  smartFilterHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  smartFilterTitle: { color: colors.white, fontWeight: '900', fontSize: 14 },
  smartFilterHeaderActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  smartFilterActionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md, backgroundColor: colors.metal },
  smartFilterActionText: { color: colors.white, fontWeight: '800', fontSize: 12 },
  smartFilterCloseBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: radius.md, backgroundColor: colors.metal },
  smartFilterCloseText: { color: colors.silver, fontSize: 14, fontWeight: '900' },
  smartFilterLabel: { color: colors.silver, fontSize: 12, marginTop: 10, marginBottom: 8, textAlign: 'right' },

  chipsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, maxWidth: '100%' },
  chipIdle: { backgroundColor: 'transparent', borderColor: colors.metalBorder },
  chipActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '800' },
  chipTextIdle: { color: colors.silver },
  chipTextActive: { color: colors.primary },

  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  rowSpacer: {
    flex: 1,
  },
  bannerWrap: {
    marginBottom: 12,
  },

  cardWrap: { flex: 1 },
  card: { backgroundColor: colors.darkCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.metalBorder, overflow: 'hidden', marginBottom: 12, ...shadows.card },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 130 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  imgGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 },
  condBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  condText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  info: { padding: 12 },
  title: { color: colors.white, fontWeight: '700', fontSize: 13, marginBottom: 6, lineHeight: 18 },
  price: { color: colors.primary, fontWeight: '900', fontSize: 16, marginBottom: 10 },
  publishedAtText: { color: colors.silver, fontSize: 11, marginBottom: 10, textAlign: 'right' },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
  },
  waIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 211, 102, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waBtnIcon: { fontSize: 15 },
  waBtnText: { color: colors.white, fontWeight: '800', fontSize: 12 },

  emptyWrap: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: colors.silver, fontSize: 15 },
});
