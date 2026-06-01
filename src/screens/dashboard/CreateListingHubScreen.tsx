import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';

export default function CreateListingHubScreen({ navigation }: any) {
  const cards = [
    {
      key: 'car',
      title: t('hubCarTitle'),
      subtitle: t('hubCarSub'),
      icon: '🏎️',
      colors: colors.gradient.primary as string[],
      onPress: () => navigation.navigate('CreateCar'),
    },
    {
      key: 'part',
      title: t('hubPartTitle'),
      subtitle: t('hubPartSub'),
      icon: '⚙️',
      colors: [colors.metalLight, colors.metal],
      onPress: () => navigation.navigate('CreatePart'),
    },
    {
      key: 'request',
      title: t('hubRequestTitle'),
      subtitle: t('hubRequestSub'),
      icon: '🔥',
      colors: [colors.green, colors.whatsappDark],
      onPress: () => navigation.navigate('CreateRequest'),
    },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.heroCard}>
        <Text style={s.heroTitle}>{t('hubHeroTitle')}</Text>
        <Text style={s.heroSub}>{t('hubHeroSub')}</Text>
      </View>

      {cards.map(card => (
        <TouchableOpacity key={card.key} activeOpacity={0.9} onPress={card.onPress} style={s.cardTouch}>
          <View style={s.card}>
            <LinearGradient colors={card.colors as [string, string]} style={s.cardFill} />
            <View style={s.cardHeader}>
              <Text style={s.cardIcon}>{card.icon}</Text>
              <Text style={s.cardArrow}>←</Text>
            </View>
            <Text style={s.cardTitle}>{card.title}</Text>
            <Text style={s.cardSub}>{card.subtitle}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  content: { padding: spacing.xl },
  heroCard: {
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.xxl,
    padding: 20,
    marginBottom: 18,
  },
  heroTitle: { color: colors.white, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  heroSub: { color: colors.silverLight, lineHeight: 22, fontSize: 14 },
  cardTouch: { marginBottom: 14, borderRadius: radius.xxl, overflow: 'hidden' },
  card: { minHeight: 160, borderRadius: radius.xxl, overflow: 'hidden', ...shadows.card },
  cardFill: { ...StyleSheet.absoluteFillObject },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  cardIcon: { fontSize: 28 },
  cardArrow: { color: colors.white, fontSize: 22, fontWeight: '700' },
  cardTitle: { color: colors.white, fontSize: 24, fontWeight: '900', paddingHorizontal: 20, marginBottom: 8 },
  cardSub: { color: colors.white, opacity: 0.88, fontSize: 14, lineHeight: 22, paddingHorizontal: 20, paddingBottom: 20 },
});
