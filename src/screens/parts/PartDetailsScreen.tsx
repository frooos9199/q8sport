import React, { useEffect, useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent, Modal, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ref as dbRef } from '@react-native-firebase/database';

import LazyImage from '../../components/LazyImage';
import { db } from '../../lib/firebase';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { formatListingPublishedAt } from '../../lib/listingDate';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { Part } from '../../types';
import { getLocale, t } from '../../i18n';
import { shareListing, type ShareTarget } from '../../lib/shareListing';
import FastAdImage from '../../components/FastAdImage';
import PinchZoomImage from '../../components/PinchZoomImage';
import ShareWatermarkRenderer, { ShareWatermarkHandle } from '../../components/ShareWatermarkRenderer';
import { getListingMediumUrl } from '../../lib/listingImages';
import { toWaMeDigits } from '../../lib/gccPhone';
import { getPublishedListingUrl } from '../../lib/publishedSite';
import { getBoostedListingViews, incrementListingViewsOncePerDay } from '../../lib/listingViews';

export default function PartDetailsScreen({ route, navigation }: any) {
  const { width } = useWindowDimensions();
  const { id } = route.params;
  const [part, setPart] = useState<Part | null>(null);
  const [sellerCampaign, setSellerCampaign] = useState<{ founderPosition?: number; tierLabel?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [views, setViews] = useState(0);
  const shareWatermarkRef = React.useRef<ShareWatermarkHandle | null>(null);
  const heroScrollRef = React.useRef<ScrollView | null>(null);
  const lightboxScrollRef = React.useRef<ScrollView | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const snap = await getDbSnapshot(dbRef(db, `parts/${id}`), `parts/${id}`);
        if (mounted && snap.exists()) {
          const nextPart = { id: snap.key, ...snap.val() };
          if (nextPart.category?.trim() !== 'عادم') {
            setPart(nextPart);
            setSelectedImageIndex(0);
          }
        }
      } catch (e) {
        console.log('PartDetails fetch error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    if (!part?.id) return;

    setViews(getBoostedListingViews(part.views, part.createdAt, part.id));

    incrementListingViewsOncePerDay('parts', part.id).then((nextViews) => {
      if (!mounted) return;
      if (typeof nextViews === 'number' && Number.isFinite(nextViews)) {
        setViews(getBoostedListingViews(nextViews, part.createdAt, part.id));
      }
    });

    return () => {
      mounted = false;
    };
  }, [part?.id, part?.views, part?.createdAt]);

  useEffect(() => {
    let mounted = true;

    const sellerId = part?.userId;
    if (!sellerId) {
      setSellerCampaign(null);
      return () => {
        mounted = false;
      };
    }

    const run = async () => {
      try {
        const snap = await getDbSnapshot(dbRef(db, `users/${sellerId}/campaign`), `users/${sellerId}/campaign`);
        if (!mounted) return;
        setSellerCampaign(snap.exists() ? snap.val() : null);
      } catch {
        if (!mounted) return;
        setSellerCampaign(null);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [part?.userId]);

  useEffect(() => {
    if (!lightbox) return;
    setLightboxZoomed(false);
    requestAnimationFrame(() => {
      lightboxScrollRef.current?.scrollTo({ x: selectedImageIndex * width, animated: false });
    });
  }, [lightbox, selectedImageIndex, width]);

  if (loading) {
    return (
      <View style={s.center}>
        <Text style={s.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (!part) {
    return (
      <View style={s.center}>
        <Text style={s.loadingText}>{t('noResults')}</Text>
      </View>
    );
  }

  const contactSeller = () => {
    const phone = String(part.userWhatsapp || part.userPhone || '').replace(/[^0-9]/g, '');
    if (!phone) {
      Alert.alert(t('warningTitle'), t('noWhatsappForListingMsg'));
      return;
    }

    const locale = getLocale();
    const title = (locale === 'en' ? part.title?.en : part.title?.ar) || part.title?.ar || part.title?.en || '';
    const partUrl = getPublishedListingUrl('parts', part.id);
    const message = `${t('askAboutPartMsg', { title })}\n${partUrl}`.trim();

    Linking.openURL(
      `https://wa.me/${toWaMeDigits(phone)}?text=${encodeURIComponent(
        message,
      )}`,
    );
  };

  const callSeller = () => {
    const phone = String(part.userPhone || part.userWhatsapp || '').replace(/[^0-9]/g, '');
    if (!phone) {
      Alert.alert(t('warningTitle'), t('noCallForListingMsg'));
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const callDigits = String(part.userPhone || part.userWhatsapp || '').replace(/[^0-9]/g, '');

  const safeText = (value: unknown) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed === 'null' || trimmed === 'undefined') return '';
    return trimmed;
  };

  const getLocalizedText = (value: unknown) => {
    if (typeof value === 'string') return safeText(value);
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      return safeText(record.ar) || safeText(record.en);
    }
    return '';
  };

  const marketHashtags = [
    '#قطع_غيار_الكويت',
    '#قطع_غيار',
    '#spareparts',
    '#partskuwait',
    '#q8sportcar',
  ].join(' ');

  const partTitle = getLocalizedText(part.title);
  const partLine = [safeText(part.category), ...(Array.isArray(part.compatibleBrands) ? part.compatibleBrands.map(safeText) : [])]
    .filter(Boolean)
    .join(' • ');

  const shareMessage = [
    safeText(t('shareFromAppLine')),
    part.status === 'sold' ? 'مباع' : '',
    part.status === 'sold' ? 'Q8SportCar' : '',
    partTitle || safeText(t('listingTypePart')),
    partLine,
    part.price != null ? safeText(t('sharePriceLine', { price: part.price?.toLocaleString(), kwd: t('kwd') })) : '',
    getLocalizedText((part as any).description),
    safeText(t('shareDownloadAppLineParts')),
    marketHashtags,
  ].filter(Boolean).join('\n');
  const heroHeight = Math.max(250, Math.min(width * 0.88, 340));
  const shareChipWidth = width < 360 ? '100%' : '47%';

  const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const numericKeys = Object.keys(record)
        .filter(key => /^\d+$/.test(key))
        .map(key => Number(key))
        .sort((a, b) => a - b);

      return numericKeys
        .map(key => record[String(key)])
        .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
    }

    return [];
  };

  const imageMediums = toStringArray((part as any)?.imageMediums);
  const imageThumbs = toStringArray((part as any)?.imageThumbs);
  const images = toStringArray((part as any)?.images);
  const gallery = (imageMediums.length ? imageMediums : images).length
    ? (imageMediums.length ? imageMediums : images)
    : [];

  const heroUri =
    gallery[selectedImageIndex] ||
    getListingMediumUrl(part) ||
    undefined;

  const onHeroSwipe = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (nextIndex !== selectedImageIndex && nextIndex >= 0 && nextIndex < gallery.length) {
      setSelectedImageIndex(nextIndex);
    }
  };

  const onLightboxSwipe = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (nextIndex !== selectedImageIndex && nextIndex >= 0 && nextIndex < gallery.length) {
      setSelectedImageIndex(nextIndex);
      heroScrollRef.current?.scrollTo({ x: nextIndex * width, animated: false });
    }
  };

  const goToImage = (index: number) => {
    const safeIndex = Math.max(0, Math.min(gallery.length - 1, index));
    setSelectedImageIndex(safeIndex);
    heroScrollRef.current?.scrollTo({ x: safeIndex * width, animated: true });
    lightboxScrollRef.current?.scrollTo({ x: safeIndex * width, animated: true });
  };

  const shareGalleryUrls = (() => {
    const count = Math.max(imageMediums.length, images.length);
    const urls: string[] = [];

    if (count > 0) {
      for (let i = 0; i < count; i += 1) {
        const candidate = imageMediums[i] || images[i];
        if (typeof candidate === 'string' && candidate.trim()) {
          urls.push(candidate.trim());
        }
      }
    } else if (heroUri) {
      urls.push(heroUri);
    }

    return Array.from(new Set(urls));
  })();

  const shareToTarget = async (target: ShareTarget) => {
    const inputUrls = shareGalleryUrls.slice(0, 10);
    let urlsToShare: string[] = inputUrls;

    try {
      const captured = await shareWatermarkRef.current?.captureAll(inputUrls);
      if (captured?.length) urlsToShare = captured;
    } catch {
      // best effort
    }

    await shareListing(target, shareMessage, urlsToShare);
  };

  return (
    <View style={s.container}>
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={s.heroWrap}>
        {gallery.length > 0 ? (
          <ScrollView
            ref={heroScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onHeroSwipe}
          >
            {gallery.map((uri, index) => (
              <TouchableOpacity key={`${uri}-${index}`} activeOpacity={0.95} onPress={() => setLightbox(true)}>
                <FastAdImage
                  uri={uri}
                  style={[s.heroImage, { height: heroHeight, width }]}
                  fallback={<Text style={s.placeholderIcon}>⚙️</Text>}
                  placeholderColor={colors.darkCard}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : heroUri ? (
          <TouchableOpacity activeOpacity={0.95} onPress={() => setLightbox(true)}>
            <FastAdImage uri={heroUri} style={[s.heroImage, { height: heroHeight }]} fallback={<Text style={s.placeholderIcon}>⚙️</Text>} placeholderColor={colors.darkCard} />
          </TouchableOpacity>
        ) : (
          <View style={[s.heroImage, { height: heroHeight }, s.placeholder]}>
            <Text style={s.placeholderIcon}>⚙️</Text>
          </View>
        )}
        <LinearGradient colors={['transparent', 'transparent']} style={s.heroGradient} />
        <View pointerEvents="none" style={s.viewsBadge}>
          <Text style={s.viewsText}>👁 {Number(views || 0).toLocaleString()}</Text>
        </View>
        <View style={s.conditionBadge}>
          <Text style={s.conditionText}>{part.condition === 'new' ? t('new') : t('used')}</Text>
        </View>
      </View>

      {gallery.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.galleryRow}
        >
          {gallery.map((uri, index) => {
            const thumbUri = imageThumbs[index] || uri;
            const active = index === selectedImageIndex;

            return (
              <TouchableOpacity
                key={`${uri}-${index}`}
                activeOpacity={0.9}
                onPress={() => goToImage(index)}
                style={[s.galleryThumbWrap, active ? s.galleryThumbActive : s.galleryThumbIdle]}
              >
                <FastAdImage
                  uri={thumbUri}
                  style={s.galleryThumb}
                  fallback={<Text style={{ fontSize: 22 }}>⚙️</Text>}
                  placeholderColor={colors.darkCard}
                  showWatermark={false}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      <View style={s.content}>
        <Text style={s.title}>{part.title?.ar}</Text>
        <Text style={s.subtitle}>{part.category || t('listingTypePart')}{part.compatibleBrands?.length ? ` • ${part.compatibleBrands.join(' • ')}` : ''}</Text>

        <View style={s.priceCard}>
          <Text style={s.priceLabel}>{t('price')}</Text>
          <Text style={s.priceValue}>{part.price?.toLocaleString()} {t('kwd')}</Text>
        </View>

        <View style={s.detailsCard}>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>{t('condition')}</Text>
            <Text style={s.detailValue}>{part.condition === 'new' ? t('new') : t('used')}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>{t('publishedOn')}</Text>
            <Text style={s.detailValue}>{formatListingPublishedAt(part.createdAt) || '—'}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>{t('marketStatus')}</Text>
            <Text style={s.detailValue}>{part.status === 'active' ? t('available') : part.status === 'sold' ? t('sold') : t('pending')}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>{t('compatibility')}</Text>
            <Text style={s.detailValue}>{part.compatibleBrands?.length ? part.compatibleBrands.join(' • ') : t('compatibilityUnknown')}</Text>
          </View>
        </View>

        {!!part.description?.ar && (
          <View style={s.detailsCard}>
            <Text style={s.sectionTitle}>{t('description')}</Text>
            <Text style={s.description}>{part.description.ar}</Text>
          </View>
        )}

        <TouchableOpacity
          style={s.sellerCard}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('SellerProfile', { sellerId: part.userId, sellerName: part.userName, sellerWhatsapp: part.userWhatsapp, sellerPhone: part.userPhone })}
        >
          <View style={s.sellerAvatar}>
            {part.userAvatar ? (
              <LazyImage uri={part.userAvatar} style={s.sellerAvatarImage} fallback={<Text style={s.sellerAvatarText}>{part.userName?.[0] || '?'}</Text>} />
            ) : (
              <Text style={s.sellerAvatarText}>{part.userName?.[0] || '?'}</Text>
            )}
          </View>
          <View style={s.sellerCopy}>
            <Text style={s.sellerLabel}>{t('sellerTitle')}</Text>
            <View style={s.sellerNameRow}>
              <Text style={s.sellerName}>{part.userName}</Text>
              {Number(sellerCampaign?.founderPosition || 0) > 0 ? (
                <View style={s.tierBadge}>
                  <Text style={s.tierBadgeText}>{sellerCampaign?.tierLabel || t('founderLabel')}</Text>
                </View>
              ) : null}
            </View>
            <Text style={s.sellerHint}>{t('sellerDirectHint')}</Text>
          </View>
          <View style={s.sellerActions}>
            <TouchableOpacity style={s.sellerWhatsappBtn} activeOpacity={0.88} onPress={contactSeller}>
              <Text style={s.sellerWhatsappIcon}>💬</Text>
            </TouchableOpacity>
            {callDigits ? (
              <TouchableOpacity style={s.sellerCallBtn} activeOpacity={0.88} onPress={callSeller}>
                <Text style={s.sellerCallIcon}>📞</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>

        <View style={s.shareCard}>
          <Text style={s.shareTitle}>{t('shareTitle')}</Text>
          <Text style={s.shareSubtitle}>{t('shareSubtitlePart')}</Text>
          <View style={s.shareGrid}>
            <TouchableOpacity style={[s.shareChip, { width: shareChipWidth }]} activeOpacity={0.88} onPress={() => { void shareToTarget('whatsapp'); }}>
              <Text style={s.shareChipText}>{t('whatsappLabel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.shareChip, { width: shareChipWidth }]} activeOpacity={0.88} onPress={() => { void shareToTarget('instagram'); }}>
              <Text style={s.shareChipText}>{t('instagramLabel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.shareChip, { width: shareChipWidth }]} activeOpacity={0.88} onPress={() => { void shareToTarget('tiktok'); }}>
              <Text style={s.shareChipText}>{t('tiktokLabel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.shareChip, { width: shareChipWidth }]} activeOpacity={0.88} onPress={() => { void shareToTarget('snapchat'); }}>
              <Text style={s.shareChipText}>{t('snapchatLabel')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ShareWatermarkRenderer ref={shareWatermarkRef} isSold={part.status === 'sold'} soldLabel={'مباع'} />
      </View>
    </ScrollView>

    <Modal visible={lightbox} transparent={false} animationType="fade" presentationStyle="fullScreen">
      <View style={s.lightbox}>
        <StatusBar hidden={lightbox} />
        <TouchableOpacity style={s.closeBtn} onPress={() => setLightbox(false)}>
          <View style={s.closeBtnBg}><Text style={s.closeText}>✕</Text></View>
        </TouchableOpacity>
        {heroUri ? (
          <ScrollView
            ref={lightboxScrollRef}
            horizontal
            pagingEnabled
            scrollEnabled={!lightboxZoomed}
            style={s.lightboxPager}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onLightboxSwipe}
          >
            {gallery.map((uri, index) => (
              <View key={`${uri}-${index}`} style={[s.lightboxImgWrap, { width }]}> 
                <PinchZoomImage uri={uri} style={s.lightboxImg} onZoomChange={setLightboxZoomed} />
              </View>
            ))}
          </ScrollView>
        ) : null}
        {gallery.length > 1 ? (
          <View style={s.lightboxNav}>
            <TouchableOpacity onPress={() => goToImage(selectedImageIndex - 1)} style={s.navBtn}>
              <Text style={s.navText}>→</Text>
            </TouchableOpacity>
            <Text style={s.lightboxCount}>{selectedImageIndex + 1} / {gallery.length}</Text>
            <TouchableOpacity onPress={() => goToImage(selectedImageIndex + 1)} style={s.navBtn}>
              <Text style={s.navText}>←</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.silver, fontSize: 15 },

  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', backgroundColor: colors.darkCard },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 56 },
  heroGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 140 },
  viewsBadge: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  viewsText: { color: colors.white, fontWeight: '900', fontSize: 12 },
  conditionBadge: { position: 'absolute', top: 18, left: 18, backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  conditionText: { color: colors.white, fontWeight: '900', fontSize: 12 },

  galleryRow: { paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 6, gap: 10 },
  galleryThumbWrap: { width: 74, height: 74, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1 },
  galleryThumbIdle: { borderColor: colors.metalBorder, backgroundColor: colors.darkCard },
  galleryThumbActive: { borderColor: colors.primary, backgroundColor: colors.darkCard },
  galleryThumb: { width: '100%', height: '100%' },

  content: { padding: spacing.xl },
  title: { color: colors.white, fontSize: 26, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: colors.silver, fontSize: 13, lineHeight: 20, marginBottom: 20 },

  priceCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.primaryBorder, padding: 18, marginBottom: 16 },
  priceLabel: { color: colors.silver, marginBottom: 8, fontSize: 12 },
  priceValue: { color: colors.primary, fontSize: 30, fontWeight: '900' },

  detailsCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 16, ...shadows.card },
  detailRow: { marginBottom: 14 },
  detailLabel: { color: colors.silver, fontSize: 12, marginBottom: 5 },
  detailValue: { color: colors.white, fontSize: 14, fontWeight: '700' },
  sectionTitle: { color: colors.white, fontWeight: '900', fontSize: 16, marginBottom: 10 },
  description: { color: colors.silverLight, fontSize: 14, lineHeight: 22 },

  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 16 },
  sellerAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primaryGlow, justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden' },
  sellerAvatarImage: { width: '100%', height: '100%' },
  sellerAvatarText: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  sellerCopy: { flex: 1 },
  sellerLabel: { color: colors.silver, fontSize: 12, marginBottom: 6 },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  sellerName: { color: colors.white, fontWeight: '900', fontSize: 18 },
  tierBadge: { backgroundColor: colors.primaryGlow, borderRadius: radius.full, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: 10, paddingVertical: 5 },
  tierBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  sellerHint: { color: colors.silverLight, fontSize: 12 },
  sellerActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 12 },
  sellerWhatsappBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerWhatsappIcon: { color: colors.white, fontSize: 18 },
  sellerCallBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.metal,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerCallIcon: { color: colors.white, fontSize: 18 },
  shareCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 16, ...shadows.card },
  shareTitle: { color: colors.white, fontSize: 16, fontWeight: '900', marginBottom: 6 },
  shareSubtitle: { color: colors.silver, fontSize: 12, lineHeight: 20, marginBottom: 14 },
  shareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shareChip: { width: '47%', backgroundColor: colors.metal, borderRadius: radius.full, borderWidth: 1, borderColor: colors.metalBorder, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  shareChipText: { color: colors.white, fontSize: 13, fontWeight: '800' },

  // Lightbox
  lightbox: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  lightboxPager: { width: '100%', height: '100%' },
  closeBtn: { position: 'absolute', top: 24, right: 20, zIndex: 10 },
  closeBtnBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  closeText: { color: colors.white, fontSize: 20 },
  lightboxImgWrap: { height: '100%', justifyContent: 'center', alignItems: 'center' },
  lightboxImg: { width: '100%', height: '100%' },
  lightboxNav: { position: 'absolute', bottom: 24, flexDirection: 'row', alignItems: 'center', gap: 20 },
  navBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  navText: { color: colors.white, fontSize: 20 },
  lightboxCount: { color: colors.white, fontSize: 14, fontWeight: '600' },
});