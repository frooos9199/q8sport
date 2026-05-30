import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Linking, Animated, RefreshControl, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { db } from '../../lib/firebase';
import { orderByChild, query, ref as dbRef } from '@react-native-firebase/database';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { sortListingsByFreshnessAndStatus } from '../../lib/listingSort';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { BannerAd, Car } from '../../types';
import { ListCardSkeleton } from '../../components/Shimmer';
import { fetchActiveBanners } from '../../lib/bannerAds';
import SponsoredBannerCard from '../../components/SponsoredBannerCard';
import { formatListingPublishedAt } from '../../lib/listingDate';
import FastAdImage from '../../components/FastAdImage';
import { getListingThumbnailUrl } from '../../lib/listingImages';
import { prefetchAdImages } from '../../lib/prefetchAdImages';
import { toWaMeDigits } from '../../lib/gccPhone';

type CarsFeedItem =
  | { kind: 'car'; id: string; car: Car; carIndex: number }
  | { kind: 'banner'; id: string; bannerSlot: number };

function AutoRotatingBanner({ banner }: { banner: BannerAd }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [banner.id, opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <SponsoredBannerCard banner={banner} />
    </Animated.View>
  );
}

export default function CarsScreen({ navigation }: any) {
  const [cars, setCars] = useState<Car[]>([]);
  const [banners, setBanners] = useState<BannerAd[]>([]);
  const [bannerRotationIndex, setBannerRotationIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [smartFilterOpen, setSmartFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const fetchCars = async () => {
    try {
      const carsQuery = query(dbRef(db, 'cars'), orderByChild('createdAt'));
      const [snap, activeBanners] = await Promise.all([
        getDbSnapshot(carsQuery, 'cars'),
        fetchActiveBanners('cars'),
      ]);
      const data: Car[] = [];
      snap.forEach((child: any) => { data.push({ id: child.key, ...child.val() }); return undefined; });
      const sortedCars = sortListingsByFreshnessAndStatus(data);
      setCars(sortedCars);
      setBanners(activeBanners);

      prefetchAdImages([
        ...activeBanners.map(b => b.thumbnailUrl || b.imageUrl),
        ...sortedCars.map(getListingThumbnailUrl),
      ], 10);
    } catch (e) {
      console.log('Error:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCars(); }, []);

  useEffect(() => {
    setBannerRotationIndex(0);

    if (banners.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setBannerRotationIndex(current => (current + 1) % banners.length);
    }, 4200);

    return () => clearInterval(intervalId);
  }, [banners.length]);

  const onRefresh = async () => { setRefreshing(true); await fetchCars(); setRefreshing(false); };

  const searchQuery = search.trim().toLowerCase();
  const matchesSearch = (value?: string) => (value || '').toLowerCase().includes(searchQuery);
  const searchFiltered = cars.filter(c => {
    if (!searchQuery) return true;
    return (
      (c.title?.ar || '').includes(search.trim()) ||
      matchesSearch(c.title?.en) ||
      matchesSearch(c.brand) ||
      matchesSearch(c.model)
    );
  });

  const filtered = searchFiltered.filter(c => {
    if (statusFilter === 'available' && c.status === 'sold') return false;
    if (statusFilter === 'sold' && c.status !== 'sold') return false;
    if (selectedBrand && c.brand !== selectedBrand) return false;
    if (selectedModel && c.model !== selectedModel) return false;
    if (selectedYear && c.year !== selectedYear) return false;
    return true;
  });

  const brandOptions = Array.from(new Set(searchFiltered.map(c => c.brand).filter(Boolean))).slice(0, 10) as string[];
  const modelOptions = Array.from(
    new Set(
      searchFiltered
        .filter(c => (selectedBrand ? c.brand === selectedBrand : true))
        .map(c => c.model)
        .filter(Boolean)
    )
  ).slice(0, 10) as string[];
  const yearOptions = Array.from(new Set(searchFiltered.map(c => c.year).filter(Boolean)))
    .sort((a, b) => b - a)
    .slice(0, 10) as number[];

  const clearSmartFilters = () => {
    setStatusFilter('all');
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedYear(null);
  };

  const openWhatsApp = (phone: string, msg: string) => {
    Linking.openURL(`https://wa.me/${toWaMeDigits(phone)}?text=${encodeURIComponent(msg)}`);
  };

  const feedItems: CarsFeedItem[] = [];
  let bannerSlot = 0;
  filtered.forEach((car, carIndex) => {
    feedItems.push({ kind: 'car', id: car.id, car, carIndex });

    if ((carIndex + 1) % 4 === 0 && banners.length > 0) {
      feedItems.push({ kind: 'banner', id: `banner-slot-${bannerSlot}-${carIndex}`, bannerSlot });
      bannerSlot += 1;
    }
  });

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.search}
          placeholder={t('search')}
          placeholderTextColor={colors.silver + '50'}
          value={search}
          onChangeText={setSearch}
        />

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
          <TouchableOpacity onPress={() => setSearch('')} style={s.clearBtn}>
            <Text style={s.clearText}>✕</Text>
          </TouchableOpacity>
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
            <Chip label="الكل" active={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
            <Chip label="المتوفر" active={statusFilter === 'available'} onPress={() => setStatusFilter('available')} />
            <Chip label="المباع" active={statusFilter === 'sold'} onPress={() => setStatusFilter('sold')} />
          </View>

          {brandOptions.length > 0 && (
            <>
              <Text style={s.smartFilterLabel}>الماركة</Text>
              <View style={s.chipsRow}>
                {brandOptions.map(brand => (
                  <Chip
                    key={brand}
                    label={brand}
                    active={selectedBrand === brand}
                    onPress={() => {
                      setSelectedBrand(current => (current === brand ? null : brand));
                      setSelectedModel(null);
                    }}
                  />
                ))}
              </View>
            </>
          )}

          {modelOptions.length > 0 && (
            <>
              <Text style={s.smartFilterLabel}>الموديل</Text>
              <View style={s.chipsRow}>
                {modelOptions.map(model => (
                  <Chip
                    key={model}
                    label={model}
                    active={selectedModel === model}
                    onPress={() => setSelectedModel(current => (current === model ? null : model))}
                  />
                ))}
              </View>
            </>
          )}

          {yearOptions.length > 0 && (
            <>
              <Text style={s.smartFilterLabel}>السنة</Text>
              <View style={s.chipsRow}>
                {yearOptions.map(year => (
                  <Chip
                    key={String(year)}
                    label={String(year)}
                    active={selectedYear === year}
                    onPress={() => setSelectedYear(current => (current === year ? null : year))}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* Results count */}
      {!loading && (
        <View style={s.countRow}>
          <Text style={s.countText}>{filtered.length} {t('cars')}</Text>
        </View>
      )}

      {loading ? (
        <View style={{ padding: spacing.lg }}>
          {[1, 2, 3, 4].map(i => <ListCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={feedItems}
          renderItem={({ item, index }) => {
            if (item.kind === 'banner') {
              const bannerIndex = banners.length
                ? (item.bannerSlot + bannerRotationIndex) % banners.length
                : 0;
              const banner = banners[bannerIndex];

              return (
                <View style={s.bannerWrap}>
                  {banner ? <AutoRotatingBanner banner={banner} /> : null}
                </View>
              );
            }

            return (
              <AnimatedCard
                item={item.car}
                index={item.carIndex}
                navigation={navigation}
                openWhatsApp={openWhatsApp}
              />
            );
          }}
          keyExtractor={i => i.id}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>🏎️</Text>
              <Text style={s.emptyText}>{t('noResults')}</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
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

function AnimatedCard({ item, index, navigation, openWhatsApp }: any) {
    const thumbnailUrl = getListingThumbnailUrl(item);
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }).start();
  }, []);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }, { scale }] }}>
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CarDetails', { id: item.id })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={s.cardInfo}>
          <View style={s.cardTextBlock}>
            <Text style={s.cardTitle} numberOfLines={1}>{item.title?.ar}</Text>
            <Text style={s.cardSub} numberOfLines={1}>{item.brand} • {item.model}</Text>
            {item.mileage ? <Text style={s.mileageText}>{item.mileage?.toLocaleString()} {t('km')}</Text> : null}
            {formatListingPublishedAt(item.createdAt) ? (
              <Text style={s.publishedAtText}>📅 {formatListingPublishedAt(item.createdAt)}</Text>
            ) : null}
          </View>
          <View style={s.cardBottom}>
            <View>
              <Text style={s.cardPrice}>{item.price?.toLocaleString()}</Text>
              <Text style={s.cardKwd}>{t('kwd')}</Text>
            </View>
            <TouchableOpacity style={s.waActionBtn} activeOpacity={0.88} onPress={() => openWhatsApp(item.userWhatsapp, `مرحبا، أبي أستفسر عن: ${item.title?.ar}`)}>
              <View style={s.waIconWrap}>
                <Text style={s.waOverlayIcon}>💬</Text>
              </View>
              <Text style={s.waOverlayText}>واتساب</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.cardImgWrap}>
          {thumbnailUrl ? (
            <FastAdImage uri={thumbnailUrl} style={s.cardImg} fallback={<Text style={{ fontSize: 32 }}>🏎️</Text>} />
          ) : (
            <View style={[s.cardImg, s.placeholder]}><Text style={{ fontSize: 32 }}>🏎️</Text></View>
          )}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={s.cardImgGradient} />
          <View style={s.cardYearBadge}><Text style={s.cardYearText}>{item.year}</Text></View>
          {item.status === 'sold' && (
            <View style={s.soldBadge}><Text style={s.soldText}>{t('sold')}</Text></View>
          )}
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
  clearBtn: { padding: 6 },
  clearText: { color: colors.silver, fontSize: 16 },

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

  countRow: { paddingHorizontal: spacing.xl, marginBottom: 4 },
  countText: { color: colors.silver, fontSize: 12 },

  card: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row-reverse',
    minHeight: 124,
    ...shadows.card,
  },
  cardImgWrap: { position: 'relative', width: '39%', alignSelf: 'stretch' },
  cardImg: { width: '100%', flex: 1 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  cardImgGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  cardYearBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  cardYearText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  waActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
    transform: [{ translateY: Platform.OS === 'ios' ? -8 : -5 }],
  },
  waIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 211, 102, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waOverlayIcon: { fontSize: 15 },
  waOverlayText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  soldBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(227,30,36,0.9)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.sm },
  soldText: { color: colors.white, fontSize: 11, fontWeight: '800' },

  cardInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'space-between', alignItems: 'flex-end' },
  cardTextBlock: { gap: 6, alignItems: 'flex-end' },
  cardTitle: { color: colors.white, fontWeight: '800', fontSize: 15, textAlign: 'right' },
  cardSub: { color: colors.silver, fontSize: 12, textAlign: 'right' },
  cardBottom: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, alignSelf: 'stretch' },
  cardPrice: { color: colors.primary, fontWeight: '900', fontSize: 17 },
  cardKwd: { color: colors.silver, fontSize: 11, fontWeight: '700', marginTop: 2 },
  mileageText: { color: colors.silver, fontSize: 11, textAlign: 'right' },
  publishedAtText: { color: colors.silver, fontSize: 11, textAlign: 'right' },

  emptyWrap: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: colors.silver, fontSize: 15 },

  bannerWrap: {
    marginBottom: 14,
  },
});
