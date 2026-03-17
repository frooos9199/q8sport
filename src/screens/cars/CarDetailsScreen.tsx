import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Linking, Modal } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../lib/theme';
import { t } from '../i18n';
import { Car } from '../types';

const { width } = Dimensions.get('window');

export default function CarDetailsScreen({ route }: any) {
  const { id } = route.params;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    firestore().collection('cars').doc(id).get().then(doc => {
      if (doc.exists) setCar({ id: doc.id, ...doc.data() } as Car);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <View style={s.center}><Text style={s.loadText}>{t('loading')}</Text></View>;
  if (!car) return <View style={s.center}><Text style={s.loadText}>{t('noResults')}</Text></View>;

  const openWhatsApp = () => {
    const phone = car.userWhatsapp.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(`مرحبا، أبي أستفسر عن: ${car.title.ar} - ${car.brand} ${car.model} ${car.year}`)}`);
  };

  const specs = [
    { icon: '📅', label: t('year'), value: car.year },
    { icon: '🏷️', label: t('brand'), value: car.brand },
    { icon: '🚗', label: t('model'), value: car.model },
    { icon: '📏', label: t('mileage'), value: car.mileage ? `${car.mileage.toLocaleString()} ${t('km')}` : '—' },
    { icon: '🎨', label: t('color'), value: car.color || '—' },
    { icon: '⚙️', label: t('transmission'), value: car.transmission === 'automatic' ? t('automatic') : t('manual') },
  ];

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Image */}
      <TouchableOpacity onPress={() => setLightbox(true)}>
        {car.images?.[imgIndex] ? (
          <Image source={{ uri: car.images[imgIndex] }} style={s.mainImg} />
        ) : (
          <View style={[s.mainImg, s.placeholder]}><Text style={{ fontSize: 60 }}>🏎️</Text></View>
        )}
      </TouchableOpacity>

      {/* Thumbnails */}
      {car.images && car.images.length > 1 && (
        <ScrollView horizontal style={s.thumbRow} showsHorizontalScrollIndicator={false}>
          {car.images.map((img, i) => (
            <TouchableOpacity key={i} onPress={() => setImgIndex(i)} style={[s.thumb, imgIndex === i && s.thumbActive]}>
              <Image source={{ uri: img }} style={s.thumbImg} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={s.content}>
        {/* Status */}
        <View style={s.badgeRow}>
          <View style={s.yearBadge}><Text style={s.yearText}>{car.year}</Text></View>
          <View style={[s.statusBadge, car.status === 'sold' ? s.soldBg : s.activeBg]}>
            <Text style={[s.statusText, car.status === 'sold' ? s.soldColor : s.activeColor]}>
              {car.status === 'active' ? t('active') : t('sold')}
            </Text>
          </View>
        </View>

        <Text style={s.title}>{car.title.ar}</Text>
        <Text style={s.sub}>{car.brand} • {car.model}</Text>

        {/* Price */}
        <View style={s.priceBox}>
          <Text style={s.price}>{car.price?.toLocaleString()}</Text>
          <Text style={s.kwd}>{t('kwd')}</Text>
        </View>

        {/* Specs */}
        <View style={s.specsGrid}>
          {specs.map(sp => (
            <View key={sp.label} style={s.specItem}>
              <Text style={s.specIcon}>{sp.icon}</Text>
              <Text style={s.specLabel}>{sp.label}</Text>
              <Text style={s.specValue}>{sp.value}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        {car.description?.ar && (
          <View style={s.descBox}>
            <Text style={s.descTitle}>{t('description')}</Text>
            <Text style={s.descText}>{car.description.ar}</Text>
          </View>
        )}

        {/* WhatsApp */}
        <TouchableOpacity style={s.waButton} onPress={openWhatsApp}>
          <Text style={s.waButtonText}>💬 {t('contactWhatsapp')}</Text>
        </TouchableOpacity>

        <Text style={s.seller}>{car.userName}</Text>
      </View>

      {/* Lightbox */}
      <Modal visible={lightbox} transparent animationType="fade">
        <View style={s.lightbox}>
          <TouchableOpacity style={s.closeBtn} onPress={() => setLightbox(false)}>
            <Text style={s.closeText}>✕</Text>
          </TouchableOpacity>
          {car.images?.[imgIndex] && <Image source={{ uri: car.images[imgIndex] }} style={s.lightboxImg} resizeMode="contain" />}
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' },
  loadText: { color: colors.silver },
  mainImg: { width, height: 280 },
  placeholder: { backgroundColor: colors.metal, justifyContent: 'center', alignItems: 'center' },
  thumbRow: { paddingHorizontal: 16, paddingVertical: 10 },
  thumb: { width: 60, height: 60, borderRadius: 10, marginRight: 8, borderWidth: 2, borderColor: colors.metal, overflow: 'hidden' },
  thumbActive: { borderColor: colors.primary },
  thumbImg: { width: '100%', height: '100%' },
  content: { padding: 20 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  yearBadge: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  yearText: { color: colors.white, fontWeight: '800', fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  soldBg: { backgroundColor: colors.primary + '20' },
  activeBg: { backgroundColor: '#22C55E20' },
  statusText: { fontWeight: '700', fontSize: 12 },
  soldColor: { color: colors.primary },
  activeColor: { color: colors.green },
  title: { fontSize: 28, fontWeight: '900', color: colors.white, marginBottom: 4 },
  sub: { color: colors.silver, fontSize: 14, opacity: 0.6, marginBottom: 16 },
  priceBox: { backgroundColor: colors.primary + '10', borderWidth: 1, borderColor: colors.primary + '30', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 20 },
  price: { color: colors.primary, fontSize: 32, fontWeight: '900' },
  kwd: { color: colors.silver, fontSize: 16 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  specItem: { backgroundColor: colors.darkCard, borderWidth: 1, borderColor: colors.metal, borderRadius: 12, padding: 12, width: '48%' },
  specIcon: { fontSize: 18, marginBottom: 4 },
  specLabel: { color: colors.silver, fontSize: 10, opacity: 0.5 },
  specValue: { color: colors.white, fontWeight: '700', fontSize: 13 },
  descBox: { marginBottom: 20 },
  descTitle: { color: colors.white, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  descText: { color: colors.silver, lineHeight: 22, opacity: 0.7 },
  waButton: { backgroundColor: colors.whatsapp, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  waButtonText: { color: colors.white, fontWeight: '800', fontSize: 18 },
  seller: { color: colors.silver, textAlign: 'center', opacity: 0.5, fontSize: 13 },
  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
  closeText: { color: colors.white, fontSize: 28 },
  lightboxImg: { width: width, height: width },
});
