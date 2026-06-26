import React, { useEffect, useState, useRef } from 'react';
import { Alert, View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Animated, RefreshControl } from 'react-native';
import { formatListingPublishedAt } from '../../lib/listingDate';
import { getListingThumbnailUrl } from '../../lib/listingImages';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { getLocale, t } from '../../i18n';
import { Request } from '../../types';
import { fetchSortedListings, prefetchListingImages } from '../../lib/listingFeed';
import FastAdImage from '../../components/FastAdImage';
import LazyImage from '../../components/LazyImage';
import { toWaMeDigits } from '../../lib/gccPhone';
import { getPublishedListingUrl } from '../../lib/publishedSite';
import { getBoostedListingViews } from '../../lib/listingViews';

const INITIAL_VISIBLE_REQUESTS = 10;
const INITIAL_REQUEST_IMAGE_PREFETCH = 4;
const REQUEST_CARD_IMAGE_ASPECT_RATIO = 16 / 10;

export default function RequestsScreen({ navigation }: any) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const initialRequests = await fetchSortedListings<Request>('requests', INITIAL_VISIBLE_REQUESTS);
      setRequests(initialRequests);
      await prefetchListingImages(initialRequests, INITIAL_REQUEST_IMAGE_PREFETCH);
      setLoading(false);

      const fullRequests = await fetchSortedListings<Request>('requests');
      setRequests(currentRequests => (fullRequests.length > currentRequests.length ? fullRequests : currentRequests));
    } catch (e) {
      console.log('Error:', e);
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetchRequests(); setRefreshing(false); };

  const renderItem = ({ item, index }: { item: Request; index: number }) => (
    <AnimatedRequestCard item={item} index={index} navigation={navigation} />
  );

  return (
    <View style={s.container}>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        ListEmptyComponent={
          loading ? null : (
            <View style={s.emptyWrap}><Text style={s.emptyIcon}>📋</Text><Text style={s.emptyText}>{t('noResults')}</Text></View>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function AnimatedRequestCard({ item, index, navigation }: { item: Request; index: number; navigation: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  const previewImage = getListingThumbnailUrl(item);
  const publishedAt = formatListingPublishedAt(item.createdAt);
  const whatsappDigits = toWaMeDigits(String(item.userWhatsapp || ''));
  const phoneDigits = String(item.userPhone || '').replace(/[^0-9]/g, '');

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }).start();
  }, [anim, index]);

  const catIcon = item.category === 'car' ? '🏎️' : item.category === 'part' ? '⚙️' : '📦';

  return (
    <Animated.View style={[s.card, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      {previewImage ? (
        <View style={s.cardImageWrap}>
          <FastAdImage uri={previewImage} style={s.cardImage} placeholderColor={colors.darkLight} />
        </View>
      ) : null}
      <View style={s.cardHeader}>
        <View style={[s.badge, item.status === 'open' ? s.openBg : s.closedBg]}>
          <View style={[s.badgeDot, { backgroundColor: item.status === 'open' ? colors.green : colors.primary }]} />
          <Text style={[s.badgeText, { color: item.status === 'open' ? colors.green : colors.primary }]}>
            {item.status === 'open' ? t('open') : t('closed')}
          </Text>
        </View>
        <View style={s.catBadge}><Text style={s.catIcon}>{catIcon}</Text></View>
      </View>

      <Text style={s.title}>{item.title?.ar}</Text>
      <Text style={s.desc} numberOfLines={2}>{item.description?.ar}</Text>
      {publishedAt ? <Text style={s.metaText}>{t('publishedOn')}: {publishedAt}</Text> : null}

      {item.budget && (
        <View style={s.budgetWrap}>
          <Text style={s.budgetLabel}>{t('budget')}</Text>
          <Text style={s.budgetValue}>{item.budget.toLocaleString()} {t('kwd')}</Text>
        </View>
      )}

      <View style={s.footer}>
        <TouchableOpacity
          style={s.userWrap}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SellerProfile', { sellerId: item.userId, sellerName: item.userName, sellerWhatsapp: item.userWhatsapp, sellerPhone: item.userPhone })}
        >
          <View style={s.userAvatar}>
            {item.userAvatar ? (
              <LazyImage uri={item.userAvatar} style={s.userAvatarImage} fallback={<Text style={s.userAvatarText}>{item.userName?.[0] || '?'}</Text>} />
            ) : (
              <Text style={s.userAvatarText}>{item.userName?.[0] || '?'}</Text>
            )}
          </View>
          <Text style={s.userName}>{item.userName}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.waBtn}
          activeOpacity={0.85}
          onPress={() => {
            if (whatsappDigits) {
              const locale = getLocale();
              const title = (locale === 'en' ? item.title?.en : item.title?.ar) || item.title?.ar || item.title?.en || '';
                    const requestUrl = getPublishedListingUrl('wanted', item.id);
              const message = `${t('askAboutRequestShortMsg', { title })}\n${requestUrl}`.trim();
              Linking.openURL(`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`);
              return;
            }
            if (phoneDigits) {
              Linking.openURL(`tel:${phoneDigits}`);
              return;
            }
            Alert.alert(t('warningTitle'), t('noWhatsappForListingMsg'));
          }}
        >
          <Text style={s.waBtnText}>{whatsappDigits ? `💬 ${t('contactWhatsapp')}` : `📞 ${t('callLabel')}`}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },

  card: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 14, ...shadows.card },
  cardImageWrap: { marginBottom: 14, position: 'relative' },
  cardImage: { width: '100%', aspectRatio: REQUEST_CARD_IMAGE_ASPECT_RATIO, borderRadius: radius.lg },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  openBg: { backgroundColor: colors.greenGlow },
  closedBg: { backgroundColor: colors.primaryGlow },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  catBadge: { backgroundColor: colors.metal, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  catIcon: { fontSize: 16 },

  title: { color: colors.white, fontWeight: '800', fontSize: 18, marginBottom: 6 },
  desc: { color: colors.silver, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  metaText: { color: colors.silverLight, fontSize: 11, marginBottom: 12 },

  budgetWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryGlow, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, marginBottom: 14, alignSelf: 'flex-start' },
  budgetLabel: { color: colors.silver, fontSize: 12 },
  budgetValue: { color: colors.primary, fontWeight: '800', fontSize: 14 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.metalBorder, paddingTop: 14 },
  userWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  userAvatarImage: { width: '100%', height: '100%' },
  userAvatarText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  userName: { color: colors.silver, fontSize: 12 },
  waBtn: { backgroundColor: colors.whatsapp, paddingVertical: 9, paddingHorizontal: 18, borderRadius: radius.md },
  waBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },

  emptyWrap: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: colors.silver, fontSize: 15 },
});
