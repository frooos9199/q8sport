import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Animated, RefreshControl, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { db } from '../../lib/firebase';
import { orderByChild, query, ref as dbRef } from '@react-native-firebase/database';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { sortListingsByFreshnessAndStatus } from '../../lib/listingSort';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { Request } from '../../types';

export default function RequestsScreen({ navigation }: any) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const requestsQuery = query(dbRef(db, 'requests'), orderByChild('createdAt'));
      const snap = await getDbSnapshot(requestsQuery, 'requests');
      const data: Request[] = [];
      snap.forEach((child: any) => { data.push({ id: child.key, ...child.val() }); return undefined; });
      setRequests(sortListingsByFreshnessAndStatus(data));
    } catch (e) {
      console.log('Error:', e);
    }
    setLoading(false);
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

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }).start();
  }, []);

  const catIcon = item.category === 'car' ? '🏎️' : item.category === 'part' ? '⚙️' : '📦';

  return (
    <Animated.View style={[s.card, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={s.cardImage} />
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
          onPress={() => navigation.navigate('SellerProfile', { sellerId: item.userId, sellerName: item.userName, sellerWhatsapp: item.userWhatsapp })}
        >
          <View style={s.userAvatar}><Text style={s.userAvatarText}>{item.userName?.[0] || '?'}</Text></View>
          <Text style={s.userName}>{item.userName}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.waBtn}
          activeOpacity={0.85}
          onPress={() => Linking.openURL(`https://wa.me/${item.userWhatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحبا، بخصوص طلبك: ${item.title?.ar}`)}`)}
        >
          <Text style={s.waBtnText}>💬 تواصل</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },

  card: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 14, ...shadows.card },
  cardImage: { width: '100%', height: 170, borderRadius: radius.lg, marginBottom: 14 },
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

  budgetWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryGlow, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, marginBottom: 14, alignSelf: 'flex-start' },
  budgetLabel: { color: colors.silver, fontSize: 12 },
  budgetValue: { color: colors.primary, fontWeight: '800', fontSize: 14 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.metalBorder, paddingTop: 14 },
  userWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  userName: { color: colors.silver, fontSize: 12 },
  waBtn: { backgroundColor: colors.whatsapp, paddingVertical: 9, paddingHorizontal: 18, borderRadius: radius.md },
  waBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },

  emptyWrap: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: colors.silver, fontSize: 15 },
});
