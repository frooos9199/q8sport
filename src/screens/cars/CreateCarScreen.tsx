import React, { useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { push, ref as dbRef, serverTimestamp, set as dbSet, update } from '@react-native-firebase/database';

import PremiumButton from '../../components/PremiumButton';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { ListingMediaItem, uploadListingMedia } from '../../lib/listingImages';
import { colors, radius, shadows, spacing } from '../../lib/theme';

const BRANDS = ['Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Dodge', 'Nissan', 'Toyota', 'Mitsubishi', 'Subaru', 'Honda', 'Other'];

export default function CreateCarScreen({ navigation, route }: any) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const initialListing = route?.params?.listing;
  const isEditing = Boolean(initialListing?.id);
  const isAdmin = Boolean(user?.isAdmin);

  const [title, setTitle] = useState(initialListing?.title?.ar || '');
  const [description, setDescription] = useState(initialListing?.description?.ar || '');
  const [brand, setBrand] = useState(initialListing?.brand || 'Porsche');
  const [model, setModel] = useState(initialListing?.model || '');
  const [year, setYear] = useState(initialListing?.year ? String(initialListing.year) : '');
  const [price, setPrice] = useState(initialListing?.price ? String(initialListing.price) : '');
  const [mileage, setMileage] = useState(initialListing?.mileage ? String(initialListing.mileage) : '');
  const [color, setColor] = useState(initialListing?.color || '');
  const [transmission, setTransmission] = useState<'automatic' | 'manual'>(initialListing?.transmission || 'automatic');
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'electric' | 'hybrid'>(initialListing?.fuelType || 'petrol');
  const [sellerMode, setSellerMode] = useState<'self' | 'manual'>(() => {
    if (!isAdmin) return 'self';
    if (!isEditing) return 'self';
    const listingUserId = String(initialListing?.userId || '');
    return listingUserId && listingUserId !== String(user?.uid || '') ? 'manual' : 'self';
  });
  const [manualSellerName, setManualSellerName] = useState(initialListing?.userName || '');
  const [manualSellerPhone, setManualSellerPhone] = useState(initialListing?.userPhone || '');
  const [manualSellerWhatsapp, setManualSellerWhatsapp] = useState(initialListing?.userWhatsapp || '');
  const [imageItems, setImageItems] = useState<ListingMediaItem[]>(() =>
    (initialListing?.images || []).map((image: string, index: number) => ({
      image,
      thumb: initialListing?.imageThumbs?.[index] || image,
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const compactScreen = width < 390;
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const previewSize = width < 380 ? 76 : 88;

  const canSubmit = useMemo(() => {
    return !!user && title.trim().length >= 3 && model.trim().length >= 1 && year.trim().length === 4 && price.trim().length >= 1 && !submitting;
  }, [model, price, submitting, title, user, year]);

  const pickImages = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 6, quality: 0.8 });
    if (result.didCancel) return;
    const uris = (result.assets || []).map(asset => asset.uri).filter((uri): uri is string => Boolean(uri));
    if (!uris.length) return;
    setImageItems(prev => [...prev, ...uris.map(uri => ({ image: uri }))].slice(0, 6));
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

    const numericYear = Number(year);
    const numericPrice = Number(price);
    const numericMileage = mileage.trim() ? Number(mileage) : 0;
    if (Number.isNaN(numericYear) || Number.isNaN(numericPrice) || (mileage.trim() && Number.isNaN(numericMileage))) {
      Alert.alert('خطأ', 'السنة والسعر والكيلومترات لازم تكون أرقام صحيحة');
      return;
    }

    setSubmitting(true);
    try {
      const newRef = isEditing ? dbRef(db, `cars/${initialListing.id}`) : push(dbRef(db, 'cars'));
      const carId = (isEditing ? initialListing.id : newRef.key) as string;
      const media = imageItems.length ? await uploadListingMedia('cars', carId, imageItems) : { images: [], imageThumbs: [] };

      const derivedGuestId = () => {
        const contactDigits = digits(sellerWhatsappValue || sellerPhoneValue);
        const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        return contactDigits ? `guest-${contactDigits}-${unique}` : `guest-${unique}`;
      };

      const sellerIdValue = manualMode
        ? (isEditing && initialListing?.userId ? String(initialListing.userId) : derivedGuestId())
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
        brand,
        model: model.trim(),
        year: numericYear,
        price: numericPrice,
        mileage: numericMileage,
        color: color.trim(),
        transmission,
        fuelType,
        images: media.images,
        imageThumbs: media.imageThumbs,
        status: 'active',
        ...(isEditing ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() }),
      };

      if (isEditing) {
        await update(newRef, payload);
      } else {
        await dbSet(newRef, payload);
      }

      Alert.alert('تم', isEditing ? 'تم تحديث إعلان السيارة' : 'نزل إعلان السيارة مباشرة في السوق');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('خطأ', e?.message || 'تعذر نشر السيارة');
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
          <Text style={s.heroTitle}>{isEditing ? 'حدث إعلان سيارتك' : 'سيارتك تدخل السوق فورًا'}</Text>
          <Text style={s.heroSub}>{isEditing ? 'عدل البيانات والصور وحدث الإعلان مباشرة.' : 'اكتب أهم المعلومات، وارفع الصور، وخلك ظاهر مباشرة.'}</Text>
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
                <Field label="رقم الهاتف (اتصال)" value={manualSellerPhone} onChangeText={setManualSellerPhone} placeholder="+965..." keyboardType="phone-pad" />
                <Field label="رقم واتساب" value={manualSellerWhatsapp} onChangeText={setManualSellerWhatsapp} placeholder="+965..." keyboardType="phone-pad" />
              </View>
            ) : null}
          </View>
        ) : null}

        <Field label="عنوان الإعلان" value={title} onChangeText={setTitle} placeholder="مثال: موستنغ GT 5.0 فل كامل" />
        <Field label="الوصف" value={description} onChangeText={setDescription} placeholder="اكتب حالة السيارة والتعديلات وأي ملاحظات" multiline />

        <Text style={s.label}>الماركة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
          {BRANDS.map(item => (
            <Chip key={item} label={item} active={brand === item} onPress={() => setBrand(item)} />
          ))}
        </ScrollView>

        <Field label="الموديل" value={model} onChangeText={setModel} placeholder="GT-R / Panamera / M4 ..." />
        <DualRow compact={compactScreen}>
          <Field label="السنة" value={year} onChangeText={setYear} placeholder="2020" keyboardType="number-pad" compact={!compactScreen} />
          <Field label="السعر" value={price} onChangeText={setPrice} placeholder="18500" keyboardType="number-pad" compact={!compactScreen} />
        </DualRow>
        <DualRow compact={compactScreen}>
          <Field label="الكيلومترات" value={mileage} onChangeText={setMileage} placeholder="64000" keyboardType="number-pad" compact={!compactScreen} />
          <Field label="اللون" value={color} onChangeText={setColor} placeholder="أسود / رمادي" compact={!compactScreen} />
        </DualRow>

        <Text style={s.label}>ناقل الحركة</Text>
        <View style={[s.inlineRow, compactScreen && s.inlineRowWrap] }>
          <Chip label="أوتوماتيك" active={transmission === 'automatic'} onPress={() => setTransmission('automatic')} />
          <Chip label="عادي" active={transmission === 'manual'} onPress={() => setTransmission('manual')} />
        </View>

        <Text style={s.label}>نوع الوقود</Text>
        <View style={s.inlineRowWrap}>
          <Chip label="بنزين" active={fuelType === 'petrol'} onPress={() => setFuelType('petrol')} />
          <Chip label="ديزل" active={fuelType === 'diesel'} onPress={() => setFuelType('diesel')} />
          <Chip label="كهرباء" active={fuelType === 'electric'} onPress={() => setFuelType('electric')} />
          <Chip label="هايبرد" active={fuelType === 'hybrid'} onPress={() => setFuelType('hybrid')} />
        </View>

        <Text style={s.label}>الصور</Text>
        <TouchableOpacity style={s.imagePicker} activeOpacity={0.88} onPress={pickImages}>
          <Text style={s.imagePickerText}>📸 اختر صور الإعلان</Text>
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

        <PremiumButton title={submitting ? 'جاري الحفظ...' : isEditing ? 'حفظ التعديلات' : 'نشر السيارة'} onPress={submit} icon="🚀" style={{ opacity: canSubmit ? 1 : 0.65, marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, compact, multiline, ...props }: any) {
  return (
    <View style={[s.fieldWrap, compact && s.compactField]}>
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

function DualRow({ children, compact }: any) {
  return <View style={[s.dualRow, compact && s.dualRowCompact]}>{children}</View>;
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
  adminCard: { backgroundColor: colors.metal, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 16, marginBottom: 18 },
  adminTitle: { color: colors.white, fontSize: 15, fontWeight: '900' },
  adminSub: { color: colors.silver, fontSize: 12, marginTop: 6, lineHeight: 18 },
  adminModeRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  fieldWrap: { marginBottom: 14 },
  compactField: { flex: 1 },
  dualRow: { flexDirection: 'row', gap: 12 },
  dualRowCompact: { flexDirection: 'column', gap: 0 },
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
