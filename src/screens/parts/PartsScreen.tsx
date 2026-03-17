import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Linking } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../lib/theme';
import { t } from '../i18n';
import { Part } from '../types';

export default function PartsScreen({ navigation }: any) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = firestore().collection('parts').orderBy('createdAt', 'desc').onSnapshot(snap => {
      setParts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Part)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = parts.filter(p =>
    p.title.ar.includes(search) || p.title.en?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Part }) => (
    <TouchableOpacity style={s.card} onPress={() => navigation.navigate('PartDetails', { id: item.id })}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={s.img} />
      ) : (
        <View style={[s.img, s.placeholder]}><Text style={{ fontSize: 28 }}>⚙️</Text></View>
      )}
      <View style={s.condBadge}>
        <Text style={[s.condText, { color: item.condition === 'new' ? colors.green : colors.yellow }]}>
          {item.condition === 'new' ? t('new') : t('used')}
        </Text>
      </View>
      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>{item.title.ar}</Text>
        <Text style={s.price}>{item.price.toLocaleString()} {t('kwd')}</Text>
        <TouchableOpacity style={s.waBtn} onPress={() => Linking.openURL(`https://wa.me/${item.userWhatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحبا، أبي أستفسر عن: ${item.title.ar}`)}`)}>
          <Text style={s.waBtnText}>💬 {t('contactWhatsapp')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <TextInput style={s.search} placeholder={t('search')} placeholderTextColor={colors.silver + '60'} value={search} onChangeText={setSearch} />
      {loading ? (
        <Text style={s.empty}>{t('loading')}</Text>
      ) : (
        <FlatList data={filtered} renderItem={renderItem} keyExtractor={i => i.id} numColumns={2} columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 16 }} ListEmptyComponent={<Text style={s.empty}>{t('noResults')}</Text>} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  search: { backgroundColor: colors.metal, margin: 16, marginBottom: 0, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: colors.white, borderWidth: 1, borderColor: colors.metalLight },
  card: { flex: 1, backgroundColor: colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: colors.metal, overflow: 'hidden', marginBottom: 12 },
  img: { width: '100%', height: 120 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  condBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  condText: { fontSize: 10, fontWeight: '700' },
  info: { padding: 10 },
  title: { color: colors.white, fontWeight: '700', fontSize: 13, marginBottom: 4 },
  price: { color: colors.primary, fontWeight: '800', fontSize: 15, marginBottom: 8 },
  waBtn: { backgroundColor: colors.whatsapp, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  waBtnText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  empty: { color: colors.silver, textAlign: 'center', padding: 40 },
});
