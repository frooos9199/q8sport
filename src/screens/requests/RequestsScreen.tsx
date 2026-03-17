import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../lib/theme';
import { t } from '../i18n';
import { Request } from '../types';

export default function RequestsScreen() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = firestore().collection('requests').orderBy('createdAt', 'desc').onSnapshot(snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as Request)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const renderItem = ({ item }: { item: Request }) => (
    <View style={s.card}>
      <View style={s.header}>
        <View style={[s.badge, item.status === 'open' ? s.openBg : s.closedBg]}>
          <Text style={[s.badgeText, { color: item.status === 'open' ? colors.green : colors.primary }]}>
            {item.status === 'open' ? t('open') : t('closed')}
          </Text>
        </View>
        <Text style={s.cat}>
          {item.category === 'car' ? '🏎️' : item.category === 'part' ? '⚙️' : '📦'}
        </Text>
      </View>
      <Text style={s.title}>{item.title.ar}</Text>
      <Text style={s.desc} numberOfLines={2}>{item.description.ar}</Text>
      {item.budget && <Text style={s.budget}>{t('budget')}: {item.budget.toLocaleString()} {t('kwd')}</Text>}
      <View style={s.footer}>
        <Text style={s.user}>{item.userName}</Text>
        <TouchableOpacity style={s.waBtn} onPress={() => Linking.openURL(`https://wa.me/${item.userWhatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحبا، بخصوص طلبك: ${item.title.ar}`)}`)}>
          <Text style={s.waBtnText}>💬 {t('contactWhatsapp')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      {loading ? (
        <Text style={s.empty}>{t('loading')}</Text>
      ) : (
        <FlatList data={requests} renderItem={renderItem} keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16 }} ListEmptyComponent={<Text style={s.empty}>{t('noResults')}</Text>} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  card: { backgroundColor: colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: colors.metal, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  openBg: { backgroundColor: '#22C55E20' },
  closedBg: { backgroundColor: colors.primary + '20' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cat: { fontSize: 16 },
  title: { color: colors.white, fontWeight: '700', fontSize: 17, marginBottom: 4 },
  desc: { color: colors.silver, fontSize: 13, opacity: 0.6, marginBottom: 8, lineHeight: 20 },
  budget: { color: colors.primary, fontWeight: '700', marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.metal, paddingTop: 12 },
  user: { color: colors.silver, fontSize: 12, opacity: 0.5 },
  waBtn: { backgroundColor: colors.whatsapp, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  waBtnText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  empty: { color: colors.silver, textAlign: 'center', padding: 40 },
});
