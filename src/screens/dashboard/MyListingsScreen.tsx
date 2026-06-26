import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ref as dbRef, remove, update } from '@react-native-firebase/database';

import { useAuth } from '../../hooks/useAuth';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { db } from '../../lib/firebase';
import { collectListingMediaUrls, deleteListingMediaByUrls } from '../../lib/listingImages';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';
import { FEATURED_LISTING_POINT_COST, consumeUserCredits, getTotalCredits } from '../../lib/userCredits';
type ListingType = 'car' | 'part' | 'request';
type FilterType = 'all' | ListingType;

type ListingRow = {
  id: string;
  type: ListingType;
  title: string;
  subtitle: string;
  priceLine: string;
  status: string;
  featuredAt?: number | null;
  raw: any;
};

export default function MyListingsScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [items, setItems] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const compactScreen = width < 390;
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const canManageAllListings = Boolean(user?.isAdmin || user?.isSuperAdmin);

  const loadListings = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    const expiredToDelete: Array<{ path: string; mediaUrls: string[]; key: string; type: ListingType }> = [];

    const [carsSnap, partsSnap, requestsSnap] = await Promise.all([
      getDbSnapshot(dbRef(db, 'cars'), 'cars'),
      getDbSnapshot(dbRef(db, 'parts'), 'parts'),
      getDbSnapshot(dbRef(db, 'requests'), 'requests'),
    ]);

    const nextItems: ListingRow[] = [];

    const shouldIncludeListing = (ownerUserId?: string) => canManageAllListings || ownerUserId === user.uid;

    const sellerLine = (value: any) => {
      if (!canManageAllListings) {
        return null;
      }

      const sellerName = value?.userName?.trim() || t('unknownSeller');
      const sellerWhatsapp = value?.userWhatsapp?.trim();
      return sellerWhatsapp ? `${sellerName} • ${sellerWhatsapp}` : sellerName;
    };

    carsSnap.forEach((child: any) => {
      const value = child.val();
      const status = String(value?.status || 'active');
      const deleteAt = Number(value?.deleteAt || 0);
      if (status === 'sold' && deleteAt > 0 && deleteAt <= now && shouldIncludeListing(value?.userId)) {
        expiredToDelete.push({
          path: `cars/${child.key}`,
          mediaUrls: collectListingMediaUrls(value),
          key: String(child.key),
          type: 'car',
        });
        return undefined;
      }
      if (shouldIncludeListing(value?.userId)) {
        const seller = sellerLine(value);
        nextItems.push({
          id: child.key,
          type: 'car',
          title: value?.title?.ar || t('carSingular'),
          subtitle: [value?.brand, value?.model, value?.year, seller].filter(Boolean).join(' • '),
          priceLine: value?.price ? `${Number(value.price).toLocaleString()} ${t('kwd')}` : t('noPrice'),
          status: value?.status || 'active',
          featuredAt: value?.featuredAt ? Number(value.featuredAt) : null,
          raw: value,
        });
      }
      return undefined;
    });

    partsSnap.forEach((child: any) => {
      const value = child.val();
      const status = String(value?.status || 'active');
      const deleteAt = Number(value?.deleteAt || 0);
      if (status === 'sold' && deleteAt > 0 && deleteAt <= now && shouldIncludeListing(value?.userId)) {
        expiredToDelete.push({
          path: `parts/${child.key}`,
          mediaUrls: collectListingMediaUrls(value),
          key: String(child.key),
          type: 'part',
        });
        return undefined;
      }
      if (shouldIncludeListing(value?.userId) && value?.category?.trim() !== 'عادم') {
        const seller = sellerLine(value);
        nextItems.push({
          id: child.key,
          type: 'part',
          title: value?.title?.ar || t('partSingular'),
          subtitle: [value?.category, ...(value?.compatibleBrands || []).slice(0, 2), seller].filter(Boolean).join(' • '),
          priceLine: value?.price ? `${Number(value.price).toLocaleString()} ${t('kwd')}` : t('noPrice'),
          status: value?.status || 'active',
          featuredAt: value?.featuredAt ? Number(value.featuredAt) : null,
          raw: value,
        });
      }
      return undefined;
    });

    requestsSnap.forEach((child: any) => {
      const value = child.val();
      if (shouldIncludeListing(value?.userId)) {
        const seller = sellerLine(value);
        nextItems.push({
          id: child.key,
          type: 'request',
          title: value?.title?.ar || t('requestSingular'),
          subtitle: [
            value?.category === 'car'
              ? t('requestCategoryCar')
              : value?.category === 'part'
                ? t('requestCategoryPart')
                : t('requestCategoryOther'),
            seller,
          ]
            .filter(Boolean)
            .join(' • '),
          priceLine: value?.budget ? `${Number(value.budget).toLocaleString()} ${t('kwd')}` : t('noBudget'),
          status: value?.status || 'open',
          raw: value,
        });
      }
      return undefined;
    });

    nextItems.sort((a, b) => {
      const aFeatured = Number(a.featuredAt || 0);
      const bFeatured = Number(b.featuredAt || 0);
      const aIsFeatured = aFeatured > 0;
      const bIsFeatured = bFeatured > 0;
      if (aIsFeatured !== bIsFeatured) {
        return aIsFeatured ? -1 : 1;
      }
      if (aIsFeatured && bIsFeatured && aFeatured !== bFeatured) {
        return bFeatured - aFeatured;
      }
      const aTime = a.raw?.updatedAt || a.raw?.createdAt || 0;
      const bTime = b.raw?.updatedAt || b.raw?.createdAt || 0;
      return String(bTime).localeCompare(String(aTime));
    });

    if (expiredToDelete.length) {
      await Promise.allSettled(
        expiredToDelete.map(async (item) => {
          try {
            await remove(dbRef(db, item.path));
          } catch {
            return;
          }
          await deleteListingMediaByUrls(item.mediaUrls);
        }),
      );
    }

    setItems(nextItems);
  }, [user, canManageAllListings]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await loadListings();
      } catch (e: any) {
        if (mounted) {
          Alert.alert(t('loginErrorTitle'), e?.message || t('myListingsFetchFailedMsg'));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [loadListings]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadListings();
    } finally {
      setRefreshing(false);
    }
  };

  const editListing = (item: ListingRow) => {
    if (item.type === 'car') {
      navigation.navigate('CreateCar', { listing: { id: item.id, ...item.raw } });
      return;
    }
    if (item.type === 'part') {
      navigation.navigate('CreatePart', { listing: { id: item.id, ...item.raw } });
      return;
    }
    navigation.navigate('CreateRequest', { listing: { id: item.id, ...item.raw } });
  };

  const deleteListing = (item: ListingRow) => {
    const path = item.type === 'car' ? `cars/${item.id}` : item.type === 'part' ? `parts/${item.id}` : `requests/${item.id}`;
    Alert.alert(t('confirmTitle'), t('myListingsDeleteConfirmMsg', { title: item.title }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            const mediaUrls = collectListingMediaUrls(item.raw);
            await remove(dbRef(db, path));
            await deleteListingMediaByUrls(mediaUrls);
            setItems(prev => prev.filter(entry => !(entry.type === item.type && entry.id === item.id)));
          } catch (e: any) {
            Alert.alert(t('loginErrorTitle'), e?.message || t('myListingsDeleteFailedMsg'));
          }
        },
      },
    ]);
  };

  const toggleListingStatus = async (item: ListingRow) => {
    const path = item.type === 'car' ? `cars/${item.id}` : item.type === 'part' ? `parts/${item.id}` : `requests/${item.id}`;
    const nextStatus = item.type === 'request'
      ? item.status === 'open' ? 'closed' : 'open'
      : item.status === 'sold' ? 'active' : 'sold';

    const now = Date.now();
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const patch: Record<string, any> = { status: nextStatus, updatedAt: now };
    if (item.type !== 'request') {
      if (nextStatus === 'sold') {
        patch.soldAt = now;
        patch.deleteAt = now + THREE_DAYS_MS;
      } else {
        patch.soldAt = null;
        patch.deleteAt = null;
      }
    }

    try {
      await update(dbRef(db, path), patch);
      setItems(prev => prev.map(entry => (
        entry.id === item.id && entry.type === item.type
          ? { ...entry, status: nextStatus, raw: { ...entry.raw, ...patch } }
          : entry
      )));
    } catch (e: any) {
      Alert.alert(t('loginErrorTitle'), e?.message || t('myListingsStatusUpdateFailedMsg'));
    }
  };

  const toggleFeatured = async (item: ListingRow) => {
    const isOwner = String(item.raw?.userId || '') === String(user?.uid || '');
    if (!canManageAllListings && !isOwner) return;
    if (item.type !== 'car' && item.type !== 'part') return;

    let didChargePoints = false;

    if (!item.featuredAt && !canManageAllListings && user?.uid) {
      const charge = await consumeUserCredits(user.uid, FEATURED_LISTING_POINT_COST);
      if (!charge.ok) {
        Alert.alert(t('warningTitle'), t('insufficientFeatureCreditsMsg', { n: getTotalCredits(charge.credits) }));
        return;
      }
      didChargePoints = true;
    }

    const path = item.type === 'car' ? `cars/${item.id}` : `parts/${item.id}`;
    const nextFeaturedAt = item.featuredAt ? null : Date.now();
    const patch: Record<string, any> = { featuredAt: nextFeaturedAt };

    try {
      await update(dbRef(db, path), patch);
      setItems(prev => prev.map(entry => (
        entry.id === item.id && entry.type === item.type
          ? { ...entry, featuredAt: nextFeaturedAt, raw: { ...entry.raw, ...patch } }
          : entry
      )));
      const successMessage = nextFeaturedAt
        ? didChargePoints ? t('featuredEnabledWithCostMsg') : t('featuredEnabledNoCostMsg')
        : t('featuredDisabledMsg');
      Alert.alert(t('successTitle'), successMessage);
    } catch (e: any) {
      Alert.alert(t('loginErrorTitle'), e?.message || t('registerErrorGenericMsg'));
    }
  };

  const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

  const filterLabel = (value: FilterType) => {
    if (value === 'car') return t('cars');
    if (value === 'part') return t('parts');
    if (value === 'request') return t('requests');
    return t('all');
  };

  const statusActionLabel = (item: ListingRow) => {
    if (item.type === 'request') {
      return item.status === 'open' ? t('close') : t('reopen');
    }

    return item.status === 'sold' ? t('markActive') : t('markSold');
  };

  const statusLabel = (value: string) => {
    const mapped: Record<string, string> = {
      active: t('active'),
      sold: t('sold'),
      open: t('open'),
      closed: t('closed'),
      pending: t('pending'),
    };
    return mapped[value] || value;
  };

  if (loading) {
    return (
      <View style={s.center}>
        <Text style={s.loading}>{t('myListingsLoading')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={s.container}
      data={filteredItems}
      keyExtractor={item => `${item.type}-${item.id}`}
      contentContainerStyle={{ padding: screenPadding, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={
        <>
          <View style={s.heroCard}>
            <Text style={s.heroTitle}>{canManageAllListings ? t('myListingsHeroTitleAdmin') : t('myListingsHeroTitle')}</Text>
            <Text style={s.heroSub}>
              {canManageAllListings
                ? t('myListingsHeroSubAdmin')
                : t('myListingsHeroSub')}
            </Text>
          </View>

          <View style={s.filtersRow}>
            {(['all', 'car', 'part', 'request'] as FilterType[]).map(value => (
              <TouchableOpacity
                key={value}
                activeOpacity={0.85}
                onPress={() => setFilter(value)}
                style={[s.filterChip, filter === value && s.filterChipActive]}
              >
                <Text style={[s.filterChipText, filter === value && s.filterChipTextActive]}>{filterLabel(value)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={s.centerCard}>
          <Text style={s.emptyTitle}>{canManageAllListings ? t('myListingsEmptyTitleAdmin') : t('myListingsEmptyTitle')}</Text>
          <Text style={s.emptySub}>
            {canManageAllListings
              ? t('myListingsEmptySubAdmin')
              : t('myListingsEmptySub')}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[s.card, item.featuredAt ? s.cardFeatured : null]}>
          <View style={[s.topRow, compactScreen && s.topRowCompact]}>
            <View style={s.typeBadge}><Text style={s.typeText}>{item.type === 'car' ? t('carSingular') : item.type === 'part' ? t('partSingular') : t('requestSingular')}</Text></View>
            <Text style={s.status}>{statusLabel(item.status)}</Text>
          </View>
          <Text style={s.title}>{item.title}</Text>
          <Text style={s.subtitle}>{item.subtitle || t('noExtraDetails')}</Text>
          <Text style={s.price}>{item.priceLine}</Text>
          <View style={[s.actionsRow, compactScreen && s.actionsRowCompact]}>
            <TouchableOpacity style={[s.editBtn, compactScreen && s.actionBtnCompact]} activeOpacity={0.85} onPress={() => editListing(item)}>
              <Text style={s.editText}>{t('edit')}</Text>
            </TouchableOpacity>
            {(item.type === 'car' || item.type === 'part') && (canManageAllListings || String(item.raw?.userId || '') === String(user?.uid || '')) ? (
              <TouchableOpacity
                style={[s.featureBtn, item.featuredAt ? s.featureBtnActive : null, compactScreen && s.actionBtnCompact]}
                activeOpacity={0.85}
                onPress={() => toggleFeatured(item)}
              >
                <Text style={[s.featureText, item.featuredAt ? s.featureTextActive : null]}>{t('featuredAdLabel')}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={[s.statusBtn, compactScreen && s.actionBtnCompact]} activeOpacity={0.85} onPress={() => toggleListingStatus(item)}>
              <Text style={s.statusBtnText}>{statusActionLabel(item)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.deleteBtn, compactScreen && s.actionBtnCompact]} activeOpacity={0.85} onPress={() => deleteListing(item)}>
              <Text style={s.deleteText}>{t('delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  loading: { color: colors.silver, fontSize: 15 },
  heroCard: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.primaryBorder, padding: 20, marginBottom: 16 },
  heroTitle: { color: colors.white, fontWeight: '900', fontSize: 22, marginBottom: 6 },
  heroSub: { color: colors.silverLight, fontSize: 13, lineHeight: 21 },
  filtersRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  filterChip: { backgroundColor: colors.darkCard, borderRadius: radius.full, borderWidth: 1, borderColor: colors.metalBorder, paddingHorizontal: 14, paddingVertical: 9 },
  filterChipActive: { borderColor: colors.primaryBorder, backgroundColor: colors.primaryGlow },
  filterChipText: { color: colors.silverLight, fontSize: 12, fontWeight: '800' },
  filterChipTextActive: { color: colors.primary },
  centerCard: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.metalBorder, padding: 22, alignItems: 'center' },
  emptyTitle: { color: colors.white, fontWeight: '900', fontSize: 18, marginBottom: 8 },
  emptySub: { color: colors.silver, fontSize: 13, textAlign: 'center', lineHeight: 21 },
  card: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 12, ...shadows.card },
  cardFeatured: { borderColor: colors.gold, borderWidth: 2 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  topRowCompact: { alignItems: 'flex-start', gap: 8 },
  typeBadge: { backgroundColor: colors.primaryGlow, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.primaryBorder },
  typeText: { color: colors.primary, fontWeight: '900', fontSize: 11 },
  status: { color: colors.silver, fontSize: 11, fontWeight: '700' },
  title: { color: colors.white, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: colors.silverLight, fontSize: 13, marginBottom: 8 },
  price: { color: colors.primary, fontSize: 14, fontWeight: '900', marginBottom: 14 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionsRowCompact: { flexWrap: 'wrap' },
  actionBtnCompact: { minWidth: '48%' },
  editBtn: { flex: 1, backgroundColor: colors.metal, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.metalBorder },
  editText: { color: colors.white, fontWeight: '800' },
  statusBtn: { flex: 1, backgroundColor: colors.dark, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.primaryBorder },
  statusBtnText: { color: colors.primary, fontWeight: '900', fontSize: 12 },
  deleteBtn: { flex: 1, backgroundColor: colors.primaryGlow, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.primaryBorder },
  deleteText: { color: colors.primary, fontWeight: '900' },
  featureBtn: { flex: 1, backgroundColor: colors.dark, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.metalBorder },
  featureBtnActive: { backgroundColor: colors.metal, borderColor: colors.gold },
  featureText: { color: colors.silverLight, fontWeight: '900', fontSize: 12 },
  featureTextActive: { color: colors.gold },
});