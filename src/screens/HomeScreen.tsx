import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList, Image, Linking, Animated, RefreshControl } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { db } from '../lib/firebase';
import { get, limitToLast, orderByChild, query, ref as dbRef } from '@react-native-firebase/database';
import { colors, radius, shadows, spacing } from '../lib/theme';
import { t } from '../i18n';
import { Car, Part, Request } from '../types';
import CarCard from '../components/CarCard';
import { CarCardSkeleton } from '../components/Shimmer';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const heroAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    try {
      const carsQuery = query(dbRef(db, 'cars'), orderByChild('createdAt'), limitToLast(8));
      const partsQuery = query(dbRef(db, 'parts'), orderByChild('createdAt'), limitToLast(6));
      const requestsQuery = query(dbRef(db, 'requests'), orderByChild('createdAt'), limitToLast(4));
      const [carsSnap, partsSnap, requestsSnap] = await Promise.all([
        get(carsQuery),
        get(partsQuery),
        get(requestsQuery),
      ]);
      const carsData: Car[] = [];
      carsSnap.forEach((child: any) => { carsData.unshift({ id: child.key, ...child.val() }); return undefined; });
      const partsData: Part[] = [];
      partsSnap.forEach((child: any) => { partsData.unshift({ id: child.key, ...child.val() }); return undefined; });
      const requestsData: Request[] = [];
      requestsSnap.forEach((child: any) => { requestsData.unshift({ id: child.key, ...child.val() }); return undefined; });
      setCars(carsData);
      setParts(partsData);
      setRequests(requestsData);
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
    Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`);
  };

  const renderPartCard = ({ item }: { item: Part }) => (
    <TouchableOpacity style={s.partCard} activeOpacity={0.85} onPress={() => navigation.navigate('PartDetails', { id: item.id })}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={s.partImg} />
      ) : (
        <View style={[s.partImg, s.placeholder]}><Text style={{ fontSize: 30 }}>⚙️</Text></View>
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={s.partGradient} />
      <View style={s.partOverlay}>
        <Text style={s.partTitle} numberOfLines={1}>{item.title.ar}</Text>
        <Text style={s.partPrice}>{item.price?.toLocaleString()} {t('kwd')}</Text>
      </View>
      {item.condition === 'new' && (
        <View style={s.newBadge}><Text style={s.newBadgeText}>{t('new')}</Text></View>
      )}
    </TouchableOpacity>
  );

  const renderRequestCard = ({ item }: { item: Request }) => {
    const catLabel = item.category === 'car' ? 'سيارة' : item.category === 'part' ? 'قطعة' : 'طلب خاص';
    return (
      <TouchableOpacity
        style={s.requestCard}
        activeOpacity={0.88}
        onPress={() => openWhatsApp(item.userWhatsapp, `مرحبا، عندي عرض بخصوص طلبك: ${item.title?.ar}`)}
      >
        <View style={s.requestTopRow}>
          <View style={s.requestStatusBadge}>
            <Text style={s.requestStatusText}>{item.status === 'open' ? 'مطلوب الآن' : 'مغلق'}</Text>
          </View>
          <Text style={s.requestCategory}>{catLabel}</Text>
        </View>
        <Text style={s.requestTitle} numberOfLines={2}>{item.title?.ar}</Text>
        <Text style={s.requestDesc} numberOfLines={2}>{item.description?.ar}</Text>
        <View style={s.requestFooter}>
          <Text style={s.requestUser}>{item.userName}</Text>
          <Text style={s.requestBudget}>{item.budget ? `${item.budget.toLocaleString()} ${t('kwd')}` : 'بدون ميزانية محددة'}</Text>
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
      {/* Hero Section */}
      <Animated.View style={[s.hero, { paddingTop: insets.top + 24, opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <LinearGradient colors={['rgba(227,30,36,0.08)', 'transparent']} style={s.heroGlow} />
        <View style={s.logoWrap}>
          <Text style={s.logoQ8}>Q8</Text>
          <Text style={s.logoSport}>SPORT MARKET</Text>
        </View>
        <View style={s.heroLine} />
        <Text style={s.heroTitle}>{t('hero')}</Text>
        <Text style={s.heroSub}>{t('heroSub')}</Text>

        <View style={s.heroPitchCard}>
          <Text style={s.heroPitchTitle}>سوق سريع يطلع بين الشباب</Text>
          <Text style={s.heroPitchText}>المعروضات والمطلوبات في مكان واحد. إذا أحد يبي مكينة فورد أو رنجات AMG أو سيارة كاملة، يكتب المطلوب ويبدأ التفاعل مباشرة.</Text>
        </View>

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statNum}>{cars.length}+</Text>
            <Text style={s.statLabel}>{t('cars')}</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{parts.length}+</Text>
            <Text style={s.statLabel}>{t('parts')}</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{requests.length}+</Text>
            <Text style={s.statLabel}>مطلوب</Text>
          </View>
        </View>

        <View style={s.heroBtns}>
          <TouchableOpacity style={s.btnPrimary} activeOpacity={0.85} onPress={() => navigation.navigate('CarsTab')}>
            <View style={s.btnGradient}>
              <LinearGradient
                colors={colors.gradient.primary as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.btnGradientFill}
              />
              <Text style={s.btnText} numberOfLines={1} ellipsizeMode="tail">🏎️  {t('cars')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} activeOpacity={0.85} onPress={() => navigation.navigate('HomeTab', { screen: 'CreateListingHub' })}>
            <View style={s.btnSecondaryInner}>
              <Text style={s.btnSecText} numberOfLines={1} ellipsizeMode="tail">➕ نزل إعلانك</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View style={[s.section, { opacity: fadeAnim }] }>
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleWrap}>
            <View style={[s.sectionDot, { backgroundColor: colors.green }]} />
            <Text style={s.sectionTitle}>المطلوب الآن</Text>
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
            <Text style={s.emptyText}>ابدأ أول مطلوب وخلك أول من يشغل السوق</Text>
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
                onWhatsApp={() => openWhatsApp(item.userWhatsapp, `مرحبا، أبي أستفسر عن: ${item.title.ar}`)}
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
        <Text style={s.ctaTitle}>خلك شرارة الانتشار</Text>
        <Text style={s.ctaSub}>انشر سيارة أو قطعة أو مطلوب، وخلك جزء من السوق اللي الناس ترجع له يوميًا</Text>
        <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85} onPress={() => navigation.navigate('HomeTab', { screen: 'CreateListingHub' })}>
          <View style={s.ctaBtnGradient}>
            <LinearGradient colors={colors.gradient.primary as string[]} style={s.ctaBtnGradientFill} />
            <Text style={s.ctaBtnText}>🚀 افتح النشر الآن</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: tabBarHeight + 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },

  // Hero
  hero: { paddingBottom: 30, paddingHorizontal: spacing.xl, alignItems: 'center' },
  heroGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, borderBottomLeftRadius: 100, borderBottomRightRadius: 100 },
  logoWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  logoQ8: { fontSize: 42, fontWeight: '900', color: colors.primary },
  logoSport: { fontSize: 20, fontWeight: '800', color: colors.white, letterSpacing: 2 },
  heroLine: { width: 50, height: 3, backgroundColor: colors.primary, borderRadius: 2, marginVertical: 18 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: colors.white, textAlign: 'center', marginBottom: 8, lineHeight: 34 },
  heroSub: { fontSize: 14, color: colors.silver, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  heroPitchCard: { width: '100%', backgroundColor: colors.darkCard, borderWidth: 1, borderColor: colors.primaryBorder, borderRadius: radius.xl, padding: 18, marginBottom: 20 },
  heroPitchTitle: { color: colors.white, fontWeight: '900', fontSize: 16, marginBottom: 8, textAlign: 'center' },
  heroPitchText: { color: colors.silverLight, lineHeight: 22, textAlign: 'center', fontSize: 13 },

  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, paddingVertical: 16, paddingHorizontal: 24, marginBottom: 24, gap: 20 },
  statItem: { alignItems: 'center' },
  statNum: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  statLabel: { color: colors.silver, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.metalBorder },

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
  partImg: { width: '100%', height: '100%' },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  partGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  partOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  partTitle: { color: colors.white, fontWeight: '700', fontSize: 13, marginBottom: 2 },
  partPrice: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  newBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.green, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  newBadgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },

  requestSkeleton: { width: width * 0.78, height: 170, borderRadius: radius.xl, backgroundColor: colors.darkCard, borderWidth: 1, borderColor: colors.metalBorder, marginRight: 12 },
  requestCard: { width: width * 0.78, backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginRight: 12, ...shadows.card },
  requestTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  requestStatusBadge: { backgroundColor: colors.greenGlow, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  requestStatusText: { color: colors.green, fontSize: 11, fontWeight: '900' },
  requestCategory: { color: colors.silver, fontSize: 12, fontWeight: '700' },
  requestTitle: { color: colors.white, fontSize: 18, fontWeight: '900', marginBottom: 8 },
  requestDesc: { color: colors.silverLight, fontSize: 13, lineHeight: 20, marginBottom: 16 },
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
});

