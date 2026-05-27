import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import LazyImage from './LazyImage';
import { colors, radius, shadows, spacing } from '../lib/theme';
import { BannerAd } from '../types';

type SponsoredBannerCardProps = {
  banner: BannerAd;
};

export default function SponsoredBannerCard({ banner }: SponsoredBannerCardProps) {
  const openBannerTarget = React.useCallback(async () => {
    if (!banner.targetUrl) {
      return;
    }

    try {
      const supported = await Linking.canOpenURL(banner.targetUrl);

      if (!supported) {
        Alert.alert('الرابط غير صالح', 'تعذر فتح الرابط المرفق مع هذا الإعلان.');
        return;
      }

      await Linking.openURL(banner.targetUrl);
    } catch {
      Alert.alert('تعذر فتح الإعلان', 'حاول مرة ثانية بعد قليل.');
    }
  }, [banner.targetUrl]);

  return (
    <TouchableOpacity
      style={[styles.card, !banner.targetUrl && styles.cardStatic]}
      activeOpacity={banner.targetUrl ? 0.92 : 1}
      disabled={!banner.targetUrl}
      onPress={openBannerTarget}
    >
      <View style={styles.imageFrame}>
        <LazyImage uri={banner.imageUrl} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>مساحة إعلانية</Text></View>
          <Text style={styles.orderText}>أولوية {banner.sortOrder || 0}</Text>
        </View>
        {banner.title?.trim() ? <Text style={styles.title} numberOfLines={2}>{banner.title}</Text> : null}
        <Text style={styles.subtext} numberOfLines={1}>{banner.targetUrl ? 'اضغط لفتح العرض' : 'إعلان ممول داخل السوق'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(227,30,36,0.3)',
    overflow: 'hidden',
    ...shadows.card,
  },
  cardStatic: {
    borderColor: colors.metalBorder,
  },
  imageFrame: {
    margin: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.darkLight,
  },
  image: {
    width: '100%',
    aspectRatio: 2.2,
    backgroundColor: colors.darkLight,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  orderText: {
    color: colors.silver,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
    lineHeight: 21,
  },
  subtext: {
    color: colors.silver,
    fontSize: 12,
    textAlign: 'right',
  },
});