import React, { useMemo, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { push, ref as dbRef, serverTimestamp, set as dbSet, update } from '@react-native-firebase/database';

import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { showInstagramFollowPrompt } from '../../lib/instagramFollowPrompt';
import { deleteRemovedListingMedia, ListingMediaItem, uploadListingMedia } from '../../lib/listingImages';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import PremiumButton from '../../components/PremiumButton';
import GccPhoneInput from '../../components/GccPhoneInput';
import { buildE164, parseToGccNumber, type GccCountry } from '../../lib/gccPhone';
import { t } from '../../i18n';

type Category = 'car' | 'part' | 'other';

export default function CreateRequestScreen({ navigation, route }: any) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const listing = route?.params?.listing;
  const isEditing = Boolean(listing?.id);
  const isAdmin = Boolean(user?.isAdmin || user?.isSuperAdmin);

  const initialManualPhoneParsed = parseToGccNumber(String(listing?.userPhone || ''), { defaultCountry: 'KW' });
  const initialManualWhatsappParsed = parseToGccNumber(String(listing?.userWhatsapp || ''), { defaultCountry: 'KW' });

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
  const [submitting, setSubmitting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const submitLock = useRef(false);
  const compactScreen = width < 390;
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const previewSize = width < 380 ? 76 : 88;

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (title.trim().length < 3) missing.push(t('listingTitle'));
    if (description.trim().length < 5) missing.push(t('description'));
    return missing;
  }, [description, title]);

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
    if (submitLock.current || submitting) {
      return;
    }

    if (missingFields.length) {
      Alert.alert(t('loginErrorTitle'), t('missingRequiredFieldsMsg', { fields: missingFields.join('، ') }));
      return;
    }
    if (!user) {
      Alert.alert(t('login'), t('loginRequiredToCreateRequestMsg'));
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
        Alert.alert(t('loginErrorTitle'), t('sellerNameRequiredMsg'));
        return;
      }
      if (!contactDigits) {
        Alert.alert(t('loginErrorTitle'), t('contactRequiredMsg'));
        return;
      }
    }

    const titleValue = title.trim();
    const descriptionValue = description.trim();

    if (titleValue.length < 3) {
      Alert.alert(t('loginErrorTitle'), t('requestTitleRequiredMsg'));
      return;
    }
    if (descriptionValue.length < 5) {
      Alert.alert(t('loginErrorTitle'), t('requestDescRequiredMsg'));
      return;
    }

    const budgetNumber = budget.trim().length ? Number(budget.trim()) : undefined;
    if (budgetNumber != null && Number.isNaN(budgetNumber)) {
      Alert.alert(t('loginErrorTitle'), t('budgetMustBeNumberMsg'));
      return;
    }

    submitLock.current = true;
    setUploadPercent(0);
    setSubmitting(true);
    try {
      const newRef = isEditing ? dbRef(db, `requests/${listing.id}`) : push(dbRef(db, 'requests'));
      const requestId = (isEditing ? listing.id : newRef.key) as string;
      const media = imageItems.length
        ? await uploadListingMedia('requests', requestId, imageItems, { onProgress: setUploadPercent })
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

      if (isEditing) {
        void deleteRemovedListingMedia(listing, media);
      }

      if (isEditing) {
        Alert.alert(t('successTitle'), t('requestUpdatedMsg'));
        navigation.goBack();
      } else {
        const shown = await showInstagramFollowPrompt({
          onDone: () => navigation.goBack(),
        });

        if (!shown) {
          Alert.alert(t('successTitle'), t('requestCreatedMsg'));
          navigation.goBack();
        }
      }
    } catch (e: any) {
      Alert.alert(t('loginErrorTitle'), e?.message || t('requestCreateFailedMsg'));
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
        <View style={s.card}>
          <Text style={s.title}>{isEditing ? t('editRequestTitle') : t('createRequestSimpleTitle')}</Text>
          <Text style={s.sub}>{isEditing ? t('createRequestHeroSubEdit') : t('createRequestHeroSubNew')}</Text>

          {isAdmin ? (
            <View style={s.adminCard}>
              <Text style={s.adminTitle}>{t('adminToolsTitle')}</Text>
              <Text style={s.adminSub}>{t('adminCreateListingSub')}</Text>
              <View style={[s.row, { marginTop: 12, flexWrap: 'wrap' }] }>
                <Chip label={t('sellerModeSelf')} active={sellerMode === 'self'} onPress={() => setSellerMode('self')} compact={compactScreen} />
                <Chip label={t('sellerModeGuest')} active={sellerMode === 'manual'} onPress={() => setSellerMode('manual')} compact={compactScreen} />
              </View>

              {sellerMode === 'manual' ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={s.label}>{t('sellerNameLabel')}</Text>
                  <TextInput
                    value={manualSellerName}
                    onChangeText={setManualSellerName}
                    placeholder={t('sellerNamePlaceholder')}
                    placeholderTextColor={colors.silver + '66'}
                    style={s.input}
                  />

                  <Text style={[s.label, { marginTop: 12 }]}>{t('phoneCallFieldLabel')}</Text>
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

                  <Text style={[s.label, { marginTop: 12 }]}>{t('whatsapp')}</Text>
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
              ) : null}
            </View>
          ) : null}

          <View style={s.section}>
            <Text style={s.label}>{t('requestTypeLabel')}</Text>
            <View style={[s.row, compactScreen && s.rowCompact]}>
              <Chip label={t('requestTypeCar')} active={category === 'car'} onPress={() => setCategory('car')} compact={compactScreen} />
              <Chip label={t('requestTypePart')} active={category === 'part'} onPress={() => setCategory('part')} compact={compactScreen} />
              <Chip label={t('requestTypeOther')} active={category === 'other'} onPress={() => setCategory('other')} compact={compactScreen} />
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.label}>{t('requestTitleLabel')}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('requestTitlePlaceholder')}
              placeholderTextColor={colors.silver + '66'}
              style={s.input}
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>{t('requestDescLabel')}</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('requestDescPlaceholder')}
              placeholderTextColor={colors.silver + '66'}
              style={[s.input, s.textarea]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>{t('requestBudgetOptionalLabel')}</Text>
            <TextInput
              value={budget}
              onChangeText={setBudget}
              placeholder={t('requestBudgetPlaceholder')}
              placeholderTextColor={colors.silver + '66'}
              keyboardType="number-pad"
              style={s.input}
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>{t('requestImagesLabel')}</Text>
            <TouchableOpacity style={s.imagePicker} activeOpacity={0.88} onPress={pickImages}>
              <Text style={s.imagePickerText}>📸 {t('selectImagesFromPhone')}</Text>
              <Text style={s.imagePickerHint}>{t('upTo4Images')}</Text>
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

          <PremiumButton
            title={
              submitting
                ? (uploadPercent != null ? t('uploadingWithPercent', { n: uploadPercent }) : t('savingShort'))
                : isEditing
                  ? t('saveEdit')
                  : t('createRequestBtn')
            }
            onPress={submit}
            variant="primary"
            icon="➕"
            disabled={!canSubmit || submitting}
            style={{ opacity: canSubmit ? 1 : 0.6 }}
          />
          {!submitting && !canSubmit && missingFields.length ? (
            <Text style={s.missingHint}>{t('missingRequiredFieldsMsg', { fields: missingFields.join('، ') })}</Text>
          ) : null}
          <TouchableOpacity style={s.cancel} activeOpacity={0.85} onPress={() => navigation.goBack()}>
            <Text style={s.cancelText}>{t('cancel')}</Text>
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
  missingHint: { marginTop: 10, color: colors.primary, fontWeight: '800', fontSize: 12, lineHeight: 18, opacity: 0.95 },

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
