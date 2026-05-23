import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { get, ref as dbRef } from '@react-native-firebase/database';

import { db } from '../../lib/firebase';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { Part } from '../../types';
import { t } from '../../i18n';

export default function PartDetailsScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const snap = await get(dbRef(db, `parts/${id}`));
        if (mounted && snap.exists()) {
          setPart({ id: snap.key, ...snap.val() });
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
    const phone = part.userWhatsapp?.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(`مرحبا، عندي اهتمام بخصوص القطعة: ${part.title?.ar}`)}`);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={s.heroWrap}>
        {part.images?.[0] ? (
          <Image source={{ uri: part.images[0] }} style={s.heroImage} />
        ) : (
          <View style={[s.heroImage, s.placeholder]}>
            <Text style={s.placeholderIcon}>⚙️</Text>
          </View>
        )}
        <LinearGradient colors={['transparent', 'rgba(5,5,5,0.92)']} style={s.heroGradient} />
        <View style={s.conditionBadge}>
          <Text style={s.conditionText}>{part.condition === 'new' ? t('new') : t('used')}</Text>
        </View>
      </View>

      <View style={s.content}>
        <Text style={s.title}>{part.title?.ar}</Text>
        <Text style={s.subtitle}>{part.category || 'قطعة سبورت'}{part.compatibleBrands?.length ? ` • ${part.compatibleBrands.join(' • ')}` : ''}</Text>

        <View style={s.priceCard}>
          <Text style={s.priceLabel}>{t('price')}</Text>
          <Text style={s.priceValue}>{part.price?.toLocaleString()} {t('kwd')}</Text>
        </View>

        <View style={s.detailsCard}>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>الحالة</Text>
            <Text style={s.detailValue}>{part.condition === 'new' ? t('new') : t('used')}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>الحالة في السوق</Text>
            <Text style={s.detailValue}>{part.status === 'active' ? 'معروض الآن' : part.status === 'sold' ? t('sold') : t('pending')}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>التوافق</Text>
            <Text style={s.detailValue}>{part.compatibleBrands?.length ? part.compatibleBrands.join(' • ') : 'غير محدد'}</Text>
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
          onPress={() => navigation.navigate('SellerProfile', { sellerId: part.userId, sellerName: part.userName, sellerWhatsapp: part.userWhatsapp })}
        >
          <Text style={s.sellerLabel}>البائع</Text>
          <Text style={s.sellerName}>{part.userName}</Text>
          <Text style={s.sellerHint}>تواصل مباشر بدون وسيط • اضغط لعرض الملف</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.ctaButton} activeOpacity={0.88} onPress={contactSeller}>
          <LinearGradient colors={[colors.whatsapp, colors.whatsappDark]} style={s.ctaFill}>
            <Text style={s.ctaText}>💬 {t('contactWhatsapp')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.silver, fontSize: 15 },

  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 320, backgroundColor: colors.darkCard },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 56 },
  heroGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 140 },
  conditionBadge: { position: 'absolute', top: 18, left: 18, backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  conditionText: { color: colors.white, fontWeight: '900', fontSize: 12 },

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

  sellerCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 16 },
  sellerLabel: { color: colors.silver, fontSize: 12, marginBottom: 6 },
  sellerName: { color: colors.white, fontWeight: '900', fontSize: 18, marginBottom: 4 },
  sellerHint: { color: colors.silverLight, fontSize: 12 },

  ctaButton: { borderRadius: radius.lg, overflow: 'hidden' },
  ctaFill: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  ctaText: { color: colors.white, fontWeight: '900', fontSize: 16 },
});