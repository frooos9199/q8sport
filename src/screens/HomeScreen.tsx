import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList, Image, Linking } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../lib/theme';
import { t } from '../i18n';
import { Car, Part } from '../types';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [carsSnap, partsSnap] = await Promise.all([
        firestore().collection('cars').orderBy('createdAt', 'desc').limit(6).get(),
        firestore().collection('parts').orderBy('createdAt', 'desc').limit(6).get(),
      ]);
      setCars(carsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Car)));
      setParts(partsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Part)));
      setLoading(false);
    };
    fetchData();
  }, []);

  const openWhatsApp = (phone: string, msg: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`);
  };

  const renderCarCard = ({ item }: { item: Car }) => (
    <TouchableOpacity style={s.carCard} onPress={() => navigation.navigate('CarDetails', { id: item.id })}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={s.carImage} />
      ) : (
        <View style={[s.carImage, s.placeholder]}><Text style={{ fontSize: 40 }}>🏎️</Text></View>
      )}
      {item.status === 'sold' && (
        <View style={s.soldOverlay}><Text style={s.soldText}>{t('sold')}</Text></View>
      )}
      <View style={s.yearBadge}><Text style={s.yearText}>{item.year}</Text></View>
      <View style={s.carInfo}>
        <Text style={s.carTitle} numberOfLines={1}>{item.title.ar}</Text>
        <Text style={s.carSub}>{item.brand} • {item.model}</Text>
        <View style={s.carBottom}>
          <Text style={s.carPrice}>{item.price.toLocaleString()} <Text style={s.carKwd}>{t('kwd')}</Text></Text>
          <TouchableOpacity style={s.waBtn} onPress={() => openWhatsApp(item.userWhatsapp, `مرحبا، أبي أستفسر عن: ${item.title.ar}`)}>
            <Text style={s.waBtnText}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPartCard = ({ item }: { item: Part }) => (
    <TouchableOpacity style={s.partCard} onPress={() => navigation.navigate('PartDetails', { id: item.id })}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={s.partImage} />
      ) : (
        <View style={[s.partImage, s.placeholder]}><Text style={{ fontSize: 30 }}>⚙️</Text></View>
      )}
      <View style={s.partInfo}>
        <Text style={s.partTitle} numberOfLines={1}>{item.title.ar}</Text>
        <Text style={s.partPrice}>{item.price.toLocaleString()} {t('kwd')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroLogo}><Text style={s.heroQ8}>Q8</Text> SPORT CAR</Text>
        <View style={s.heroLine} />
        <Text style={s.heroTitle}>{t('hero')}</Text>
        <Text style={s.heroSub}>{t('heroSub')}</Text>
        <View style={s.heroBtns}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('CarsTab')}>
            <Text style={s.btnText}>🏎️ {t('cars')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate('PartsTab')}>
            <Text style={s.btnSecText}>⚙️ {t('parts')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cars */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>🏎️ {t('cars')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CarsTab')}>
            <Text style={s.viewAll}>{t('all')} ←</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <Text style={s.loadingText}>{t('loading')}</Text>
        ) : cars.length === 0 ? (
          <Text style={s.emptyText}>{t('noResults')}</Text>
        ) : (
          <FlatList data={cars} renderItem={renderCarCard} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }} />
        )}
      </View>

      {/* Parts */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>⚙️ {t('parts')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PartsTab')}>
            <Text style={s.viewAll}>{t('all')} ←</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <Text style={s.loadingText}>{t('loading')}</Text>
        ) : parts.length === 0 ? (
          <Text style={s.emptyText}>{t('noResults')}</Text>
        ) : (
          <FlatList data={parts} renderItem={renderPartCard} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }} />
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  hero: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, alignItems: 'center' },
  heroLogo: { fontSize: 32, fontWeight: '900', color: colors.white },
  heroQ8: { color: colors.primary },
  heroLine: { width: 60, height: 3, backgroundColor: colors.primary, borderRadius: 2, marginVertical: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.white, textAlign: 'center', marginBottom: 8 },
  heroSub: { fontSize: 14, color: colors.silver, textAlign: 'center', marginBottom: 24 },
  heroBtns: { flexDirection: 'row', gap: 12 },
  btnPrimary: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  btnSecondary: { backgroundColor: colors.metal, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, borderWidth: 1, borderColor: colors.metalLight },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  btnSecText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.white },
  viewAll: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  loadingText: { color: colors.silver, textAlign: 'center', padding: 40 },
  emptyText: { color: colors.silver, textAlign: 'center', padding: 40 },
  carCard: { width: width * 0.7, marginRight: 12, backgroundColor: colors.darkCard, borderRadius: 16, borderWidth: 1, borderColor: colors.metal, overflow: 'hidden' },
  carImage: { width: '100%', height: 160 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  soldOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  soldText: { color: colors.primary, fontSize: 24, fontWeight: '900' },
  yearBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  yearText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  carInfo: { padding: 12 },
  carTitle: { color: colors.white, fontWeight: '700', fontSize: 16, marginBottom: 2 },
  carSub: { color: colors.silver, fontSize: 12, marginBottom: 10, opacity: 0.6 },
  carBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carPrice: { color: colors.primary, fontWeight: '900', fontSize: 18 },
  carKwd: { color: colors.silver, fontSize: 11, fontWeight: '400' },
  waBtn: { backgroundColor: colors.whatsapp, width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  waBtnText: { fontSize: 18 },
  partCard: { width: width * 0.4, marginRight: 12, backgroundColor: colors.darkCard, borderRadius: 14, borderWidth: 1, borderColor: colors.metal, overflow: 'hidden' },
  partImage: { width: '100%', height: 110 },
  partInfo: { padding: 10 },
  partTitle: { color: colors.white, fontWeight: '700', fontSize: 13, marginBottom: 4 },
  partPrice: { color: colors.primary, fontWeight: '800', fontSize: 15 },
});
