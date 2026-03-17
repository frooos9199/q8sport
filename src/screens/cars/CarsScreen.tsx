import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Linking } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../lib/theme';
import { t } from '../i18n';
import { Car, CAR_BRANDS } from '../types';

export default function CarsScreen({ navigation }: any) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = firestore().collection('cars').orderBy('createdAt', 'desc').onSnapshot(snap => {
      setCars(snap.docs.map(d => ({ id: d.id, ...d.data() } as Car)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = cars.filter(c =>
    c.title.ar.includes(search) || c.title.en?.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase()) || c.model.toLowerCase().includes(search.toLowerCase())
  );

  const openWhatsApp = (phone: string, msg: string) => {
    Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`);
  };

  const renderItem = ({ item }: { item: Car }) => (
    <TouchableOpacity style={s.card} onPress={() => navigation.navigate('CarDetails', { id: item.id })}>
      <View style={s.row}>
        {item.images?.[0] ? (
          <Image source={{ uri: item.images[0] }} style={s.img} />
        ) : (
          <View style={[s.img, s.placeholder]}><Text style={{ fontSize: 28 }}>🏎️</Text></View>
        )}
        <View style={s.info}>
          <Text style={s.title} numberOfLines={1}>{item.title.ar}</Text>
          <Text style={s.sub}>{item.brand} • {item.model} • {item.year}</Text>
          <View style={s.bottom}>
            <Text style={s.price}>{item.price.toLocaleString()} <Text style={s.kwd}>{t('kwd')}</Text></Text>
            <View style={s.badges}>
              {item.status === 'sold' && <View style={s.soldBadge}><Text style={s.soldBadgeText}>{t('sold')}</Text></View>}
              <TouchableOpacity style={s.waSmall} onPress={() => openWhatsApp(item.userWhatsapp, `مرحبا، أبي أستفسر عن: ${item.title.ar}`)}>
                <Text style={{ fontSize: 14 }}>💬</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <TextInput style={s.search} placeholder={t('search')} placeholderTextColor={colors.silver + '60'} value={search} onChangeText={setSearch} />
      {loading ? (
        <Text style={s.empty}>{t('loading')}</Text>
      ) : (
        <FlatList data={filtered} renderItem={renderItem} keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16 }} ListEmptyComponent={<Text style={s.empty}>{t('noResults')}</Text>} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  search: { backgroundColor: colors.metal, margin: 16, marginBottom: 0, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: colors.white, borderWidth: 1, borderColor: colors.metalLight },
  card: { backgroundColor: colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: colors.metal, marginBottom: 12, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  img: { width: 110, height: 100 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  title: { color: colors.white, fontWeight: '700', fontSize: 15 },
  sub: { color: colors.silver, fontSize: 11, opacity: 0.6 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: colors.primary, fontWeight: '900', fontSize: 16 },
  kwd: { color: colors.silver, fontSize: 10, fontWeight: '400' },
  badges: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  soldBadge: { backgroundColor: colors.primary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  soldBadgeText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  waSmall: { backgroundColor: colors.whatsapp, width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.silver, textAlign: 'center', padding: 40 },
});
