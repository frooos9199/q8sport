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
import { consumeOnePublishPoint, getTotalCredits, hasFreeAdsEligibility } from '../../lib/userCredits';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';

const BRANDS = ['Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Dodge', 'Nissan', 'Toyota', 'Mitsubishi', 'Subaru', 'Honda', 'Other'];

export default function CreateCarScreen({ navigation, route }: any) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const initialListing = route?.params?.listing;
  const isEditing = Boolean(initialListing?.id);
  const isAdmin = Boolean(user?.isAdmin || user?.isSuperAdmin);

  const initialManualPhoneParsed = parseToGccNumber(String(initialListing?.userPhone || ''), { defaultCountry: 'KW' });
  const initialManualWhatsappParsed = parseToGccNumber(String(initialListing?.userWhatsapp || ''), { defaultCountry: 'KW' });

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
  const [manualSellerPhoneCountry, setManualSellerPhoneCountry] = useState<GccCountry['code']>(initialManualPhoneParsed.country);
  const [manualSellerPhoneNational, setManualSellerPhoneNational] = useState(initialManualPhoneParsed.nationalNumber);
  const [manualSellerWhatsappCountry, setManualSellerWhatsappCountry] = useState<GccCountry['code']>(initialManualWhatsappParsed.country);
  const [manualSellerWhatsappNational, setManualSellerWhatsappNational] = useState(initialManualWhatsappParsed.nationalNumber);
  const [imageItems, setImageItems] = useState<ListingMediaItem[]>(() =>
    (initialListing?.images || []).map((image: string, index: number) => ({
      image,
      thumb: initialListing?.imageThumbs?.[index] || image,
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const submitLock = useRef(false);
  const compactScreen = width < 390;
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const previewSize = width < 380 ? 76 : 88;

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!user) missing.push(t('login'));
    if (title.trim().length < 3) missing.push(t('listingTitle'));
    if (model.trim().length < 1) missing.push(t('model'));
    if (year.trim().length !== 4) missing.push(t('year'));
    if (price.trim().length < 1) missing.push(t('price'));
    return missing;
  }, [model, price, title, user, year]);

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

    if (!isEditing && !manualMode && !hasFreeAdsEligibility(user.campaign)) {
      const charge = await consumeOnePublishPoint(user.uid);
      if (!charge.ok) {
        Alert.alert(t('warningTitle'), t('insufficientCreditsMsg', { n: getTotalCredits(charge.credits) }));
        return;
      }
    }

    const numericYear = Number(year);
    const numericPrice = Number(price);
    const numericMileage = mileage.trim() ? Number(mileage) : 0;
    if (Number.isNaN(numericYear) || Number.isNaN(numericPrice) || (mileage.trim() && Number.isNaN(numericMileage))) {
      Alert.alert(t('loginErrorTitle'), t('invalidNumbersMsg'));
      return;
    }

    submitLock.current = true;
    setUploadPercent(0);
    setSubmitting(true);
    try {
      const newRef = isEditing ? dbRef(db, `cars/${initialListing.id}`) : push(dbRef(db, 'cars'));
      const carId = (isEditing ? initialListing.id : newRef.key) as string;
      const media = imageItems.length
        ? await uploadListingMedia('cars', carId, imageItems, { onProgress: setUploadPercent })
        : { images: [], imageThumbs: [], imageMediums: [], imageUrl: '', mediumUrl: '', thumbnailUrl: '' };

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
        void deleteRemovedListingMedia(initialListing, media);
      }

      if (isEditing) {
        Alert.alert(t('successTitle'), t('carUpdatedMsg'));
        navigation.goBack();
      } else {
        const shown = await showInstagramFollowPrompt({
          onDone: () => navigation.goBack(),
        });

        if (!shown) {
          Alert.alert(t('successTitle'), t('carPublishedMsg'));
          navigation.goBack();
        }
      }
    } catch (e: any) {
      Alert.alert(t('loginErrorTitle'), e?.message || t('carPublishFailedMsg'));
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
          <Text style={s.heroTitle}>{isEditing ? t('createCarHeroTitleEdit') : t('createCarHeroTitleNew')}</Text>
          <Text style={s.heroSub}>{isEditing ? t('createCarHeroSubEdit') : t('createCarHeroSubNew')}</Text>
        </View>

        {!isEditing ? (
          <View style={s.costNoticeCard}>
            <Text style={s.costNoticeText}>💳 {t('publishCostNotice')}</Text>
          </View>
        ) : null}

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

        <Field label={t('listingTitle')} value={title} onChangeText={setTitle} placeholder={t('listingTitlePlaceholderCar')} />
        <Field label={t('description')} value={description} onChangeText={setDescription} placeholder={t('listingDescriptionPlaceholderCar')} multiline />

        <Text style={s.label}>{t('brand')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
          {BRANDS.map(item => (
            <Chip key={item} label={item} active={brand === item} onPress={() => setBrand(item)} />
          ))}
        </ScrollView>

        <Field label={t('model')} value={model} onChangeText={setModel} placeholder={t('modelPlaceholder')} />
        <DualRow compact={compactScreen}>
          <Field label={t('year')} value={year} onChangeText={setYear} placeholder={t('yearPlaceholder')} keyboardType="number-pad" compact={!compactScreen} />
          <Field label={t('price')} value={price} onChangeText={setPrice} placeholder={t('pricePlaceholder')} keyboardType="number-pad" compact={!compactScreen} />
        </DualRow>
        <DualRow compact={compactScreen}>
          <Field label={t('mileage')} value={mileage} onChangeText={setMileage} placeholder={t('mileagePlaceholder')} keyboardType="number-pad" compact={!compactScreen} />
          <Field label={t('color')} value={color} onChangeText={setColor} placeholder={t('colorPlaceholder')} compact={!compactScreen} />
        </DualRow>

        <Text style={s.label}>{t('transmission')}</Text>
        <View style={[s.inlineRow, compactScreen && s.inlineRowWrap] }>
          <Chip label={t('automatic')} active={transmission === 'automatic'} onPress={() => setTransmission('automatic')} />
          <Chip label={t('manual')} active={transmission === 'manual'} onPress={() => setTransmission('manual')} />
        </View>

        <Text style={s.label}>{t('fuelType')}</Text>
        <View style={s.inlineRowWrap}>
          <Chip label={t('fuelPetrol')} active={fuelType === 'petrol'} onPress={() => setFuelType('petrol')} />
          <Chip label={t('fuelDiesel')} active={fuelType === 'diesel'} onPress={() => setFuelType('diesel')} />
          <Chip label={t('fuelElectric')} active={fuelType === 'electric'} onPress={() => setFuelType('electric')} />
          <Chip label={t('fuelHybrid')} active={fuelType === 'hybrid'} onPress={() => setFuelType('hybrid')} />
        </View>

        <Text style={s.label}>{t('images')}</Text>
        <TouchableOpacity style={s.imagePicker} activeOpacity={0.88} onPress={pickImages}>
          <Text style={s.imagePickerText}>📸 {t('selectAdImages')}</Text>
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
                : t('publishCarBtn')
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
  costNoticeCard: { backgroundColor: colors.metal, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.gold, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 14 },
  costNoticeText: { color: colors.white, fontSize: 12, fontWeight: '800', lineHeight: 18 },
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
  missingHint: { marginTop: 10, color: colors.primary, fontWeight: '800', fontSize: 12, lineHeight: 18, opacity: 0.95 },
});
