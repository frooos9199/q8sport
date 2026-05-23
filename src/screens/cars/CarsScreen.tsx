import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Linking, Animated, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { db } from '../../lib/firebase';
import { get, orderByChild, query, ref as dbRef } from '@react-native-firebase/database';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { Car } from '../../types';
import { ListCardSkeleton } from '../../components/Shimmer';

export default function CarsScreen({ navigation }: any) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCars = async () => {
    try {
      const carsQuery = query(dbRef(db, 'cars'), orderByChild('createdAt'));
      const snap = await get(carsQuery);
      const data: Car[] = [];
      snap.forEach((child: any) => { data.unshift({ id: child.key, ...child.val() }); return undefined; });
      setCars(data);
    } catch (e) {
      console.log('Error:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCars(); }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchCars(); setRefreshing(false); };

  const filtered = cars.filter(c =>
    c.title?.ar?.includes(search) || c.title?.en?.toLowerCase().includes(search.toLowerCase()) ||
    c.brand?.toLowerCase().includes(search.toLowerCase()) || c.model?.toLowerCase().includes(search.toLowerCase())
  );

  const openWhatsApp = (phone: string, msg: string) => {
    Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`);
  };

  const renderItem = ({ item, index }: { item: Car; index: number }) => (
    <AnimatedCard item={item} index={index} navigation={navigation} openWhatsApp={openWhatsApp} />
  );

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.search}
          placeholder={t('search')}
          placeholderTextColor={colors.silver + '50'}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={s.clearBtn}>
            <Text style={s.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results count */}
      {!loading && (
        <View style={s.countRow}>
          <Text style={s.countText}>{filtered.length} {t('cars')}</Text>
        </View>
      )}

      {loading ? (
        <View style={{ padding: spacing.lg }}>
          {[1, 2, 3, 4].map(i => <ListCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>🏎️</Text>
              <Text style={s.emptyText}>{t('noResults')}</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function AnimatedCard({ item, index, navigation, openWhatsApp }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }).start();
  }, []);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }, { scale }] }}>
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CarDetails', { id: item.id })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={s.cardImgWrap}>
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={s.cardImg} />
          ) : (
            <View style={[s.cardImg, s.placeholder]}><Text style={{ fontSize: 32 }}>🏎️</Text></View>
          )}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={s.cardImgGradient} />
          <View style={s.cardYearBadge}><Text style={s.cardYearText}>{item.year}</Text></View>
          {item.status === 'sold' && (
            <View style={s.soldBadge}><Text style={s.soldText}>{t('sold')}</Text></View>
          )}
        </View>
        <View style={s.cardInfo}>
          <Text style={s.cardTitle} numberOfLines={1}>{item.title?.ar}</Text>
          <Text style={s.cardSub}>{item.brand} • {item.model}</Text>
          <View style={s.cardBottom}>
            <Text style={s.cardPrice}>{item.price?.toLocaleString()} <Text style={s.cardKwd}>{t('kwd')}</Text></Text>
            <View style={s.cardActions}>
              {item.mileage && <Text style={s.mileageText}>{item.mileage?.toLocaleString()} {t('km')}</Text>}
              <TouchableOpacity style={s.waSmall} onPress={() => openWhatsApp(item.userWhatsapp, `مرحبا، أبي أستفسر عن: ${item.title?.ar}`)}>
                <Text style={{ fontSize: 15 }}>💬</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  clearBtn: { padding: 6 },
  clearText: { color: colors.silver, fontSize: 16 },

  countRow: { paddingHorizontal: spacing.xl, marginBottom: 4 },
  countText: { color: colors.silver, fontSize: 12 },

  card: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, marginBottom: 14, overflow: 'hidden', ...shadows.card },
  cardImgWrap: { position: 'relative' },
  cardImg: { width: '100%', height: 180 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  cardImgGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  cardYearBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  cardYearText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  soldBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(227,30,36,0.9)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.sm },
  soldText: { color: colors.white, fontSize: 11, fontWeight: '800' },

  cardInfo: { padding: spacing.lg },
  cardTitle: { color: colors.white, fontWeight: '800', fontSize: 17, marginBottom: 3 },
  cardSub: { color: colors.silver, fontSize: 12, marginBottom: spacing.md },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { color: colors.primary, fontWeight: '900', fontSize: 20 },
  cardKwd: { color: colors.silver, fontSize: 11, fontWeight: '400' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mileageText: { color: colors.silver, fontSize: 11 },
  waSmall: { backgroundColor: colors.whatsapp, width: 34, height: 34, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },

  emptyWrap: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: colors.silver, fontSize: 15 },
});
