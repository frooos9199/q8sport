import React, { useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { push, ref as dbRef, serverTimestamp, set as dbSet, update } from '@react-native-firebase/database';
import { ref as storageRef } from '@react-native-firebase/storage';

import PremiumButton from '../../components/PremiumButton';
import { useAuth } from '../../hooks/useAuth';
import { db, storage } from '../../lib/firebase';
import { colors, radius, shadows, spacing } from '../../lib/theme';

const BRANDS = ['Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Dodge', 'Nissan', 'Toyota', 'Other'];

export default function CreateCarScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const initialListing = route?.params?.listing;
  const isEditing = Boolean(initialListing?.id);

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
  const [images, setImages] = useState<string[]>(initialListing?.images || []);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return !!user && title.trim().length >= 3 && model.trim().length >= 1 && year.trim().length === 4 && price.trim().length >= 1 && !submitting;
  }, [model, price, submitting, title, user, year]);

  const pickImages = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 6, quality: 0.8 });
    if (result.didCancel) return;
    const uris = (result.assets || []).map(asset => asset.uri).filter((uri): uri is string => Boolean(uri));
    if (!uris.length) return;
    setImages(prev => [...prev, ...uris].slice(0, 6));
  };

  const uploadImages = async (carId: string) => {
    const uploadedUrls: string[] = [];
    for (let index = 0; index < images.length; index += 1) {
      const uri = images[index];
      if (/^https?:\/\//.test(uri)) {
        uploadedUrls.push(uri);
        continue;
      }
      const cleanUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      const imageRef = storageRef(storage, `cars/${carId}/${Date.now()}-${index}.jpg`);
      await imageRef.putFile(cleanUri);
      const url = await imageRef.getDownloadURL();
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  };

  const submit = async () => {
    if (!user) {
      Alert.alert('تسجيل الدخول', 'لازم تسجل دخول قبل النشر');
      return;
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
      const imageUrls = images.length ? await uploadImages(carId) : [];

      const payload = {
        userId: user.uid,
        userName: user.name,
        userWhatsapp: user.whatsapp,
        userAvatar: user.avatar || '',
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
        images: imageUrls,
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
    setImages(prev => prev.filter(item => item !== uri));
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <Text style={s.heroTitle}>{isEditing ? 'حدث إعلان سيارتك' : 'سيارتك تدخل السوق فورًا'}</Text>
          <Text style={s.heroSub}>{isEditing ? 'عدل البيانات والصور وحدث الإعلان مباشرة.' : 'اكتب أهم المعلومات، وارفع الصور، وخلك ظاهر مباشرة.'}</Text>
        </View>

        <Field label="عنوان الإعلان" value={title} onChangeText={setTitle} placeholder="مثال: موستنغ GT 5.0 فل كامل" />
        <Field label="الوصف" value={description} onChangeText={setDescription} placeholder="اكتب حالة السيارة والتعديلات وأي ملاحظات" multiline />

        <Text style={s.label}>الماركة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
          {BRANDS.map(item => (
            <Chip key={item} label={item} active={brand === item} onPress={() => setBrand(item)} />
          ))}
        </ScrollView>

        <Field label="الموديل" value={model} onChangeText={setModel} placeholder="GT-R / Panamera / M4 ..." />
        <DualRow>
          <Field label="السنة" value={year} onChangeText={setYear} placeholder="2020" keyboardType="number-pad" compact />
          <Field label="السعر" value={price} onChangeText={setPrice} placeholder="18500" keyboardType="number-pad" compact />
        </DualRow>
        <DualRow>
          <Field label="الكيلومترات" value={mileage} onChangeText={setMileage} placeholder="64000" keyboardType="number-pad" compact />
          <Field label="اللون" value={color} onChangeText={setColor} placeholder="أسود / رمادي" compact />
        </DualRow>

        <Text style={s.label}>ناقل الحركة</Text>
        <View style={s.inlineRow}>
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
        {!!images.length && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.previewRow}>
            {images.map(uri => (
              <View key={uri} style={s.previewWrap}>
                <Image source={{ uri }} style={s.previewImage} />
                <TouchableOpacity style={s.previewRemove} onPress={() => removeImage(uri)}>
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

function DualRow({ children }: any) {
  return <View style={s.dualRow}>{children}</View>;
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
  fieldWrap: { marginBottom: 14 },
  compactField: { flex: 1 },
  dualRow: { flexDirection: 'row', gap: 12 },
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
  previewImage: { width: 88, height: 88, borderRadius: radius.lg, marginRight: 10 },
  previewRemove: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  previewRemoveText: { color: colors.white, fontWeight: '900', fontSize: 11 },
});
