import React, { useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { push, ref as dbRef, serverTimestamp, set as dbSet, update } from '@react-native-firebase/database';

import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { ListingMediaItem, uploadListingMedia } from '../../lib/listingImages';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import PremiumButton from '../../components/PremiumButton';

type Category = 'car' | 'part' | 'other';

export default function CreateRequestScreen({ navigation, route }: any) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const listing = route?.params?.listing;
  const isEditing = Boolean(listing?.id);
  const isAdmin = Boolean(user?.isAdmin || user?.isSuperAdmin);

  const [category, setCategory] = useState<Category>(listing?.category || 'car');
  const [title, setTitle] = useState(listing?.title?.ar || '');
  const [description, setDescription] = useState(listing?.description?.ar || '');
  const [budget, setBudget] = useState(listing?.budget ? String(listing.budget) : '');
  const [sellerMode, setSellerMode] = useState<'self' | 'manual'>(() => {
    if (!isAdmin) return 'self';
    if (!isEditing) return 'self';
    const listingUserId = String(listing?.userId || '');
    return listingUserId && listingUserId !== String(user?.uid || '') ? 'manual' : 'self';
  });
  const [manualSellerName, setManualSellerName] = useState(listing?.userName || '');
  const [manualSellerPhone, setManualSellerPhone] = useState(listing?.userPhone || '');
  const [manualSellerWhatsapp, setManualSellerWhatsapp] = useState(listing?.userWhatsapp || '');
  const [imageItems, setImageItems] = useState<ListingMediaItem[]>(() =>
    (listing?.images || []).map((image: string, index: number) => ({
      image,
      thumb: listing?.imageThumbs?.[index] || image,
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const compactScreen = width < 390;
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const previewSize = width < 380 ? 76 : 88;

  const canSubmit = useMemo(() => {
    return title.trim().length >= 3 && description.trim().length >= 5 && !submitting;
  }, [description, submitting, title]);

  const pickImages = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 4, quality: 0.8 });
    if (result.didCancel) return;
    const uris = (result.assets || []).map(asset => asset.uri).filter((uri): uri is string => Boolean(uri));
    if (!uris.length) return;
    setImageItems(prev => [...prev, ...uris.map(uri => ({ image: uri }))].slice(0, 4));
  };

  const submit = async () => {
    if (!user) {
      Alert.alert('تسجيل الدخول', 'لازم تسجل دخول عشان تنشئ طلب');
      navigation.navigate('Login');
      return;
    }

    const digits = (value: unknown) => String(value || '').replace(/[^0-9]/g, '');
    const manualMode = isAdmin && sellerMode === 'manual';
    const sellerNameValue = (manualMode ? manualSellerName : user.name || '').trim();
    let sellerPhoneValue = (manualMode ? manualSellerPhone : user.phone || '').trim();
    let sellerWhatsappValue = (manualMode ? manualSellerWhatsapp : user.whatsapp || '').trim();

    if (manualMode) {
      const phoneDigits = digits(sellerPhoneValue);
      const waDigits = digits(sellerWhatsappValue);
      const selfWaDigits = digits(user?.whatsapp);
      const selfPhoneDigits = digits(user?.phone);

      if (phoneDigits && (!waDigits || waDigits === selfWaDigits || waDigits === selfPhoneDigits)) {
        sellerWhatsappValue = sellerPhoneValue;
      }
      if (!phoneDigits && waDigits) {
        sellerPhoneValue = sellerWhatsappValue;
      }
    }

    if (manualMode) {
      const contactDigits = digits(sellerWhatsappValue || sellerPhoneValue);
      if (sellerNameValue.length < 2) {
        Alert.alert('خطأ', 'اكتب اسم المعلن');
        return;
      }
      if (!contactDigits) {
        Alert.alert('خطأ', 'لازم تضيف رقم اتصال أو رقم واتساب');
        return;
      }
    }

    const titleValue = title.trim();
    const descriptionValue = description.trim();

    if (titleValue.length < 3) {
      Alert.alert('خطأ', 'اكتب عنوان مناسب');
      return;
    }
    if (descriptionValue.length < 5) {
      Alert.alert('خطأ', 'اكتب وصف مناسب');
      return;
    }

    const budgetNumber = budget.trim().length ? Number(budget.trim()) : undefined;
    if (budgetNumber != null && Number.isNaN(budgetNumber)) {
      Alert.alert('خطأ', 'الميزانية لازم تكون رقم');
      return;
    }

    setSubmitting(true);
    try {
      const newRef = isEditing ? dbRef(db, `requests/${listing.id}`) : push(dbRef(db, 'requests'));
      const requestId = (isEditing ? listing.id : newRef.key) as string;
      const media = imageItems.length
        ? await uploadListingMedia('requests', requestId, imageItems)
        : { images: [], imageThumbs: [], imageMediums: [], imageUrl: '', mediumUrl: '', thumbnailUrl: '' };

      const derivedGuestId = () => {
        const contactDigits = digits(sellerWhatsappValue || sellerPhoneValue);
        const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        return contactDigits ? `guest-${contactDigits}-${unique}` : `guest-${unique}`;
      };

      const sellerIdValue = manualMode
        ? (isEditing && listing?.userId ? String(listing.userId) : derivedGuestId())
        : user.uid;

      const payload = {
        userId: sellerIdValue,
        userName: sellerNameValue,
        userPhone: sellerPhoneValue,
        userWhatsapp: sellerWhatsappValue,
        contactDigits: digits(sellerWhatsappValue || sellerPhoneValue),
        userAvatar: manualMode ? '' : user.avatar || '',
        title: { ar: titleValue, en: titleValue },
        description: { ar: descriptionValue, en: descriptionValue },
        category,
        budget: budgetNumber,
        imageUrl: media.imageUrl,
        mediumUrl: media.mediumUrl,
        thumbnailUrl: media.thumbnailUrl,
        images: media.images,
        imageThumbs: media.imageThumbs,
        imageMediums: media.imageMediums,
        status: 'open',
        ...(isEditing ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() }),
      };

      if (isEditing) {
        await update(newRef, payload);
      } else {
        await dbSet(newRef, payload);
      }

      Alert.alert('تم', isEditing ? 'تم تحديث الطلب بنجاح' : 'تم إنشاء الطلب بنجاح');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('خطأ', e?.message || 'تعذر إنشاء الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = (uri: string) => {
    setImageItems(prev => prev.filter(item => item.image !== uri));
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.content, { padding: screenPadding }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.title}>{isEditing ? 'تعديل الطلب' : 'إنشاء طلب'}</Text>
          <Text style={s.sub}>{isEditing ? 'حدث المطلوب وعدل التفاصيل مباشرة' : 'اختر نوع الطلب واكتب التفاصيل'}</Text>

          {isAdmin ? (
            <View style={s.adminCard}>
              <Text style={s.adminTitle}>أدوات الإدارة</Text>
              <Text style={s.adminSub}>تقدر تنشر الطلب لحسابك أو نيابة عن شخص ما عنده حساب.</Text>
              <View style={[s.row, { marginTop: 12, flexWrap: 'wrap' }] }>
                <Chip label="حسابي" active={sellerMode === 'self'} onPress={() => setSellerMode('self')} compact={compactScreen} />
                <Chip label="بدون حساب" active={sellerMode === 'manual'} onPress={() => setSellerMode('manual')} compact={compactScreen} />
              </View>

              {sellerMode === 'manual' ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={s.label}>اسم المعلن</Text>
                  <TextInput
                    value={manualSellerName}
                    onChangeText={setManualSellerName}
                    placeholder="مثال: أبو فهد"
                    placeholderTextColor={colors.silver + '66'}
                    style={s.input}
                  />

                  <Text style={[s.label, { marginTop: 12 }]}>رقم الهاتف (اتصال)</Text>
                  <TextInput
                    value={manualSellerPhone}
                    onChangeText={setManualSellerPhone}
                    placeholder="+965..."
                    placeholderTextColor={colors.silver + '66'}
                    keyboardType="phone-pad"
                    style={s.input}
                  />

                  <Text style={[s.label, { marginTop: 12 }]}>رقم واتساب</Text>
                  <TextInput
                    value={manualSellerWhatsapp}
                    onChangeText={setManualSellerWhatsapp}
                    placeholder="+965..."
                    placeholderTextColor={colors.silver + '66'}
                    keyboardType="phone-pad"
                    style={s.input}
                  />
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={s.section}>
            <Text style={s.label}>النوع</Text>
            <View style={[s.row, compactScreen && s.rowCompact]}>
              <Chip label="سيارة" active={category === 'car'} onPress={() => setCategory('car')} compact={compactScreen} />
              <Chip label="قطعة" active={category === 'part'} onPress={() => setCategory('part')} compact={compactScreen} />
              <Chip label="أخرى" active={category === 'other'} onPress={() => setCategory('other')} compact={compactScreen} />
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.label}>العنوان</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="مثال: أبي بورش باناميرا 2020"
              placeholderTextColor={colors.silver + '66'}
              style={s.input}
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>الوصف</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="اكتب التفاصيل المطلوبة"
              placeholderTextColor={colors.silver + '66'}
              style={[s.input, s.textarea]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>الميزانية (اختياري)</Text>
            <TextInput
              value={budget}
              onChangeText={setBudget}
              placeholder="مثال: 5000"
              placeholderTextColor={colors.silver + '66'}
              keyboardType="number-pad"
              style={s.input}
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>الصورة</Text>
            <TouchableOpacity style={s.imagePicker} activeOpacity={0.88} onPress={pickImages}>
              <Text style={s.imagePickerText}>📸 اختر صورة من التلفون</Text>
              <Text style={s.imagePickerHint}>حتى 4 صور</Text>
            </TouchableOpacity>
            {!!imageItems.length && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.previewRow}>
                {imageItems.map(item => (
                  <View key={item.image} style={s.previewWrap}>
                    <Image source={{ uri: item.image }} style={[s.previewImage, { width: previewSize, height: previewSize }]} />
                    <TouchableOpacity style={s.previewRemove} onPress={() => removeImage(item.image)}>
                      <Text style={s.previewRemoveText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <PremiumButton title={submitting ? 'جاري الحفظ…' : isEditing ? 'حفظ التعديلات' : 'إنشاء الطلب'} onPress={submit} variant="primary" icon="➕" style={{ opacity: canSubmit ? 1 : 0.6 }} />
          <TouchableOpacity style={s.cancel} activeOpacity={0.85} onPress={() => navigation.goBack()}>
            <Text style={s.cancelText}>إلغاء</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Chip({ label, active, onPress, compact }: { label: string; active: boolean; onPress: () => void; compact?: boolean }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[c.chip, compact && c.chipCompact, active && c.chipActive]}>
      <Text style={[c.chipText, active && c.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  content: { padding: spacing.xl },

  card: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    padding: 20,
    ...shadows.card,
  },

  title: { color: colors.white, fontSize: 20, fontWeight: '900' },
  sub: { color: colors.silver, marginTop: 6, fontSize: 12 },

  adminCard: {
    marginTop: 16,
    backgroundColor: colors.metal,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    padding: 14,
    ...shadows.card,
  },
  adminTitle: { color: colors.white, fontSize: 14, fontWeight: '900' },
  adminSub: { color: colors.silver, fontSize: 12, marginTop: 6, lineHeight: 18 },

  section: { marginTop: 16 },
  label: { color: colors.silver, fontSize: 12, fontWeight: '700', marginBottom: 8 },

  row: { flexDirection: 'row', gap: 10 },
  rowCompact: { flexWrap: 'wrap' },

  input: {
    backgroundColor: colors.metal,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontWeight: '700',
  },
  textarea: { minHeight: 120 },
  imagePicker: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    padding: 16,
    alignItems: 'center',
  },
  imagePickerText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  imagePickerHint: { color: colors.silver, marginTop: 5, fontSize: 12 },
  previewRow: { paddingTop: 14 },
  previewWrap: { marginRight: 10 },
  previewImage: { borderRadius: radius.lg, marginRight: 10 },
  previewRemove: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  previewRemoveText: { color: colors.white, fontWeight: '900', fontSize: 11 },

  cancel: { marginTop: 12, alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: colors.silver, fontWeight: '800' },
});

const c = StyleSheet.create({
  chip: {
    flex: 1,
    backgroundColor: colors.metal,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipCompact: {
    minWidth: '48%',
    flexGrow: 0,
  },
  chipActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primaryBorder,
  },
  chipText: { color: colors.silver, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.primary },
});
