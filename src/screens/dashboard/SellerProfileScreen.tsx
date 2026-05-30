import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ref as dbRef, update } from '@react-native-firebase/database';

import LazyImage from '../../components/LazyImage';
import GccPhoneInput from '../../components/GccPhoneInput';
import { useAuth } from '../../hooks/useAuth';
import { deleteUserAccountFromMarketplace } from '../../lib/adminUserManagement';
import { db } from '../../lib/firebase';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { prefetchListingImages } from '../../lib/listingFeed';
import { sortListingsByFreshnessAndStatus } from '../../lib/listingSort';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { Car, Part, Request, User } from '../../types';
import { buildE164, parseToGccNumber, toWaMeDigits, type GccCountry } from '../../lib/gccPhone';

const INITIAL_SELLER_FEED_ITEMS = 10;
const INITIAL_SELLER_IMAGE_PREFETCH = 6;

type SellerFeedItem =
  | { type: 'car'; item: Car }
  | { type: 'part'; item: Part }
  | { type: 'request'; item: Request };

export default function SellerProfileScreen({ route, navigation }: any) {
  const { user, adminUpdateUserContactInfo } = useAuth();
  const { sellerId, sellerName, sellerWhatsapp, sellerPhone } = route.params;
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [sellerUser, setSellerUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(false);

  const canEditSellerContacts = Boolean(user?.isAdmin || user?.isSuperAdmin);
  const isGuestSeller = String(sellerId || '').startsWith('guest-');
  const canEditThisSellerContacts = canEditSellerContacts && !isGuestSeller && Boolean(sellerUser) && !Boolean(sellerUser?.deletedAt);

  const [sellerPhoneCountry, setSellerPhoneCountry] = useState<GccCountry['code']>('KW');
  const [sellerPhoneNational, setSellerPhoneNational] = useState('');
  const [sellerWhatsappCountry, setSellerWhatsappCountry] = useState<GccCountry['code']>('KW');
  const [sellerWhatsappNational, setSellerWhatsappNational] = useState('');

  useEffect(() => {
    const parsedPhone = parseToGccNumber(String(sellerUser?.phone || ''), { defaultCountry: 'KW' });
    const parsedWhatsapp = parseToGccNumber(String(sellerUser?.whatsapp || ''), { defaultCountry: 'KW' });
    setSellerPhoneCountry(parsedPhone.country);
    setSellerPhoneNational(parsedPhone.nationalNumber);
    setSellerWhatsappCountry(parsedWhatsapp.country);
    setSellerWhatsappNational(parsedWhatsapp.nationalNumber);
  }, [sellerUser?.phone, sellerUser?.whatsapp]);

  const loadSellerData = useCallback(async () => {
    const [carsSnap, partsSnap, requestsSnap, userSnap] = await Promise.all([
      getDbSnapshot(dbRef(db, 'cars'), 'cars'),
      getDbSnapshot(dbRef(db, 'parts'), 'parts'),
      getDbSnapshot(dbRef(db, 'requests'), 'requests'),
      getDbSnapshot(dbRef(db, `users/${sellerId}`), `users/${sellerId}`, { showAlert: false }),
    ]);

    const nextCars: Car[] = [];
    const nextParts: Part[] = [];
    const nextRequests: Request[] = [];

    carsSnap.forEach((child: any) => {
      const value = child.val();
      if (value?.userId === sellerId) nextCars.push({ id: child.key, ...value });
      return undefined;
    });

    partsSnap.forEach((child: any) => {
      const value = child.val();
      if (value?.userId === sellerId && value?.category?.trim() !== 'عادم') nextParts.push({ id: child.key, ...value });
      return undefined;
    });

    requestsSnap.forEach((child: any) => {
      const value = child.val();
      if (value?.userId === sellerId) nextRequests.push({ id: child.key, ...value });
      return undefined;
    });

    const sortedCars = sortListingsByFreshnessAndStatus(nextCars);
    const sortedParts = sortListingsByFreshnessAndStatus(nextParts);
    const sortedRequests = sortListingsByFreshnessAndStatus(nextRequests);

    setCars(sortedCars);
    setParts(sortedParts);
    setRequests(sortedRequests);
    setSellerUser(userSnap.exists() ? { uid: sellerId, ...userSnap.val() } : null);

    await prefetchListingImages(
      [...sortedCars, ...sortedParts, ...sortedRequests].slice(0, INITIAL_SELLER_IMAGE_PREFETCH),
      INITIAL_SELLER_IMAGE_PREFETCH,
    );
  }, [sellerId]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await loadSellerData();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [loadSellerData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSellerData();
    } finally {
      setRefreshing(false);
    }
  };

  const feed = useMemo<SellerFeedItem[]>(() => {
    const carFeed = cars.map(item => ({ type: 'car' as const, item }));
    const partFeed = parts.map(item => ({ type: 'part' as const, item }));
    const requestFeed = requests.map(item => ({ type: 'request' as const, item }));
    return [...carFeed, ...partFeed, ...requestFeed].sort((left, right) => {
      const leftStatus = left.item?.status;
      const rightStatus = right.item?.status;
      if ((leftStatus === 'sold' || leftStatus === 'closed') !== (rightStatus === 'sold' || rightStatus === 'closed')) {
        return leftStatus === 'sold' || leftStatus === 'closed' ? 1 : -1;
      }

      const leftTime = left.item?.updatedAt || left.item?.createdAt || 0;
      const rightTime = right.item?.updatedAt || right.item?.createdAt || 0;
      return String(rightTime).localeCompare(String(leftTime));
    });
  }, [cars, parts, requests]);

  const visibleFeed = useMemo(() => feed.slice(0, INITIAL_SELLER_FEED_ITEMS), [feed]);


  const openWhatsApp = () => {
    const phone = String(sellerUser?.whatsapp || sellerUser?.phone || sellerWhatsapp || sellerPhone || '').replace(/[^0-9]/g, '');
    if (!phone) {
      Alert.alert('تنبيه', 'لا يوجد رقم واتساب لهذا المستخدم');
      return;
    }
    Linking.openURL(`https://wa.me/${toWaMeDigits(phone)}?text=${encodeURIComponent(`مرحبا ${sellerName}، عندي اهتمام بمعروضاتك في Q8 Sport Market`)}`);
  };

  const openCall = () => {
    const phone = String(sellerUser?.phone || sellerPhone || sellerUser?.whatsapp || sellerWhatsapp || '').replace(/[^0-9]/g, '');
    if (!phone) {
      Alert.alert('تنبيه', 'لا يوجد رقم اتصال لهذا المستخدم');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const hasCallNumber = Boolean(String(sellerUser?.phone || sellerPhone || '').replace(/[^0-9]/g, ''));

  const isAdminViewer = Boolean(user?.isSuperAdmin);
  const isSelfProfile = user?.uid === sellerId;

  const saveSellerContacts = async () => {
    if (!sellerUser) return;
    if (!canEditThisSellerContacts) {
      Alert.alert('تنبيه', 'لا تملك صلاحية تعديل بيانات هذا المستخدم');
      return;
    }

    const nextPhone = buildE164(sellerPhoneCountry, sellerPhoneNational);
    const nextWhatsapp = buildE164(sellerWhatsappCountry, sellerWhatsappNational);

    setUpdatingUser(true);
    try {
      await adminUpdateUserContactInfo(sellerId, { phone: nextPhone, whatsapp: nextWhatsapp });
      await loadSellerData();
      Alert.alert('تم', 'تم تحديث بيانات الهاتف والواتساب');
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر تحديث بيانات التواصل');
    } finally {
      setUpdatingUser(false);
    }
  };

  const toggleSellerAdmin = async () => {
    if (!sellerUser) return;
    if (sellerUser.deletedAt) {
      Alert.alert('تنبيه', 'هذا الحساب محذوف بالفعل');
      return;
    }
    if (sellerUser.isSuperAdmin) {
      Alert.alert('تنبيه', 'لا يمكن سحب صلاحية السوبر أدمن');
      return;
    }
    if (isSelfProfile) {
      Alert.alert('تنبيه', 'ما تقدر تغير صلاحية إدارتك من هذه الصفحة');
      return;
    }

    setUpdatingUser(true);
    try {
      await update(dbRef(db, `users/${sellerId}`), {
        isAdmin: !sellerUser.isAdmin,
        updatedAt: Date.now(),
      });
      await loadSellerData();
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر تحديث صلاحية الإدارة');
    } finally {
      setUpdatingUser(false);
    }
  };

  const toggleSellerDisabled = async () => {
    if (!sellerUser) return;
    if (sellerUser.deletedAt) {
      Alert.alert('تنبيه', 'هذا الحساب محذوف بالفعل');
      return;
    }
    if (sellerUser.isSuperAdmin) {
      Alert.alert('تنبيه', 'لا يمكن تعطيل حساب السوبر أدمن');
      return;
    }
    if (isSelfProfile) {
      Alert.alert('تنبيه', 'ما تقدر تعطل حسابك من هذه الصفحة');
      return;
    }

    setUpdatingUser(true);
    try {
      await update(dbRef(db, `users/${sellerId}`), {
        disabled: !sellerUser.disabled,
        updatedAt: Date.now(),
      });
      await loadSellerData();
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر تحديث حالة الحساب');
    } finally {
      setUpdatingUser(false);
    }
  };

  const deleteSellerAccount = () => {
    if (!sellerUser) return;
    if (sellerUser.deletedAt) {
      Alert.alert('تنبيه', 'هذا الحساب محذوف بالفعل');
      return;
    }
    if (sellerUser.isSuperAdmin) {
      Alert.alert('تنبيه', 'لا يمكن حذف حساب السوبر أدمن');
      return;
    }
    if (isSelfProfile) {
      Alert.alert('تنبيه', 'ما تقدر حذف حسابك من هذه الصفحة');
      return;
    }

    Alert.alert(
      'حذف الحساب',
      `سيتم حذف حساب ${sellerName} من السوق مع كل معروضاته وطلباته. هذا الإجراء نهائي.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف الحساب',
          style: 'destructive',
          onPress: async () => {
            setUpdatingUser(true);
            try {
              await deleteUserAccountFromMarketplace({ uid: sellerId, email: sellerUser.email });
              await loadSellerData();
            } catch (error: any) {
              Alert.alert('خطأ', error?.message || 'تعذر حذف الحساب');
            } finally {
              setUpdatingUser(false);
            }
          },
        },
      ],
    );
  };

  const goToListing = (entry: SellerFeedItem) => {
    if (entry.type === 'car') {
      navigation.navigate('CarDetails', { id: entry.item.id });
      return;
    }
    if (entry.type === 'part') {
      navigation.navigate('PartDetails', { id: entry.item.id });
      return;
    }
  };

  return (
    <FlatList
      style={s.container}
      data={visibleFeed}
      keyExtractor={entry => `${entry.type}-${entry.item.id}`}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}
      removeClippedSubviews
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40 }}
      ListHeaderComponent={
        <>
          <View style={s.profileCard}>
            <View style={s.avatar}>
              {sellerUser?.avatar ? (
                <LazyImage
                  uri={sellerUser.avatar}
                  style={s.avatarImage}
                  fallback={<Text style={s.avatarText}>{sellerName?.[0] || '?'}</Text>}
                />
              ) : (
                <Text style={s.avatarText}>{sellerName?.[0] || '?'}</Text>
              )}
            </View>
            <Text style={s.name}>{sellerName}</Text>
            <Text style={s.handle}>معلن مباشر في السوق</Text>

            {sellerUser ? (
              <View style={s.badgesRow}>
                {sellerUser.isSuperAdmin ? (
                  <View style={s.adminBadge}><Text style={s.adminBadgeText}>سوبر أدمن</Text></View>
                ) : sellerUser.isAdmin ? (
                  <View style={s.adminBadge}><Text style={s.adminBadgeText}>أدمن</Text></View>
                ) : null}
                {sellerUser.disabled ? <View style={s.disabledBadge}><Text style={s.disabledBadgeText}>الحساب معطل</Text></View> : null}
                {sellerUser.deletedAt ? <View style={s.deletedBadge}><Text style={s.deletedBadgeText}>الحساب محذوف</Text></View> : null}
              </View>
            ) : null}

            <View style={s.statsRow}>
              <Stat label="سيارات" value={cars.length} />
              <Stat label="قطع" value={parts.length} />
              <Stat label="مطلوبات" value={requests.length} />
            </View>

            <View style={s.trustCard}>
              <Text style={s.trustTitle}>مؤشرات الثقة</Text>
              <Text style={s.trustLine}>عضو نشط مع {cars.length + parts.length + requests.length} إعلان ظاهر في السوق</Text>
              <Text style={s.trustLine}>تواصل مباشر على الواتساب بدون وسيط</Text>
            </View>

            <TouchableOpacity style={s.cta} activeOpacity={0.88} onPress={openWhatsApp}>
              <Text style={s.ctaText}>💬 واتساب</Text>
            </TouchableOpacity>

            {hasCallNumber ? (
              <TouchableOpacity style={[s.cta, s.callCta]} activeOpacity={0.88} onPress={openCall}>
                <Text style={s.callCtaText}>📞 اتصال</Text>
              </TouchableOpacity>
            ) : null}

            {isAdminViewer ? (
              <View style={s.adminToolsCard}>
                <Text style={s.adminToolsTitle}>أدوات الإدارة</Text>
                <Text style={s.adminToolsSub}>تحكم بالحساب مباشرة من صفحة التفاصيل.</Text>
                <View style={s.adminActionsRow}>
                  <TouchableOpacity
                    style={[s.deleteActionBtn, (updatingUser || isSelfProfile || Boolean(sellerUser?.deletedAt)) && s.adminActionDisabled]}
                    activeOpacity={0.85}
                    disabled={updatingUser || isSelfProfile || !sellerUser || Boolean(sellerUser?.deletedAt)}
                    onPress={deleteSellerAccount}
                  >
                    <Text style={s.deleteActionText}>{updatingUser ? 'جاري التحديث...' : 'حذف الحساب'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.adminActionBtn, sellerUser?.disabled ? s.adminActionPrimary : s.adminActionMuted, (updatingUser || isSelfProfile) && s.adminActionDisabled]}
                    activeOpacity={0.85}
                    disabled={updatingUser || isSelfProfile || !sellerUser || Boolean(sellerUser?.deletedAt)}
                    onPress={toggleSellerDisabled}
                  >
                    <Text style={[s.adminActionText, sellerUser?.disabled ? s.adminActionTextPrimary : s.adminActionTextMuted]}>
                      {updatingUser ? 'جاري التحديث...' : sellerUser?.disabled ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.adminActionBtn, sellerUser?.isAdmin ? s.adminActionMuted : s.adminActionPrimary, (updatingUser || isSelfProfile) && s.adminActionDisabled]}
                    activeOpacity={0.85}
                    disabled={updatingUser || isSelfProfile || !sellerUser || Boolean(sellerUser?.deletedAt)}
                    onPress={toggleSellerAdmin}
                  >
                    <Text style={[s.adminActionText, sellerUser?.isAdmin ? s.adminActionTextMuted : s.adminActionTextPrimary]}>
                      {updatingUser ? 'جاري التحديث...' : sellerUser?.isAdmin ? 'سحب الإدارة' : 'منح الإدارة'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {canEditThisSellerContacts ? (
              <View style={s.adminToolsCard}>
                <Text style={s.adminToolsTitle}>تعديل بروفايل المستخدم</Text>
                <Text style={s.adminToolsSub}>يتم تعديل بيانات الحساب (وليس بيانات الإعلان).</Text>

                <Text style={s.contactLabel}>رقم الهاتف (البروفايل)</Text>
                <GccPhoneInput
                  icon="📞"
                  country={sellerPhoneCountry}
                  onCountryChange={setSellerPhoneCountry}
                  nationalNumber={sellerPhoneNational}
                  onNationalNumberChange={setSellerPhoneNational}
                  placeholder="اكتب الرقم بدون فتح الخط"
                  editable={!updatingUser}
                />

                <Text style={[s.contactLabel, { marginTop: 12 }]}>رقم واتساب (البروفايل)</Text>
                <GccPhoneInput
                  icon="💬"
                  country={sellerWhatsappCountry}
                  onCountryChange={setSellerWhatsappCountry}
                  nationalNumber={sellerWhatsappNational}
                  onNationalNumberChange={setSellerWhatsappNational}
                  placeholder="اكتب الرقم بدون فتح الخط"
                  editable={!updatingUser}
                />

                <TouchableOpacity
                  style={[s.saveContactsBtn, updatingUser && s.adminActionDisabled]}
                  activeOpacity={0.85}
                  disabled={updatingUser}
                  onPress={saveSellerContacts}
                >
                  <Text style={s.saveContactsText}>{updatingUser ? 'جاري الحفظ...' : 'حفظ التعديل'}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>كل معروضاته</Text>
            <Text style={s.sectionSub}>{loading ? 'جاري التحميل...' : `${feed.length} عنصر`}</Text>
          </View>
        </>
      }
      ListEmptyComponent={
        !loading ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>لا توجد معروضات حالياً</Text>
            <Text style={s.emptySub}>يمكن التواصل مع المعلن مباشرة إذا كان عنده شيء متوفر قريبًا.</Text>
          </View>
        ) : null
      }
      renderItem={({ item: entry }) => (
        <TouchableOpacity
          activeOpacity={0.88}
          style={s.itemCard}
          onPress={() => entry.type !== 'request' && goToListing(entry)}
          disabled={entry.type === 'request'}
        >
          <View style={s.itemTopRow}>
            <View style={s.badge}><Text style={s.badgeText}>{entry.type === 'car' ? 'سيارة' : entry.type === 'part' ? 'قطعة' : 'مطلوب'}</Text></View>
            <Text style={s.itemStatus}>{entry.item.status}</Text>
          </View>
          <Text style={s.itemTitle}>{entry.item.title?.ar}</Text>
          <Text style={s.itemMeta}>
            {entry.type === 'car'
              ? `${entry.item.brand} • ${entry.item.model} • ${entry.item.year}`
              : entry.type === 'part'
                ? `${entry.item.category} • ${(entry.item.compatibleBrands || []).slice(0, 2).join(' • ') || 'توافق غير محدد'}`
                : entry.item.description?.ar}
          </Text>
          <Text style={s.itemPrice}>
            {entry.type === 'request'
              ? entry.item.budget ? `${entry.item.budget.toLocaleString()} د.ك` : 'بدون ميزانية محددة'
              : `${entry.item.price?.toLocaleString()} د.ك`}
          </Text>
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  profileCard: { backgroundColor: colors.darkCard, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.primaryBorder, padding: 22, marginBottom: 18, ...shadows.card },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginBottom: 14, alignSelf: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: colors.primary, fontSize: 28, fontWeight: '900' },
  name: { color: colors.white, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  handle: { color: colors.silver, fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 18 },
  badgesRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  adminBadge: { backgroundColor: colors.primaryGlow, borderRadius: radius.full, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: 12, paddingVertical: 5 },
  adminBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  disabledBadge: { backgroundColor: 'rgba(245, 158, 11, 0.16)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  disabledBadgeText: { color: colors.yellow, fontSize: 11, fontWeight: '900' },
  deletedBadge: { backgroundColor: 'rgba(227, 30, 36, 0.16)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  deletedBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
  statItem: { flex: 1, backgroundColor: colors.metal, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center' },
  statValue: { color: colors.white, fontSize: 20, fontWeight: '900' },
  statLabel: { color: colors.silver, fontSize: 11, marginTop: 4 },
  trustCard: { backgroundColor: colors.metal, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 16, marginBottom: 16 },
  trustTitle: { color: colors.white, fontSize: 15, fontWeight: '900', marginBottom: 10 },
  trustLine: { color: colors.silverLight, fontSize: 13, lineHeight: 20, marginBottom: 4 },
  cta: { backgroundColor: colors.whatsapp, borderRadius: radius.xl, paddingVertical: 15, alignItems: 'center' },
  ctaText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  callCta: { backgroundColor: colors.metal, borderWidth: 1, borderColor: colors.metalBorder, marginTop: 10 },
  callCtaText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  adminToolsCard: { backgroundColor: colors.metal, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 16, marginTop: 14 },
  adminToolsTitle: { color: colors.white, fontSize: 15, fontWeight: '900' },
  adminToolsSub: { color: colors.silver, fontSize: 12, marginTop: 4, marginBottom: 12 },
  adminActionsRow: { flexDirection: 'row', gap: 10 },
  contactLabel: { color: colors.silver, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  saveContactsBtn: { marginTop: 14, backgroundColor: colors.primaryGlow, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primaryBorder, paddingVertical: 13, alignItems: 'center' },
  saveContactsText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  adminActionBtn: { flex: 1, borderRadius: radius.lg, borderWidth: 1, paddingVertical: 13, alignItems: 'center' },
  adminActionPrimary: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
  adminActionMuted: { backgroundColor: colors.darkCard, borderColor: colors.metalBorder },
  adminActionDisabled: { opacity: 0.5 },
  adminActionText: { fontSize: 13, fontWeight: '900' },
  adminActionTextPrimary: { color: colors.primary },
  adminActionTextMuted: { color: colors.silverLight },
  deleteActionBtn: { flex: 1, borderRadius: radius.lg, borderWidth: 1, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(227, 30, 36, 0.12)', borderColor: colors.primaryBorder },
  deleteActionText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '900' },
  sectionSub: { color: colors.silver, fontSize: 12 },
  emptyCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 20, alignItems: 'center' },
  emptyTitle: { color: colors.white, fontSize: 17, fontWeight: '900', marginBottom: 8 },
  emptySub: { color: colors.silver, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  itemCard: { backgroundColor: colors.darkCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.metalBorder, padding: 18, marginBottom: 12, ...shadows.card },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { backgroundColor: colors.primaryGlow, borderRadius: radius.full, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  itemStatus: { color: colors.silver, fontSize: 11, fontWeight: '700' },
  itemTitle: { color: colors.white, fontSize: 17, fontWeight: '900', marginBottom: 6 },
  itemMeta: { color: colors.silverLight, fontSize: 13, lineHeight: 20, marginBottom: 8 },
  itemPrice: { color: colors.primary, fontWeight: '900', fontSize: 14 },
});