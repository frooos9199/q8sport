import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Linking, Animated, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { db } from '../../lib/firebase';
import { get, orderByChild, query, ref as dbRef } from '@react-native-firebase/database';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { Part } from '../../types';

export default function PartsScreen({ navigation }: any) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchParts = async () => {
    try {
      const partsQuery = query(dbRef(db, 'parts'), orderByChild('createdAt'));
      const snap = await get(partsQuery);
      const data: Part[] = [];
      snap.forEach((child: any) => { data.unshift({ id: child.key, ...child.val() }); return undefined; });
      setParts(data);
    } catch (e) {
      console.log('Error:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchParts(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetchParts(); setRefreshing(false); };

  const filtered = parts.filter(p =>
    p.title?.ar?.includes(search) || p.title?.en?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item, index }: { item: Part; index: number }) => (
    <AnimatedPartCard item={item} index={index} navigation={navigation} />
  );

  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput style={s.search} placeholder={t('search')} placeholderTextColor={colors.silver + '50'} value={search} onChangeText={setSearch} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}><Text style={s.clearText}>✕</Text></TouchableOpacity>
        )}
      </View>

      {!loading && <Text style={s.count}>{filtered.length} {t('parts')}</Text>}

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        ListEmptyComponent={
          loading ? null : (
            <View style={s.emptyWrap}><Text style={s.emptyIcon}>⚙️</Text><Text style={s.emptyText}>{t('noResults')}</Text></View>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function AnimatedPartCard({ item, index, navigation }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[s.cardWrap, { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PartDetails', { id: item.id })}
      >
        <View style={s.imgWrap}>
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={s.img} />
          ) : (
            <View style={[s.img, s.placeholder]}><Text style={{ fontSize: 30 }}>⚙️</Text></View>
          )}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={s.imgGradient} />
          <View style={[s.condBadge, { backgroundColor: item.condition === 'new' ? colors.green : colors.yellow }]}>
            <Text style={s.condText}>{item.condition === 'new' ? t('new') : t('used')}</Text>
          </View>
        </View>
        <View style={s.info}>
          <Text style={s.title} numberOfLines={2}>{item.title?.ar}</Text>
          <Text style={s.price}>{item.price?.toLocaleString()} {t('kwd')}</Text>
          <TouchableOpacity
            style={s.waBtn}
            onPress={() => Linking.openURL(`https://wa.me/${item.userWhatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحبا، أبي أستفسر عن: ${item.title?.ar}`)}`)}
          >
            <Text style={s.waBtnText}>💬 تواصل</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.darkCard, margin: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.metalBorder, paddingHorizontal: spacing.lg },
  searchIcon: { fontSize: 16, marginRight: 8 },
  search: { flex: 1, paddingVertical: 14, color: colors.white, fontSize: 15 },
  clearText: { color: colors.silver, fontSize: 16, padding: 6 },
  count: { color: colors.silver, fontSize: 12, paddingHorizontal: spacing.xl, marginBottom: 4 },

  cardWrap: { flex: 1 },
  card: { backgroundColor: colors.darkCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.metalBorder, overflow: 'hidden', marginBottom: 12, ...shadows.card },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 130 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  imgGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 },
  condBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  condText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  info: { padding: 12 },
  title: { color: colors.white, fontWeight: '700', fontSize: 13, marginBottom: 6, lineHeight: 18 },
  price: { color: colors.primary, fontWeight: '900', fontSize: 16, marginBottom: 10 },
  waBtn: { backgroundColor: colors.whatsapp, paddingVertical: 9, borderRadius: radius.sm, alignItems: 'center' },
  waBtnText: { color: colors.white, fontWeight: '700', fontSize: 12 },

  emptyWrap: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: colors.silver, fontSize: 15 },
});
