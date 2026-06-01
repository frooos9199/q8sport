import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList, Linking, Animated, RefreshControl } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { db } from '../lib/firebase';
import { orderByChild, query, ref as dbRef, remove } from '@react-native-firebase/database';
import { getDbSnapshot } from '../lib/firebaseDatabase';
import { sortListingsByFreshnessAndStatus } from '../lib/listingSort';
import { colors, radius, shadows, spacing } from '../lib/theme';
import { getLocale, t } from '../i18n';
import { BannerAd, Car, Part, Request } from '../types';
import CarCard from '../components/CarCard';
import { CarCardSkeleton } from '../components/Shimmer';
import LazyImage from '../components/LazyImage';
import { fetchActiveBanners } from '../lib/bannerAds';
import { formatListingPublishedAt } from '../lib/listingDate';
import FastAdImage from '../components/FastAdImage';
import { collectListingMediaUrls, deleteListingMediaByUrls, getListingThumbnailUrl } from '../lib/listingImages';
import { prefetchAdImages } from '../lib/prefetchAdImages';
import { toWaMeDigits } from '../lib/gccPhone';
import { useAuth } from '../hooks/useAuth';
import { getPublishedListingUrl } from '../lib/publishedSite';

const { width } = Dimensions.get('window');
const HOME_BANNER_CARD_SPACING = 14;
const HOME_BANNER_AUTO_SLIDE_MS = 4000;

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [banners, setBanners] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const heroAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const bannerListRef = useRef<FlatList<BannerAd> | null>(null);
  const bannerIndexRef = useRef(0);
  const bannerCardWidth = Math.max(280, Math.min(width - spacing.xl * 2, width * 0.88));
  const bannerSnapInterval = bannerCardWidth + HOME_BANNER_CARD_SPACING;

  const fetchData = async () => {
    try {
      const now = Date.now();
      const listingTtlMs = 30 * 24 * 60 * 60 * 1000;
      const toTs = (value: any) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const n = Number(value);
          return Number.isFinite(n) ? n : 0;
        }
        return 0;
      };
      const isExpiredByAge = (listing: any) => {
        const updatedAt = toTs(listing?.updatedAt);
        const createdAt = toTs(listing?.createdAt);
        const lastTouch = updatedAt || createdAt;
        return lastTouch ? lastTouch <= now - listingTtlMs : false;
      };
      const canManageAllListings = Boolean(user?.isAdmin || user?.isSuperAdmin);
      const canDelete = (listing: any) => canManageAllListings || String(listing?.userId || '') === String(user?.uid || '');
      const isExpiredSold = (listing: any) => String(listing?.status || '') === 'sold' && Number(listing?.deleteAt || 0) > 0 && Number(listing.deleteAt) <= now;

      const carsQuery = query(dbRef(db, 'cars'), orderByChild('createdAt'));
      const partsQuery = query(dbRef(db, 'parts'), orderByChild('createdAt'));
      const requestsQuery = query(dbRef(db, 'requests'), orderByChild('createdAt'));
      const [carsSnap, partsSnap, requestsSnap, activeBanners] = await Promise.all([
        getDbSnapshot(carsQuery, 'cars'),
        getDbSnapshot(partsQuery, 'parts'),
        getDbSnapshot(requestsQuery, 'requests'),
        fetchActiveBanners('home'),
      ]);
      const carsData: Car[] = [];
      carsSnap.forEach((child: any) => { carsData.push({ id: child.key, ...child.val() }); return undefined; });
      const partsData: Part[] = [];
      partsSnap.forEach((child: any) => { partsData.push({ id: child.key, ...child.val() }); return undefined; });
      const requestsData: Request[] = [];
      requestsSnap.forEach((child: any) => { requestsData.push({ id: child.key, ...child.val() }); return undefined; });

      const expiredCars = carsData.filter(c => isExpiredSold(c) && canDelete(c));
      const expiredParts = partsData.filter(p => isExpiredSold(p) && canDelete(p));
      if (expiredCars.length || expiredParts.length) {
        await Promise.allSettled([
          ...expiredCars.map(async (c: any) => {
            try { await remove(dbRef(db, `cars/${c.id}`)); } catch { return; }
            await deleteListingMediaByUrls(collectListingMediaUrls(c));
          }),
          ...expiredParts.map(async (p: any) => {
            try { await remove(dbRef(db, `parts/${p.id}`)); } catch { return; }
            await deleteListingMediaByUrls(collectListingMediaUrls(p));
          }),
        ]);
      }

      const carsVisible = carsData.filter(c => !isExpiredSold(c) && !isExpiredByAge(c));
      const partsVisible = partsData.filter(p => !isExpiredSold(p) && !isExpiredByAge(p));
      const nextCars = sortListingsByFreshnessAndStatus(carsVisible).slice(0, 8);
      const nextParts = sortListingsByFreshnessAndStatus(partsVisible).slice(0, 6);
      setCars(nextCars);
      setParts(nextParts);
      setRequests(sortListingsByFreshnessAndStatus(requestsData.filter(r => !isExpiredByAge(r))).slice(0, 4));
      setBanners(activeBanners);

      prefetchAdImages([
        ...nextCars.map(getListingThumbnailUrl),
        ...nextParts.map(getListingThumbnailUrl),
      ], 10);
    } catch (e) {
      console.log('Fetch error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    Animated.parallel([
      Animated.timing(heroAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, delay: 300, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, heroAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const openWhatsApp = (phone: string, msg: string) => {
    Linking.openURL(`https://wa.me/${toWaMeDigits(phone)}?text=${encodeURIComponent(msg)}`);
  };

  const openBannerTarget = async (targetUrl?: string) => {
    if (!targetUrl) return;

    const normalizedUrl = /^https?:\/\//i.test(targetUrl) ? targetUrl : `https://${targetUrl}`;

    try {
      const canOpen = await Linking.canOpenURL(normalizedUrl);
      if (canOpen) {
        await Linking.openURL(normalizedUrl);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    bannerIndexRef.current = 0;

    if (banners.length > 0) {
      bannerListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }

    if (banners.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      const nextIndex = (bannerIndexRef.current + 1) % banners.length;

      bannerListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewPosition: 0,
      });

      bannerIndexRef.current = nextIndex;
    }, HOME_BANNER_AUTO_SLIDE_MS);

    return () => clearInterval(intervalId);
  }, [banners.length]);

  const renderPartCard = ({ item }: { item: Part }) => {
    const isFeatured = Number(item?.featuredAt || 0) > 0;
    return (
      <TouchableOpacity
        style={[s.partCard, isFeatured ? s.featuredCard : null]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('PartDetails', { id: item.id })}
      >
      {getListingThumbnailUrl(item) ? (
        <FastAdImage uri={getListingThumbnailUrl(item)} style={s.partImg} fallback={<Text style={{ fontSize: 30 }}>⚙️</Text>} />
      ) : (
        <View style={[s.partImg, s.placeholder]}><Text style={{ fontSize: 30 }}>⚙️</Text></View>
      )}
      <LinearGradient colors={['transparent', 'transparent']} style={s.partGradient} />
      {isFeatured ? (
        <View pointerEvents="none" style={s.featureBadge}>
          <Text style={s.featureBadgeText} numberOfLines={1}>{t('featuredAdLabel')}</Text>
        </View>
      ) : null}
      <View style={s.partOverlay}>
        <Text style={s.partTitle} numberOfLines={1}>{item.title.ar}</Text>
        <Text style={s.partPrice}>{item.price?.toLocaleString()} {t('kwd')}</Text>
        {formatListingPublishedAt(item.createdAt) ? (
          <Text style={s.partMeta}>{t('publishedOn')}: {formatListingPublishedAt(item.createdAt)}</Text>
        ) : null}
      </View>
      {item.condition === 'new' && (
        <View style={s.newBadge}><Text style={s.newBadgeText}>{t('new')}</Text></View>
      )}
      </TouchableOpacity>
    );
  };

  const renderRequestCard = ({ item }: { item: Request }) => {
    const catLabel = item.category === 'car'
      ? t('requestCategoryCar')
      : item.category === 'part'
        ? t('requestCategoryPart')
        : t('requestCategorySpecial');
    const publishedAt = formatListingPublishedAt(item.createdAt);
    return (
      <TouchableOpacity
        style={s.requestCard}
        activeOpacity={0.88}
        onPress={() => {
          const locale = getLocale();
          const title = (locale === 'en' ? item.title?.en : item.title?.ar) || item.title?.ar || item.title?.en || '';
          const requestUrl = getPublishedListingUrl('wanted', item.id);
          const message = `${t('askAboutRequestMsg', { title })}\n${requestUrl}`.trim();
          openWhatsApp(item.userWhatsapp, message);
        }}
      >
        <View style={s.requestTopRow}>
          <View style={s.requestStatusBadge}>
            <Text style={s.requestStatusText}>{item.status === 'open' ? t('requestOpenBadge') : t('closed')}</Text>
          </View>
          <Text style={s.requestCategory}>{catLabel}</Text>
        </View>
        <Text style={s.requestTitle} numberOfLines={2}>{item.title?.ar}</Text>
        <Text style={s.requestDesc} numberOfLines={2}>{item.description?.ar}</Text>
        {publishedAt ? <Text style={s.requestMeta}>{t('publishedOn')}: {publishedAt}</Text> : null}
        <View style={s.requestFooter}>
          <Text style={s.requestUser}>{item.userName}</Text>
          <Text style={s.requestBudget}>{item.budget ? `${item.budget.toLocaleString()} ${t('kwd')}` : t('noBudget')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Animated.View style={[s.hero, { paddingTop: insets.top + 24, opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <View style={s.heroBtns}>
          <TouchableOpacity style={s.btnSecondary} activeOpacity={0.85} onPress={() => navigation.navigate('HomeTab', { screen: 'CreateListingHub' })}>
            <View style={s.btnSecondaryInner}>
              <Text style={s.btnSecText} numberOfLines={1} ellipsizeMode="tail">➕ {t('postYourAdBtn')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {banners.length ? (
        <Animated.View style={[s.section, { opacity: fadeAnim }] }>
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleWrap}>
              <View style={[s.sectionDot, { backgroundColor: colors.primary }]} />
              <Text style={s.sectionTitle}>{t('adsSectionTitle')}</Text>
            </View>
          </View>

          <FlatList
            ref={bannerListRef}
            data={banners}
            horizontal
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xl }}
            snapToInterval={bannerSnapInterval}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: bannerSnapInterval,
              offset: bannerSnapInterval * index,
              index,
            })}
            onMomentumScrollEnd={event => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / bannerSnapInterval);
              bannerIndexRef.current = Math.max(0, Math.min(nextIndex, banners.length - 1));
            }}
            onScrollToIndexFailed={info => {
              bannerListRef.current?.scrollToOffset({
                offset: bannerSnapInterval * info.index,
                animated: true,
              });
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.bannerCard, { width: bannerCardWidth }]}
                activeOpacity={item.targetUrl ? 0.88 : 1}
                onPress={() => openBannerTarget(item.targetUrl)}
                disabled={!item.targetUrl}
              >
                <LazyImage uri={item.imageUrl} style={s.bannerCardImage} resizeMode="cover" showWatermark={false} />
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      ) : null}

      <Animated.View style={[s.section, { opacity: fadeAnim }] }>
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleWrap}>
            <View style={[s.sectionDot, { backgroundColor: colors.green }]} />
            <Text style={s.sectionTitle}>{t('wantedNowTitle')}</Text>
          </View>
          <TouchableOpacity style={s.viewAllBtn} onPress={() => navigation.navigate('RequestsTab')}>
            <Text style={s.viewAll}>{t('all')} ←</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
            {[1, 2].map(i => <View key={i} style={s.requestSkeleton} />)}
          </ScrollView>
        ) : requests.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🔥</Text>
            <Text style={s.emptyText}>{t('startFirstWantedMsg')}</Text>
          </View>
        ) : (
          <FlatList
            data={requests}
            renderItem={renderRequestCard}
            keyExtractor={i => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xl }}
          />
        )}
      </Animated.View>

      {/* Cars Section */}
      <Animated.View style={[s.section, { opacity: fadeAnim }]}>
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleWrap}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>{t('cars')}</Text>
          </View>
          <TouchableOpacity style={s.viewAllBtn} onPress={() => navigation.navigate('CarsTab')}>
            <Text style={s.viewAll}>{t('all')} ←</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
            <CarCardSkeleton />
            <CarCardSkeleton />
          </ScrollView>
        ) : cars.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🏎️</Text>
            <Text style={s.emptyText}>{t('noResults')}</Text>
          </View>
        ) : (
          <FlatList
            data={cars}
            renderItem={({ item }) => (
              <CarCard
                car={item}
                onPress={() => navigation.navigate('CarDetails', { id: item.id })}
                onWhatsApp={() => {
                  const locale = getLocale();
                  const title = (locale === 'en' ? item.title?.en : item.title?.ar) || item.title?.ar || item.title?.en || '';
                  const carUrl = getPublishedListingUrl('cars', item.id);
                  const message = `${t('askAboutListingMsg', { title })}\n${carUrl}`.trim();
                  openWhatsApp(item.userWhatsapp, message);
                }}
              />
            )}
            keyExtractor={i => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xl }}
            snapToInterval={width * 0.75 + 14}
            decelerationRate="fast"
          />
        )}
      </Animated.View>

      {/* Parts Section */}
      <Animated.View style={[s.section, { opacity: fadeAnim }]}>
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleWrap}>
            <View style={[s.sectionDot, { backgroundColor: colors.yellow }]} />
            <Text style={s.sectionTitle}>{t('parts')}</Text>
          </View>
          <TouchableOpacity style={s.viewAllBtn} onPress={() => navigation.navigate('PartsTab')}>
            <Text style={s.viewAll}>{t('all')} ←</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
            {[1, 2, 3].map(i => <View key={i} style={{ width: 150, height: 180, backgroundColor: colors.darkCard, borderRadius: radius.lg, marginRight: 12 }} />)}
          </ScrollView>
        ) : parts.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>⚙️</Text>
            <Text style={s.emptyText}>{t('noResults')}</Text>
          </View>
        ) : (
          <FlatList
            data={parts}
            renderItem={renderPartCard}
            keyExtractor={i => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xl }}
          />
        )}
      </Animated.View>

      {/* CTA */}
      <View style={s.ctaSection}>
        <LinearGradient colors={['rgba(227,30,36,0.05)', 'transparent']} style={s.ctaGlow} />
        <Text style={s.ctaTitle}>{t('ctaTitle')}</Text>
        <Text style={s.ctaSub}>{t('ctaSub')}</Text>
        <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85} onPress={() => navigation.navigate('HomeTab', { screen: 'CreateListingHub' })}>
          <View style={s.ctaBtnGradient}>
            <LinearGradient colors={colors.gradient.primary as string[]} style={s.ctaBtnGradientFill} />
            <Text style={s.ctaBtnText}>🚀 {t('ctaPublishNowBtn')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: tabBarHeight + 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },

  hero: { paddingBottom: 8, paddingHorizontal: spacing.xl, alignItems: 'stretch' },
  heroBtns: { flexDirection: 'column', gap: 12, width: '100%', alignItems: 'stretch' },
  btnPrimary: { width: '100%', borderRadius: radius.lg, overflow: 'hidden', ...shadows.glow },
  btnGradient: { width: '100%', paddingVertical: 16, paddingHorizontal: spacing.lg, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  btnGradientFill: { ...StyleSheet.absoluteFillObject },
  btnSecondary: { width: '100%', borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.metalBorder },
  btnSecondaryInner: { width: '100%', backgroundColor: colors.metal, paddingVertical: 16, paddingHorizontal: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: colors.white, fontWeight: '800', fontSize: 16, textAlign: 'center' },
  btnSecText: { color: colors.white, fontWeight: '700', fontSize: 16, textAlign: 'center' },

  // Sections
  section: { marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: 16 },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: colors.white },
  viewAllBtn: { backgroundColor: colors.metal, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full },
  viewAll: { color: colors.primary, fontWeight: '700', fontSize: 12 },

  // Empty
  emptyWrap: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: colors.silver, fontSize: 14 },

  // Parts
  partCard: { width: 155, height: 190, marginRight: 12, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.metalBorder },
  featuredCard: { borderColor: colors.gold, borderWidth: 2 },
  partImg: { width: '100%', height: '100%' },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  partGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  partOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  partTitle: { color: colors.white, fontWeight: '700', fontSize: 13, marginBottom: 2 },
  partPrice: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  partMeta: { color: colors.silverLight, fontSize: 10, marginTop: 6, textAlign: 'right' },
  newBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.green, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  newBadgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  featureBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadgeText: { fontSize: 11, fontWeight: '900', color: colors.gold },

  requestSkeleton: { width: width * 0.78, height: 170, borderRadius: radius.xl, backgroundColor: colors.darkCard, borderWidth: 1, borderColor: colors.metalBorder, marginRight: 12 },
  requestCard: { width: width * 0.78, backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginRight: 12, ...shadows.card },
  requestTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  requestStatusBadge: { backgroundColor: colors.greenGlow, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  requestStatusText: { color: colors.green, fontSize: 11, fontWeight: '900' },
  requestCategory: { color: colors.silver, fontSize: 12, fontWeight: '700' },
  requestTitle: { color: colors.white, fontSize: 18, fontWeight: '900', marginBottom: 8 },
  requestDesc: { color: colors.silverLight, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  requestMeta: { color: colors.silverLight, fontSize: 11, marginBottom: 14, textAlign: 'right' },
  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.metalBorder, paddingTop: 14 },
  requestUser: { color: colors.white, fontWeight: '700', fontSize: 12 },
  requestBudget: { color: colors.primary, fontWeight: '800', fontSize: 12 },

  // CTA
  ctaSection: { marginTop: 40, marginHorizontal: spacing.xl, padding: 28, backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.primaryBorder, alignItems: 'center', overflow: 'hidden' },
  ctaGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  ctaTitle: { color: colors.white, fontSize: 20, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  ctaSub: { color: colors.silver, fontSize: 13, marginBottom: 20, textAlign: 'center' },
  ctaBtn: { borderRadius: radius.lg, overflow: 'hidden', width: '100%' },
  ctaBtnGradient: { width: '100%', paddingVertical: 16, paddingHorizontal: 32, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  ctaBtnGradientFill: { ...StyleSheet.absoluteFillObject },
  ctaBtnText: { color: colors.white, fontWeight: '800', fontSize: 16 },

  bannerCard: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    overflow: 'hidden',
    marginRight: HOME_BANNER_CARD_SPACING,
    ...shadows.card,
  },
  bannerCardImage: { width: '100%', aspectRatio: 2.2, backgroundColor: colors.darkLight },
});

