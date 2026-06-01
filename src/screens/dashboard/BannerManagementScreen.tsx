import React from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { push, ref as dbRef, remove, set, update } from '@react-native-firebase/database';
import LinearGradient from 'react-native-linear-gradient';

import FastAdImage from '../../components/FastAdImage';
import { useAuth } from '../../hooks/useAuth';
import { bannerHasPlacement, bannerPlacementOptions, fetchAllBanners } from '../../lib/bannerAds';
import { db } from '../../lib/firebase';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { BannerAd, BannerPlacement } from '../../types';
import { uploadListingMedia } from '../../lib/listingImages';
import { t } from '../../i18n';

export default function BannerManagementScreen() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [banners, setBanners] = React.useState<BannerAd[]>([]);
  const [title, setTitle] = React.useState('');
  const [targetUrl, setTargetUrl] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('0');
  const [placements, setPlacements] = React.useState<BannerPlacement[]>(['home']);
  const [selectedImageUri, setSelectedImageUri] = React.useState<string | null>(null);
  const [selectedPreviewUri, setSelectedPreviewUri] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [busyBannerId, setBusyBannerId] = React.useState<string | null>(null);
  const compactScreen = width < 390;
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;

  const loadBanners = React.useCallback(async () => {
    const items = await fetchAllBanners();
    setBanners(items);
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await loadBanners();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [loadBanners]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadBanners();
    } finally {
      setRefreshing(false);
    }
  }, [loadBanners]);

  const pickBannerImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8 });
    if (result.didCancel) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setSelectedImageUri(asset.uri);
    setSelectedPreviewUri(asset.uri);
  };

  const resetForm = () => {
    setTitle('');
    setTargetUrl('');
    setSortOrder('0');
    setPlacements(['home']);
    setSelectedImageUri(null);
    setSelectedPreviewUri(null);
  };

  const togglePlacement = (placement: BannerPlacement) => {
    setPlacements(currentPlacements => {
      if (currentPlacements.includes(placement)) {
        if (currentPlacements.length === 1) {
          return currentPlacements;
        }

        return currentPlacements.filter(currentPlacement => currentPlacement !== placement);
      }

      return [...currentPlacements, placement];
    });
  };

  const saveBanner = async () => {
    if (!user?.isSuperAdmin || !user.uid) {
      Alert.alert(t('warningTitle'), t('bannerAdminOnlyMsg'));
      return;
    }

    if (!selectedImageUri) {
      Alert.alert(t('warningTitle'), t('bannerPickImageFirstMsg'));
      return;
    }

    if (!placements.length) {
      Alert.alert(t('warningTitle'), t('bannerSelectPlacementMsg'));
      return;
    }

    const parsedSortOrder = Number(sortOrder || '0');

    setSaving(true);
    try {
      const bannerRef = push(dbRef(db, 'banners'));
      const bannerId = bannerRef.key;

      if (!bannerId) {
        throw new Error(t('bannerIdCreateFailedMsg'));
      }

      const media = await uploadListingMedia('banners', bannerId, [{ image: selectedImageUri }]);

      await set(bannerRef, {
        title: title.trim() || '',
        targetUrl: targetUrl.trim() || '',
        imageUrl: media.imageUrl,
        mediumUrl: media.mediumUrl,
        thumbnailUrl: media.thumbnailUrl,
        placements,
        isActive: true,
        createdBy: user.uid,
        sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
        createdAt: Date.now(),
      });

      resetForm();
      await loadBanners();
      Alert.alert(t('successTitle'), t('bannerUploadedMsg'));
    } catch (error: any) {
      Alert.alert(t('loginErrorTitle'), error?.message || t('bannerSaveFailedMsg'));
    } finally {
      setSaving(false);
    }
  };

  const toggleBanner = async (item: BannerAd) => {
    setBusyBannerId(item.id);
    try {
      await update(dbRef(db, `banners/${item.id}`), {
        isActive: !item.isActive,
        updatedAt: Date.now(),
      });
      await loadBanners();
    } catch (error: any) {
      Alert.alert(t('loginErrorTitle'), error?.message || t('bannerToggleFailedMsg'));
    } finally {
      setBusyBannerId(null);
    }
  };

  const deleteBanner = async (item: BannerAd) => {
    Alert.alert(t('confirmTitle'), t('bannerDeleteConfirmMsg', { title: item.title?.trim() || t('untitled') }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          setBusyBannerId(item.id);
          try {
            await remove(dbRef(db, `banners/${item.id}`));
            await loadBanners();
          } catch (error: any) {
            Alert.alert(t('loginErrorTitle'), error?.message || t('bannerDeleteFailedMsg'));
          } finally {
            setBusyBannerId(null);
          }
        },
      },
    ]);
  };

  if (!user?.isSuperAdmin) {
    return (
      <View style={s.centeredState}>
        <Text style={s.centeredTitle}>{t('bannerAdminOnlyTitle')}</Text>
        <Text style={s.centeredSub}>{t('bannerAdminOnlySub')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{ padding: screenPadding, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={s.heroCard}>
        <LinearGradient colors={['rgba(227,30,36,0.12)', 'transparent']} style={s.heroGlow} />
        <Text style={s.heroTitle}>{t('bannerHeroTitle')}</Text>
        <Text style={s.heroSub}>{t('bannerHeroSub')}</Text>
      </View>

      <View style={s.formCard}>
        <Text style={s.sectionTitle}>{t('bannerAddNewTitle')}</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder={t('bannerTitleOptionalPlaceholder')} placeholderTextColor={colors.silver + '88'} style={s.input} />
        <TextInput value={targetUrl} onChangeText={setTargetUrl} placeholder={t('bannerTargetUrlOptionalPlaceholder')} placeholderTextColor={colors.silver + '88'} style={s.input} autoCapitalize="none" />
        <TextInput value={sortOrder} onChangeText={setSortOrder} placeholder={t('bannerSortOrderPlaceholder')} placeholderTextColor={colors.silver + '88'} style={s.input} keyboardType="numeric" />

        <Text style={s.fieldLabel}>{t('bannerPlacementsLabel')}</Text>
        <View style={s.placementGrid}>
          {bannerPlacementOptions.map(option => {
            const isSelected = placements.includes(option.value);

            return (
              <TouchableOpacity
                key={option.value}
                style={[s.placementChip, isSelected && s.placementChipActive]}
                activeOpacity={0.88}
                onPress={() => togglePlacement(option.value)}
              >
                <Text style={[s.placementTitle, isSelected && s.placementTitleActive]}>{t(option.labelKey)}</Text>
                <Text style={[s.placementDescription, isSelected && s.placementDescriptionActive]}>{t(option.descriptionKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={s.imagePicker} activeOpacity={0.88} onPress={pickBannerImage}>
          <Text style={s.imagePickerText}>{selectedPreviewUri ? t('bannerChangeImage') : `📸 ${t('bannerPickImage')}`}</Text>
          <Text style={s.imagePickerHint}>{t('bannerImageHint')}</Text>
        </TouchableOpacity>

        {selectedPreviewUri ? (
          <View style={s.previewCard}>
            <FastAdImage uri={selectedPreviewUri} style={s.previewImage} placeholderColor={colors.darkLight} showWatermark={false} />
          </View>
        ) : null}

        <TouchableOpacity style={[s.primaryBtn, saving && s.primaryBtnDisabled]} activeOpacity={0.88} onPress={saveBanner} disabled={saving}>
          <Text style={s.primaryBtnText}>{saving ? t('uploadingShort') : t('bannerUploadBtn')}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.listCard}>
        <View style={[s.listHeader, compactScreen && s.listHeaderCompact]}>
          <Text style={s.sectionTitle}>{t('bannerCurrentListTitle')}</Text>
          <View style={s.statPill}><Text style={s.statPillText}>{t('bannerCount', { n: banners.length })}</Text></View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={s.loading} />
        ) : banners.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyTitle}>{t('bannerEmptyTitle')}</Text>
            <Text style={s.emptySub}>{t('bannerEmptySub')}</Text>
          </View>
        ) : (
          banners.map(item => {
            const isBusy = busyBannerId === item.id;

            return (
              <View key={item.id} style={s.bannerItem}>
                <FastAdImage uri={item.thumbnailUrl || item.imageUrl} style={s.bannerImage} placeholderColor={colors.darkLight} showWatermark={false} />
                <View style={s.bannerBody}>
                  <View style={[s.bannerTitleRow, compactScreen && s.bannerTitleRowCompact]}>
                    <Text style={s.bannerTitle} numberOfLines={1}>{item.title?.trim() || t('untitled')}</Text>
                    <View style={[s.statusBadge, item.isActive ? s.statusActive : s.statusInactive]}>
                      <Text style={[s.statusText, item.isActive ? s.statusTextActive : s.statusTextInactive]}>{item.isActive ? t('active') : t('hidden')}</Text>
                    </View>
                  </View>
                  {item.targetUrl ? <Text style={s.bannerLink} numberOfLines={1}>{item.targetUrl}</Text> : <Text style={s.bannerMeta}>{t('noLink')}</Text>}
                  <Text style={s.bannerMeta}>{t('orderWithN', { n: item.sortOrder || 0 })}</Text>
                  <View style={s.placementsWrap}>
                    {bannerPlacementOptions.filter(option => bannerHasPlacement(item, option.value)).map(option => (
                      <View key={`${item.id}-${option.value}`} style={s.placementTag}>
                        <Text style={s.placementTagText}>{t(option.labelKey)}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={[s.bannerActions, compactScreen && s.bannerActionsCompact]}>
                    <TouchableOpacity style={[s.actionBtn, s.toggleBtn, compactScreen && s.bannerActionBtnCompact, isBusy && s.actionDisabled]} activeOpacity={0.88} onPress={() => toggleBanner(item)} disabled={isBusy}>
                      <Text style={s.toggleBtnText}>{isBusy ? t('workingShort') : item.isActive ? t('hide') : t('activate')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtn, s.deleteBtn, compactScreen && s.bannerActionBtnCompact, isBusy && s.actionDisabled]} activeOpacity={0.88} onPress={() => deleteBanner(item)} disabled={isBusy}>
                      <Text style={s.deleteBtnText}>{t('delete')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  heroCard: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 22, overflow: 'hidden', ...shadows.card },
  heroGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '900' },
  heroSub: { color: colors.silver, fontSize: 13, marginTop: 8, lineHeight: 20 },
  formCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginTop: 16 },
  listCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginTop: 16, marginBottom: 40 },
  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: '900', marginBottom: 14 },
  fieldLabel: { color: colors.white, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  input: { backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.lg, color: colors.white, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12 },
  placementGrid: { gap: 10, marginBottom: 14 },
  placementChip: { backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 14 },
  placementChipActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
  placementTitle: { color: colors.white, fontSize: 14, fontWeight: '900', textAlign: 'right' },
  placementTitleActive: { color: colors.primary },
  placementDescription: { color: colors.silver, fontSize: 12, marginTop: 4, textAlign: 'right', lineHeight: 18 },
  placementDescriptionActive: { color: colors.white },
  imagePicker: { backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.xl, padding: 16, alignItems: 'center', marginBottom: 12 },
  imagePickerText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  imagePickerHint: { color: colors.silver, marginTop: 5, fontSize: 12 },
  previewCard: { borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.metalBorder, marginBottom: 12 },
  previewImage: { width: '100%', height: 160, backgroundColor: colors.metal },
  primaryBtn: { backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, borderRadius: radius.lg, paddingVertical: 15, alignItems: 'center' },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: colors.primary, fontWeight: '900', fontSize: 15 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listHeaderCompact: { alignItems: 'flex-start', gap: 10 },
  statPill: { backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  statPillText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  loading: { paddingVertical: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 26 },
  emptyTitle: { color: colors.white, fontWeight: '800', fontSize: 16 },
  emptySub: { color: colors.silver, marginTop: 6, fontSize: 12, textAlign: 'center' },
  bannerItem: { backgroundColor: colors.metal, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.metalBorder, marginTop: 14 },
  bannerImage: { width: '100%', height: 150, backgroundColor: colors.darkLight },
  bannerBody: { padding: 14 },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerTitleRowCompact: { alignItems: 'flex-start', gap: 10 },
  bannerTitle: { flex: 1, color: colors.white, fontSize: 15, fontWeight: '900', marginRight: 10 },
  statusBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  statusActive: { backgroundColor: colors.greenGlow, borderColor: colors.green },
  statusInactive: { backgroundColor: colors.darkCard, borderColor: colors.metalBorder },
  statusText: { fontSize: 11, fontWeight: '900' },
  statusTextActive: { color: colors.green },
  statusTextInactive: { color: colors.silver },
  bannerLink: { color: colors.primary, marginTop: 10, fontSize: 12 },
  bannerMeta: { color: colors.silver, marginTop: 8, fontSize: 12 },
  placementsWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  placementTag: { backgroundColor: colors.darkCard, borderWidth: 1, borderColor: colors.metalBorder, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  placementTagText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  bannerActions: { flexDirection: 'row', marginTop: 14 },
  bannerActionsCompact: { flexWrap: 'wrap', gap: 10 },
  bannerActionBtnCompact: { minWidth: '100%' },
  actionBtn: { flex: 1, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  actionDisabled: { opacity: 0.5 },
  toggleBtn: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder, marginRight: 10 },
  toggleBtnText: { color: colors.primary, fontWeight: '900' },
  deleteBtn: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.metalBorder },
  deleteBtnText: { color: '#ff8c8c', fontWeight: '900' },
  centeredState: { flex: 1, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  centeredTitle: { color: colors.white, fontSize: 18, fontWeight: '900' },
  centeredSub: { color: colors.silver, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});