import React, { useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { push, ref as dbRef, serverTimestamp, set as dbSet, update } from '@react-native-firebase/database';

import PremiumButton from '../../components/PremiumButton';
import GccPhoneInput from '../../components/GccPhoneInput';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { ListingMediaItem, uploadListingMedia } from '../../lib/listingImages';
import { buildE164, parseToGccNumber, type GccCountry } from '../../lib/gccPhone';
import { colors, radius, shadows, spacing } from '../../lib/theme';

const CATEGORIES = ['مكينة', 'قير', 'رنجات', 'داخلية', 'الخارجية', 'بودي كت', 'فرامل', 'كمبيوتر', 'أخرى'];
const BRANDS = ['Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Dodge', 'Nissan', 'Toyota', 'Mitsubishi', 'Subaru', 'Honda'];

export default function CreatePartScreen({ navigation, route }: any) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const listing = route?.params?.listing;
  const isEditing = Boolean(listing?.id);
  const isAdmin = Boolean(user?.isAdmin || user?.isSuperAdmin);

  const initialManualPhoneParsed = parseToGccNumber(String(listing?.userPhone || ''), { defaultCountry: 'KW' });
  const initialManualWhatsappParsed = parseToGccNumber(String(listing?.userWhatsapp || ''), { defaultCountry: 'KW' });
  const [title, setTitle] = useState(listing?.title?.ar || '');
  const [description, setDescription] = useState(listing?.description?.ar || '');
  const [category, setCategory] = useState(CATEGORIES.includes(listing?.category) ? listing.category : 'مكينة');
  const [price, setPrice] = useState(listing?.price ? String(listing.price) : '');
  const [condition, setCondition] = useState<'new' | 'used'>(listing?.condition || 'used');
  const [sellerMode, setSellerMode] = useState<'self' | 'manual'>(() => {
    if (!isAdmin) return 'self';
    if (!isEditing) return 'self';
    const listingUserId = String(listing?.userId || '');
    return listingUserId && listingUserId !== String(user?.uid || '') ? 'manual' : 'self';
  });
  const [manualSellerName, setManualSellerName] = useState(listing?.userName || '');
  const [manualSellerPhone, setManualSellerPhone] = useState(listing?.userPhone || '');
  const [manualSellerWhatsapp, setManualSellerWhatsapp] = useState(listing?.userWhatsapp || '');
  const [manualSellerPhoneCountry, setManualSellerPhoneCountry] = useState<GccCountry['code']>(initialManualPhoneParsed.country);
  const [manualSellerPhoneNational, setManualSellerPhoneNational] = useState(initialManualPhoneParsed.nationalNumber);
  const [manualSellerWhatsappCountry, setManualSellerWhatsappCountry] = useState<GccCountry['code']>(initialManualWhatsappParsed.country);
  const [manualSellerWhatsappNational, setManualSellerWhatsappNational] = useState(initialManualWhatsappParsed.nationalNumber);
  const [imageItems, setImageItems] = useState<ListingMediaItem[]>(() =>
    (listing?.images || []).map((image: string, index: number) => ({
      image,
      thumb: listing?.imageThumbs?.[index] || image,
    })),
  );
  const [compatibleBrands, setCompatibleBrands] = useState<string[]>(listing?.compatibleBrands || ['Ford']);
  const [submitting, setSubmitting] = useState(false);
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const compactScreen = width < 390;
  const previewSize = width < 380 ? 76 : 88;

  const canSubmit = useMemo(() => {
    return !!user && title.trim().length >= 3 && price.trim().length >= 1 && compatibleBrands.length >= 1 && !submitting;
  }, [compatibleBrands.length, price, submitting, title, user]);

  const pickImages = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 6, quality: 0.8 });
    if (result.didCancel) return;
    const uris = (result.assets || []).map(asset => asset.uri).filter((uri): uri is string => Boolean(uri));
    if (!uris.length) return;
    setImageItems(prev => [...prev, ...uris.map(uri => ({ image: uri }))].slice(0, 6));
  };

  const toggleBrand = (brandName: string) => {
    setCompatibleBrands(prev => prev.includes(brandName) ? prev.filter(item => item !== brandName) : [...prev, brandName]);
  };

  const submit = async () => {
    if (!user) {
      Alert.alert('تسجيل الدخول', 'لازم تسجل دخول قبل النشر');
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

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
      Alert.alert('خطأ', 'السعر لازم يكون رقم صحيح');
      return;
    }

    if (!CATEGORIES.includes(category)) {
      Alert.alert('خطأ', 'فئة القطعة غير مسموح بها');
      return;
    }

    setSubmitting(true);
    try {
      const newRef = isEditing ? dbRef(db, `parts/${listing.id}`) : push(dbRef(db, 'parts'));
      const partId = (isEditing ? listing.id : newRef.key) as string;
      const media = imageItems.length
        ? await uploadListingMedia('parts', partId, imageItems)
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
        title: { ar: title.trim(), en: title.trim() },
        description: { ar: description.trim(), en: description.trim() },
        category,
        compatibleBrands,
        price: numericPrice,
        condition,
        imageUrl: media.imageUrl,
        mediumUrl: media.mediumUrl,
        thumbnailUrl: media.thumbnailUrl,
        images: media.images,
        imageThumbs: media.imageThumbs,
        imageMediums: media.imageMediums,
        status: 'active',
        ...(isEditing ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() }),
      };

      if (isEditing) {
        await update(newRef, payload);
      } else {
        await dbSet(newRef, payload);
      }

      Alert.alert('تم', isEditing ? 'تم تحديث إعلان القطعة' : 'نزل إعلان القطعة مباشرة في السوق');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('خطأ', e?.message || 'تعذر نشر القطعة');
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
        <View style={s.heroCard}>
          <Text style={s.heroTitle}>{isEditing ? 'حدث إعلان القطعة' : 'القطعة تنزل فورًا'}</Text>
          <Text style={s.heroSub}>{isEditing ? 'عدل المعلومات والصور وخلك ظاهر مباشرة.' : 'حدد نوع القطعة وتوافقها وصورها، وخلك جاهز للتواصل المباشر.'}</Text>
        </View>

        {isAdmin ? (
          <View style={s.adminCard}>
            <Text style={s.adminTitle}>أدوات الإدارة</Text>
            <Text style={s.adminSub}>تقدر تنشر الإعلان لحسابك أو نيابة عن شخص ما عنده حساب.</Text>
            <View style={s.adminModeRow}>
              <Chip label="حسابي" active={sellerMode === 'self'} onPress={() => setSellerMode('self')} />
              <Chip label="بدون حساب" active={sellerMode === 'manual'} onPress={() => setSellerMode('manual')} />
            </View>

            {sellerMode === 'manual' ? (
              <View style={{ marginTop: 10 }}>
                <Field label="اسم المعلن" value={manualSellerName} onChangeText={setManualSellerName} placeholder="مثال: أبو فهد" />

                <Text style={s.label}>رقم الهاتف (اتصال)</Text>
                <View style={{ marginBottom: 12 }}>
                  <GccPhoneInput
                    icon="📞"
                    country={manualSellerPhoneCountry}
                    onCountryChange={(code) => {
                      setManualSellerPhoneCountry(code);
                      setManualSellerPhone(buildE164(code, manualSellerPhoneNational));
                    }}
                    nationalNumber={manualSellerPhoneNational}
                    onNationalNumberChange={(value) => {
                      setManualSellerPhoneNational(value);
                      setManualSellerPhone(buildE164(manualSellerPhoneCountry, value));
                    }}
                    placeholder="اكتب الرقم بدون فتح الخط"
                    editable={!submitting}
                  />
                </View>

                <Text style={s.label}>رقم واتساب</Text>
                <View style={{ marginBottom: 12 }}>
                  <GccPhoneInput
                    icon="💬"
                    country={manualSellerWhatsappCountry}
                    onCountryChange={(code) => {
                      setManualSellerWhatsappCountry(code);
                      setManualSellerWhatsapp(buildE164(code, manualSellerWhatsappNational));
                    }}
                    nationalNumber={manualSellerWhatsappNational}
                    onNationalNumberChange={(value) => {
                      setManualSellerWhatsappNational(value);
                      setManualSellerWhatsapp(buildE164(manualSellerWhatsappCountry, value));
                    }}
                    placeholder="اكتب الرقم بدون فتح الخط"
                    editable={!submitting}
                  />
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        <Field label="عنوان القطعة" value={title} onChangeText={setTitle} placeholder="مثال: مكينة موستنغ 5.0 كاملة" />
        <Field label="الوصف" value={description} onChangeText={setDescription} placeholder="اكتب الحالة والتفاصيل وما يشمله البيع" multiline />

        <Text style={s.label}>التصنيف</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
          {CATEGORIES.map(item => (
            <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
          ))}
        </ScrollView>

        <Field label="السعر" value={price} onChangeText={setPrice} placeholder="750" keyboardType="number-pad" />

        <Text style={s.label}>الحالة</Text>
        <View style={[s.inlineRow, compactScreen && s.inlineRowWrap]}>
          <Chip label="مستعمل" active={condition === 'used'} onPress={() => setCondition('used')} />
          <Chip label="جديد" active={condition === 'new'} onPress={() => setCondition('new')} />
        </View>

        <Text style={s.label}>التوافق</Text>
        <View style={s.inlineRowWrap}>
          {BRANDS.map(item => (
            <Chip key={item} label={item} active={compatibleBrands.includes(item)} onPress={() => toggleBrand(item)} />
          ))}
        </View>

        <Text style={s.label}>الصور</Text>
        <TouchableOpacity style={s.imagePicker} activeOpacity={0.88} onPress={pickImages}>
          <Text style={s.imagePickerText}>📸 اختر صور القطعة</Text>
          <Text style={s.imagePickerHint}>حتى 6 صور</Text>
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

        <PremiumButton title={submitting ? 'جاري الحفظ...' : isEditing ? 'حفظ التعديلات' : 'نشر القطعة'} onPress={submit} icon="🚀" style={{ opacity: canSubmit ? 1 : 0.65, marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, multiline, ...props }: any) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, multiline && s.textarea]}
        placeholderTextColor={colors.silver + '70'}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  content: { padding: spacing.xl, paddingBottom: 40 },
  heroCard: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.primaryBorder, padding: 20, marginBottom: 18 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '900', marginBottom: 6 },
  heroSub: { color: colors.silverLight, fontSize: 14, lineHeight: 22 },
  adminCard: { backgroundColor: colors.metal, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 16, marginBottom: 18, ...shadows.card },
  adminTitle: { color: colors.white, fontSize: 15, fontWeight: '900' },
  adminSub: { color: colors.silver, fontSize: 12, marginTop: 6, lineHeight: 18 },
  adminModeRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  fieldWrap: { marginBottom: 14 },
  label: { color: colors.silver, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  input: { backgroundColor: colors.darkCard, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 14, color: colors.white, fontWeight: '700' },
  textarea: { minHeight: 120 },
  chipsRow: { paddingBottom: 6 },
  inlineRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  inlineRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  chip: { backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalBorder, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.full, marginRight: 10, marginBottom: 10 },
  chipActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
  chipText: { color: colors.silverLight, fontWeight: '800', fontSize: 12 },
  chipTextActive: { color: colors.primary },
  imagePicker: { backgroundColor: colors.darkCard, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.xl, padding: 16, alignItems: 'center', ...shadows.card },
  imagePickerText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  imagePickerHint: { color: colors.silver, marginTop: 5, fontSize: 12 },
  previewRow: { paddingTop: 14 },
  previewWrap: { marginRight: 10 },
  previewImage: { borderRadius: radius.lg, marginRight: 10 },
  previewRemove: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  previewRemoveText: { color: colors.white, fontWeight: '900', fontSize: 11 },
});