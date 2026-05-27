import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Linking, Modal, Animated, StatusBar } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { db } from '../../lib/firebase';
import { ref as dbRef } from '@react-native-firebase/database';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { Car } from '../../types';
import { shareListing } from '../../lib/shareListing';

const { width } = Dimensions.get('window');

export default function CarDetailsScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { id } = route.params;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const snap = await getDbSnapshot(dbRef(db, `cars/${id}`), `cars/${id}`);
        if (!mounted) return;
        if (snap.exists()) setCar({ id: snap.key, ...snap.val() });
      } catch (e) {
        console.log('CarDetails fetch error:', e);
      } finally {
        if (!mounted) return;
        setLoading(false);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
      }
    };

    run();
    return () => { mounted = false; };
  }, [fadeAnim, id, slideAnim]);

  if (loading) return (
    <View style={s.loadingWrap}>
      <Text style={s.loadingIcon}>🏎️</Text>
      <Text style={s.loadingText}>{t('loading')}</Text>
    </View>
  );
  if (!car) return (
    <View style={s.loadingWrap}>
      <Text style={s.loadingIcon}>😕</Text>
      <Text style={s.loadingText}>{t('noResults')}</Text>
    </View>
  );

  const openWhatsApp = () => {
    const phone = car.userWhatsapp?.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(`مرحبا، أبي أستفسر عن: ${car.title.ar} - ${car.brand} ${car.model} ${car.year}`)}`);
  };

  const shareMessage = [
    `إعلان من تطبيق Q8 Sport Car`,
    `${car.title.ar}`,
    `${car.brand} ${car.model} ${car.year}`,
    `السعر: ${car.price?.toLocaleString()} ${t('kwd')}`,
    car.description?.ar || '',
    'حمّل التطبيق وتابع المزيد من السيارات والقطع المميزة.',
  ].filter(Boolean).join('\n');

  const specs = [
    { icon: '📅', label: t('year'), value: car.year },
    { icon: '🏷️', label: t('brand'), value: car.brand },
    { icon: '🚗', label: t('model'), value: car.model },
    { icon: '📏', label: t('mileage'), value: car.mileage ? `${car.mileage.toLocaleString()} ${t('km')}` : '—' },
    { icon: '🎨', label: t('color'), value: car.color || '—' },
    { icon: '⚙️', label: t('transmission'), value: car.transmission === 'automatic' ? t('automatic') : t('manual') },
  ];

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={[s.imageSection, { marginTop: insets.top + 52 }] }>
          <TouchableOpacity activeOpacity={0.95} onPress={() => setLightbox(true)}>
            {car.images?.[imgIndex] ? (
              <Image source={{ uri: car.images[imgIndex] }} style={s.mainImg} />
            ) : (
              <View style={[s.mainImg, s.placeholder]}><Text style={{ fontSize: 70 }}>🏎️</Text></View>
            )}
          </TouchableOpacity>
          <LinearGradient colors={['transparent', colors.dark]} style={s.imgGradient} />

          {/* Image counter */}
          {car.images && car.images.length > 1 && (
            <View style={s.imgCounter}>
              <Text style={s.imgCounterText}>{imgIndex + 1}/{car.images.length}</Text>
            </View>
          )}

          {/* Status badge */}
          <View style={[s.statusBadge, car.status === 'sold' ? s.soldBg : s.activeBg]}>
            <Text style={[s.statusText, { color: colors.white }]}> 
              {car.status === 'active' ? t('active') : t('sold')}
            </Text>
          </View>
        </View>

        {/* Thumbnails */}
        {car.images && car.images.length > 1 && (
          <ScrollView horizontal style={s.thumbRow} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
            {car.images.map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setImgIndex(i)} style={[s.thumb, imgIndex === i && s.thumbActive]}>
                <Image source={{ uri: img }} style={s.thumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Content */}
        <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Title & Price */}
          <Text style={s.title}>{car.title.ar}</Text>
          <Text style={s.sub}>{car.brand} • {car.model} • {car.year}</Text>

          <View style={s.priceCard}>
            <View style={s.priceGradient}>
              <LinearGradient colors={['rgba(227,30,36,0.08)', 'rgba(227,30,36,0.02)']} style={s.priceGradientFill} />
              <View style={s.priceRow}>
                <View>
                  <Text style={s.priceLabel}>{t('price')}</Text>
                  <View style={s.priceWrap}>
                    <Text style={s.price}>{car.price?.toLocaleString()}</Text>
                    <Text style={s.kwd}>{t('kwd')}</Text>
                  </View>
                </View>
                <View style={s.yearBigBadge}>
                  <Text style={s.yearBigText}>{car.year}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Specs Grid */}
          <Text style={s.specsTitle}>المواصفات</Text>
          <View style={s.specsGrid}>
            {specs.map(sp => (
              <View key={sp.label} style={s.specItem}>
                <Text style={s.specIcon}>{sp.icon}</Text>
                <Text style={s.specLabel}>{sp.label}</Text>
                <Text style={s.specValue}>{sp.value}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {car.description?.ar && (
            <View style={s.descCard}>
              <Text style={s.descTitle}>{t('description')}</Text>
              <Text style={s.descText}>{car.description.ar}</Text>
            </View>
          )}

          {/* Seller */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={s.sellerCard}
            onPress={() => navigation.navigate('SellerProfile', { sellerId: car.userId, sellerName: car.userName, sellerWhatsapp: car.userWhatsapp })}
          >
            <View style={s.sellerAvatar}>
              {car.userAvatar ? (
                <Image source={{ uri: car.userAvatar }} style={s.sellerAvatarImage} />
              ) : (
                <Text style={s.sellerAvatarText}>{car.userName?.[0] || '?'}</Text>
              )}
            </View>
            <View style={s.sellerInfo}>
              <Text style={s.sellerName}>{car.userName}</Text>
              <Text style={s.sellerLabel}>المعلن • اضغط لعرض ملفه</Text>
            </View>
            <TouchableOpacity style={s.sellerWhatsappBtn} activeOpacity={0.88} onPress={openWhatsApp}>
              <Text style={s.sellerWhatsappIcon}>💬</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={s.shareCard}>
            <Text style={s.shareTitle}>شارك الإعلان</Text>
            <Text style={s.shareSubtitle}>انشر السيارة في واتساب أو انستقرام أو تيكتوك أو سناب</Text>
            <View style={s.shareGrid}>
              <TouchableOpacity style={s.shareChip} activeOpacity={0.88} onPress={() => shareListing('whatsapp', shareMessage)}>
                <Text style={s.shareChipText}>واتساب</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.shareChip} activeOpacity={0.88} onPress={() => shareListing('instagram', shareMessage)}>
                <Text style={s.shareChipText}>انستقرام</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.shareChip} activeOpacity={0.88} onPress={() => shareListing('tiktok', shareMessage)}>
                <Text style={s.shareChipText}>تيكتوك</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.shareChip} activeOpacity={0.88} onPress={() => shareListing('snapchat', shareMessage)}>
                <Text style={s.shareChipText}>سناب</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: tabBarHeight + 36 }} />
      </ScrollView>

      {/* Lightbox */}
      <Modal visible={lightbox} transparent animationType="fade">
        <View style={s.lightbox}>
          <StatusBar hidden={lightbox} />
          <TouchableOpacity style={[s.closeBtn, { top: insets.top + 16 }]} onPress={() => setLightbox(false)}>
            <View style={s.closeBtnBg}><Text style={s.closeText}>✕</Text></View>
          </TouchableOpacity>
          {car.images?.[imgIndex] && <Image source={{ uri: car.images[imgIndex] }} style={s.lightboxImg} resizeMode="contain" />}
          {car.images && car.images.length > 1 && (
            <View style={[s.lightboxNav, { bottom: insets.bottom + 20 }]}>
              <TouchableOpacity onPress={() => setImgIndex(Math.max(0, imgIndex - 1))} style={s.navBtn}>
                <Text style={s.navText}>→</Text>
              </TouchableOpacity>
              <Text style={s.lightboxCount}>{imgIndex + 1} / {car.images.length}</Text>
              <TouchableOpacity onPress={() => setImgIndex(Math.min(car.images.length - 1, imgIndex + 1))} style={s.navBtn}>
                <Text style={s.navText}>←</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  loadingWrap: { flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' },
  loadingIcon: { fontSize: 50, marginBottom: 12 },
  loadingText: { color: colors.silver, fontSize: 15 },

  // Image
  imageSection: { position: 'relative' },
  mainImg: { width, height: 320 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  imgGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  imgCounter: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  imgCounterText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  statusBadge: { position: 'absolute', top: 16, right: 16, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full },
  soldBg: { backgroundColor: 'rgba(227,30,36,0.9)' },
  activeBg: { backgroundColor: 'rgba(16,185,129,0.9)' },
  statusText: { color: colors.white, fontWeight: '800', fontSize: 12 },

  // Thumbs
  thumbRow: { marginTop: -10, marginBottom: 8 },
  thumb: { width: 56, height: 56, borderRadius: radius.md, marginRight: 8, borderWidth: 2, borderColor: colors.metalBorder, overflow: 'hidden' },
  thumbActive: { borderColor: colors.primary },
  thumbImg: { width: '100%', height: '100%' },

  // Content
  content: { padding: spacing.xl },
  title: { fontSize: 26, fontWeight: '900', color: colors.white, marginBottom: 4 },
  sub: { color: colors.silver, fontSize: 14, marginBottom: 20 },

  // Price
  priceCard: { borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.primaryBorder, marginBottom: 24 },
  priceGradient: { padding: 20, justifyContent: 'center' },
  priceGradientFill: { ...StyleSheet.absoluteFillObject },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { color: colors.silver, fontSize: 12, marginBottom: 4 },
  priceWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { color: colors.primary, fontSize: 34, fontWeight: '900' },
  kwd: { color: colors.silver, fontSize: 16 },
  yearBigBadge: { backgroundColor: colors.primary, width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  yearBigText: { color: colors.white, fontWeight: '900', fontSize: 14 },

  // Specs
  specsTitle: { color: colors.white, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  specItem: { width: (width - spacing.xl * 2 - 12) / 2, backgroundColor: colors.darkCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.metalBorder, padding: 14 },
  specIcon: { fontSize: 18, marginBottom: 10 },
  specLabel: { color: colors.silver, fontSize: 11, marginBottom: 6 },
  specValue: { color: colors.white, fontWeight: '800', fontSize: 14 },
  descCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 18 },
  descTitle: { color: colors.white, fontSize: 16, fontWeight: '900', marginBottom: 10 },
  descText: { color: colors.silverLight, fontSize: 14, lineHeight: 22 },
  bottomBar: { position: 'absolute', left: 0, right: 0 },
  bottomGradient: { position: 'relative' },
  bottomGradientFill: { ...StyleSheet.absoluteFillObject },
  waButton: { marginHorizontal: spacing.xl, borderRadius: radius.xl, overflow: 'hidden' },
  waButtonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  waButtonGradientFill: { ...StyleSheet.absoluteFillObject },
  waButtonText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.darkCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.metalBorder, padding: 14 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  sellerAvatarImage: { width: '100%', height: '100%' },
  sellerAvatarText: { color: colors.white, fontSize: 18, fontWeight: '900' },
  sellerInfo: { flex: 1 },
  sellerName: { color: colors.white, fontWeight: '700', fontSize: 15 },
  sellerLabel: { color: colors.silver, fontSize: 11, marginTop: 2 },
  sellerWhatsappBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sellerWhatsappIcon: { color: colors.white, fontSize: 18 },
  shareCard: { backgroundColor: colors.darkCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.metalBorder, padding: 16, marginTop: 16 },
  shareTitle: { color: colors.white, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  shareSubtitle: { color: colors.silver, fontSize: 12, lineHeight: 20, marginBottom: 14 },
  shareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shareChip: { minWidth: '47%', backgroundColor: colors.metal, borderRadius: radius.full, borderWidth: 1, borderColor: colors.metalBorder, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  shareChipText: { color: colors.white, fontSize: 13, fontWeight: '800' },

  // Lightbox
  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.97)', justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', right: 20, zIndex: 10 },
  closeBtnBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  closeText: { color: colors.white, fontSize: 20 },
  lightboxImg: { width: width, height: width },
  lightboxNav: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 20 },
  navBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  navText: { color: colors.white, fontSize: 20 },
  lightboxCount: { color: colors.white, fontSize: 14, fontWeight: '600' },
});
