import React, { useMemo, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { push, ref as dbRef, serverTimestamp, set as dbSet, update } from '@react-native-firebase/database';

import PremiumButton from '../../components/PremiumButton';
import GccPhoneInput from '../../components/GccPhoneInput';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { showInstagramFollowPrompt } from '../../lib/instagramFollowPrompt';
import { deleteRemovedListingMedia, ListingMediaItem, uploadListingMedia } from '../../lib/listingImages';
import { buildE164, parseToGccNumber, type GccCountry } from '../../lib/gccPhone';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';

const CATEGORIES = [
  { value: 'مكينة', labelKey: 'partCatEngine' as const },
  { value: 'قير', labelKey: 'partCatTransmission' as const },
  { value: 'رنجات', labelKey: 'partCatWheels' as const },
  { value: 'داخلية', labelKey: 'partCatInterior' as const },
  { value: 'الخارجية', labelKey: 'partCatExterior' as const },
  { value: 'بودي كت', labelKey: 'partCatBodyKit' as const },
  { value: 'فرامل', labelKey: 'partCatBrakes' as const },
  { value: 'كمبيوتر', labelKey: 'partCatComputer' as const },
  { value: 'أخرى', labelKey: 'partCatOther' as const },
];
const BRANDS = ['Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Dodge', 'Nissan', 'Toyota', 'Mitsubishi', 'Subaru', 'Honda'];

export default function CreatePartScreen({ navigation, route }: any) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const listing = route?.params?.listing;
  const isEditing = Boolean(listing?.id);
  const isAdmin = Boolean(user?.isAdmin || user?.isSuperAdmin);

  const initialTitle = useMemo(() => {
    const raw = listing?.title;
    const candidate = (typeof raw === 'string' ? raw : raw?.ar || raw?.en || '').trim();
    if (candidate.length) return candidate;
    if (!isEditing) return '';

    const fromCategory = String(listing?.category || '').trim();
    if (fromCategory.length) return fromCategory;
    return t('untitled');
  }, [isEditing, listing?.category, listing?.title]);

  const initialManualPhoneParsed = parseToGccNumber(String(listing?.userPhone || ''), { defaultCountry: 'KW' });
  const initialManualWhatsappParsed = parseToGccNumber(String(listing?.userWhatsapp || ''), { defaultCountry: 'KW' });
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(listing?.description?.ar || '');
  const [category, setCategory] = useState(
    CATEGORIES.some(item => item.value === listing?.category) ? listing.category : CATEGORIES[0].value,
  );
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
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const submitLock = useRef(false);
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const compactScreen = width < 390;
  const previewSize = width < 380 ? 76 : 88;

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!user) missing.push(t('login'));
    if (title.trim().length < 3) missing.push(t('listingTitle'));
    if (price.trim().length < 1) missing.push(t('price'));
    if (compatibleBrands.length < 1) missing.push(t('compatibility'));
    return missing;
  }, [compatibleBrands.length, price, title, user]);

  const canSubmit = useMemo(() => {
    return !!user && title.trim().length >= 3 && price.trim().length >= 1 && compatibleBrands.length >= 1 && !submitting;
  }, [compatibleBrands.length, price, submitting, title, user]);

  const pickImages = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 6, quality: 0.8 });
    if (result.didCancel) return;
    const uris = (result.assets || []).map(asset => asset.uri).filter((uri): uri is string => Boolean(uri));
    if (!uris.length) return;
    // Prepend new images so edits are visible immediately and can replace existing images even when already at 6.
    setImageItems(prev => [...uris.map(uri => ({ image: uri })), ...prev].slice(0, 6));
  };

  const toggleBrand = (brandName: string) => {
    setCompatibleBrands(prev => prev.includes(brandName) ? prev.filter(item => item !== brandName) : [...prev, brandName]);
  };

  const submit = async () => {
    if (submitLock.current || submitting) {
      return;
    }

    if (missingFields.length) {
      Alert.alert(t('loginErrorTitle'), t('missingRequiredFieldsMsg', { fields: missingFields.join('، ') }));
      return;
    }
    if (!user) {
      Alert.alert(t('login'), t('loginRequiredToPublishMsg'));
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
        Alert.alert(t('loginErrorTitle'), t('sellerNameRequiredMsg'));
        return;
      }
      if (!contactDigits) {
        Alert.alert(t('loginErrorTitle'), t('contactRequiredMsg'));
        return;
      }
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
      Alert.alert(t('loginErrorTitle'), t('invalidPriceMsg'));
      return;
    }

    if (!CATEGORIES.some(item => item.value === category)) {
      Alert.alert(t('loginErrorTitle'), t('invalidPartCategoryMsg'));
      return;
    }

    submitLock.current = true;
    setUploadPercent(0);
    setSubmitting(true);
    try {
      const newRef = isEditing ? dbRef(db, `parts/${listing.id}`) : push(dbRef(db, 'parts'));
      const partId = (isEditing ? listing.id : newRef.key) as string;
      const media = imageItems.length
        ? await uploadListingMedia('parts', partId, imageItems, { onProgress: setUploadPercent })
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

      if (isEditing) {
        void deleteRemovedListingMedia(listing, media);
      }

      if (isEditing) {
        Alert.alert(t('successTitle'), t('partUpdatedMsg'));
        navigation.goBack();
      } else {
        const shown = await showInstagramFollowPrompt({
          onDone: () => navigation.goBack(),
        });

        if (!shown) {
          Alert.alert(t('successTitle'), t('partPublishedMsg'));
          navigation.goBack();
        }
      }
    } catch (e: any) {
      Alert.alert(t('loginErrorTitle'), e?.message || t('partPublishFailedMsg'));
    } finally {
      setSubmitting(false);
      setUploadPercent(null);
      submitLock.current = false;
    }
  };

  const removeImage = (uri: string) => {
    setImageItems(prev => prev.filter(item => item.image !== uri));
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.content, { padding: screenPadding }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <Text style={s.heroTitle}>{isEditing ? t('createPartHeroTitleEdit') : t('createPartHeroTitleNew')}</Text>
          <Text style={s.heroSub}>{isEditing ? t('createPartHeroSubEdit') : t('createPartHeroSubNew')}</Text>
        </View>

        {isAdmin ? (
          <View style={s.adminCard}>
            <Text style={s.adminTitle}>{t('adminToolsTitle')}</Text>
            <Text style={s.adminSub}>{t('adminCreateListingSub')}</Text>
            <View style={s.adminModeRow}>
              <Chip label={t('sellerModeSelf')} active={sellerMode === 'self'} onPress={() => setSellerMode('self')} />
              <Chip label={t('sellerModeGuest')} active={sellerMode === 'manual'} onPress={() => setSellerMode('manual')} />
            </View>

            {sellerMode === 'manual' ? (
              <View style={{ marginTop: 10 }}>
                <Field label={t('sellerNameLabel')} value={manualSellerName} onChangeText={setManualSellerName} placeholder={t('sellerNamePlaceholder')} />

                <Text style={s.label}>{t('phoneCallFieldLabel')}</Text>
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
                    placeholder={t('enterNumberNoCountryCode')}
                    editable={!submitting}
                  />
                </View>

                <Text style={s.label}>{t('whatsapp')}</Text>
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
                    placeholder={t('enterNumberNoCountryCode')}
                    editable={!submitting}
                  />
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        <Field label={t('listingTitle')} value={title} onChangeText={setTitle} placeholder={t('listingTitlePlaceholderPart')} />
        <Field label={t('description')} value={description} onChangeText={setDescription} placeholder={t('listingDescriptionPlaceholderPart')} multiline />

        <Text style={s.label}>{t('category')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
          {CATEGORIES.map(item => (
            <Chip key={item.value} label={t(item.labelKey)} active={category === item.value} onPress={() => setCategory(item.value)} />
          ))}
        </ScrollView>

        <Field label={t('price')} value={price} onChangeText={setPrice} placeholder={t('pricePlaceholder')} keyboardType="number-pad" />

        <Text style={s.label}>{t('condition')}</Text>
        <View style={[s.inlineRow, compactScreen && s.inlineRowWrap]}>
          <Chip label={t('used')} active={condition === 'used'} onPress={() => setCondition('used')} />
          <Chip label={t('new')} active={condition === 'new'} onPress={() => setCondition('new')} />
        </View>

        <Text style={s.label}>{t('compatibility')}</Text>
        <View style={s.inlineRowWrap}>
          {BRANDS.map(item => (
            <Chip key={item} label={item} active={compatibleBrands.includes(item)} onPress={() => toggleBrand(item)} />
          ))}
        </View>

        <Text style={s.label}>{t('images')}</Text>
        <TouchableOpacity style={s.imagePicker} activeOpacity={0.88} onPress={pickImages}>
          <Text style={s.imagePickerText}>📸 {t('selectPartImages')}</Text>
          <Text style={s.imagePickerHint}>{t('upTo6Images')}</Text>
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

        <PremiumButton
          title={
            submitting
              ? (uploadPercent != null ? t('uploadingWithPercent', { n: uploadPercent }) : t('savingShort'))
              : isEditing
                ? t('saveEdit')
                : t('publishPartBtn')
          }
          onPress={submit}
          icon="🚀"
          disabled={!canSubmit || submitting}
          style={{ opacity: canSubmit ? 1 : 0.65, marginTop: 8 }}
        />

        {!submitting && !canSubmit && missingFields.length ? (
          <Text style={s.missingHint}>{t('missingRequiredFieldsMsg', { fields: missingFields.join('، ') })}</Text>
        ) : null}
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
  missingHint: { marginTop: 10, color: colors.primary, fontWeight: '800', fontSize: 12, lineHeight: 18, opacity: 0.95 },
});