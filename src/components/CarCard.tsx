import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radius, shadows, spacing } from '../lib/theme';
import { t } from '../i18n';
import { Car } from '../types';
import { formatListingPublishedAt } from '../lib/listingDate';
import FastAdImage from './FastAdImage';
import { getListingThumbnailUrl } from '../lib/listingImages';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface Props {
  car: Car;
  onPress: () => void;
  onWhatsApp: () => void;
}

export default function CarCard({ car, onPress, onWhatsApp }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const publishedAt = formatListingPublishedAt(car.createdAt);
  const thumbnailUrl = getListingThumbnailUrl(car);
  const isFeatured = Number(car.featuredAt || 0) > 0;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  return (
    <Animated.View style={[s.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[s.card, isFeatured ? s.cardFeatured : null]}
      >
        <View style={s.imgWrap}>
          {thumbnailUrl ? (
            <FastAdImage uri={thumbnailUrl} style={s.img} fallback={<Text style={{ fontSize: 50 }}>🏎️</Text>} />
          ) : (
            <View style={[s.img, s.placeholder]}><Text style={{ fontSize: 50 }}>🏎️</Text></View>
          )}
          <LinearGradient colors={['transparent', 'transparent']} style={s.gradient} />
          <View pointerEvents="none" style={s.viewsBadge}>
            <Text style={s.viewsText}>👁 {Number(car.views || 0).toLocaleString()}</Text>
          </View>
          {isFeatured ? (
            <View pointerEvents="none" style={s.featureBadge}>
              <Text style={s.featureBadgeText} numberOfLines={1}>{t('featuredAdLabel')}</Text>
            </View>
          ) : null}
          <View style={s.yearBadge}>
            <Text style={s.yearText}>{car.year}</Text>
          </View>
          {car.status === 'sold' && (
            <View style={s.soldOverlay}>
              <View style={s.soldBadge}><Text style={s.soldText}>{t('sold')}</Text></View>
            </View>
          )}
        </View>

        <View style={s.info}>
          <Text style={s.title} numberOfLines={1}>{car.title.ar}</Text>
          <Text style={s.sub}>{car.brand} • {car.model}</Text>
          {publishedAt ? <Text style={s.publishedAtText}>{t('publishedOn')}: {publishedAt}</Text> : null}
          <View style={s.bottom}>
            <View>
              <Text style={s.price}>{car.price?.toLocaleString()}</Text>
              <Text style={s.kwd}>{t('kwd')}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.88} style={s.waActionBtn} onPress={onWhatsApp}>
              <View style={s.waIconWrap}>
                <Text style={s.waBtnIcon}>💬</Text>
              </View>
              <Text style={s.waBtnText}>{t('contactWhatsapp')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrapper: { width: CARD_WIDTH, marginRight: 14 },
  card: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, ...shadows.card },
  cardFeatured: { borderColor: colors.gold, borderWidth: 2 },
  imgWrap: { position: 'relative', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden' },
  img: { width: '100%', height: 190 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  viewsBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  viewsText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  featureBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  yearBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  yearText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  waActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderRadius: radius.full,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
  },
  soldOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  soldBadge: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: radius.md },
  soldText: { color: colors.white, fontSize: 18, fontWeight: '900' },
  info: { padding: spacing.lg },
  title: { color: colors.white, fontWeight: '800', fontSize: 17, marginBottom: 3 },
  sub: { color: colors.silver, fontSize: 12, marginBottom: spacing.md },
  publishedAtText: { color: colors.silverLight, fontSize: 11, marginBottom: spacing.md },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: colors.primary, fontWeight: '900', fontSize: 22 },
  kwd: { color: colors.silver, fontSize: 11 },
  waIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 211, 102, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waBtnIcon: { fontSize: 15 },
  waBtnText: { color: colors.white, fontSize: 12, fontWeight: '800' },
});
