import React from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { push, ref as dbRef, remove, set, update } from '@react-native-firebase/database';

import FastAdImage from '../../components/FastAdImage';
import { useAuth } from '../../hooks/useAuth';
import { auth, db } from '../../lib/firebase';
import { getDbSnapshot } from '../../lib/firebaseDatabase';
import { uploadListingMedia } from '../../lib/listingImages';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import { t } from '../../i18n';

type RepeatType = 'every_open' | 'daily' | 'weekly' | 'once';
type LinkType = 'none' | 'internal' | 'external';

type PopupAd = {
  id: string;
  title?: string | null;
  description?: string | null;
  imageUrl: string;
  mediumUrl?: string | null;
  thumbnailUrl?: string | null;
  isActive: boolean;
  startDate: number;
  endDate: number;
  repeatType: RepeatType;
  priority: number;
  linkType: LinkType;
  linkUrl?: string | null;
  createdAt?: number;
  updatedAt?: number;
};

type FormState = {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  mediumUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
  startDate: string; // "YYYY-MM-DDTHH:mm"
  endDate: string;
  repeatType: RepeatType;
  priority: string;
  linkType: LinkType;
  linkUrl: string;
};

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function toLocalInputValue(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function msFromLocalInputValue(v: string) {
  const parsed = Date.parse(String(v || '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function emptyForm(): FormState {
  const now = Date.now();
  return {
    title: '',
    description: '',
    imageUrl: '',
    mediumUrl: '',
    thumbnailUrl: '',
    isActive: true,
    startDate: toLocalInputValue(now),
    endDate: toLocalInputValue(now + 7 * 24 * 60 * 60 * 1000),
    repeatType: 'daily',
    priority: '0',
    linkType: 'none',
    linkUrl: '',
  };
}

function sortPopupAds(items: PopupAd[]) {
  return [...items].sort((left, right) => {
    const lp = typeof left.priority === 'number' && Number.isFinite(left.priority) ? left.priority : 0;
    const rp = typeof right.priority === 'number' && Number.isFinite(right.priority) ? right.priority : 0;
    if (lp !== rp) return rp - lp;
    return Number(right.updatedAt || right.createdAt || 0) - Number(left.updatedAt || left.createdAt || 0);
  });
}

function RepeatChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.chip, active && s.chipActive]} activeOpacity={0.88} onPress={onPress}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function PopupAdsManagementScreen() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const screenPadding = width < 380 ? spacing.lg : spacing.xl;
  const compactScreen = width < 390;

  const [ads, setAds] = React.useState<PopupAd[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(() => emptyForm());
  const [refreshingPerms, setRefreshingPerms] = React.useState(false);

  const [selectedImageUri, setSelectedImageUri] = React.useState<string | null>(null);
  const [selectedPreviewUri, setSelectedPreviewUri] = React.useState<string | null>(null);

  const isSuperAdmin = Boolean(user?.isSuperAdmin);

  const refreshPermissions = React.useCallback(async () => {
    setRefreshingPerms(true);
    try {
      const current = auth.currentUser;
      if (!current) {
        Alert.alert(t('loginErrorTitle'), 'not_authenticated');
        return;
      }

      await current.getIdToken(true);
      let tokenResult = await current.getIdTokenResult();
      let hasClaim = tokenResult?.claims?.superAdmin === true;

      if (!hasClaim && isSuperAdmin) {
        try {
          const idToken = await current.getIdToken();
          const resp = await fetch('https://europe-west1-q8sportcar.cloudfunctions.net/bootstrapSuperAdminClaim', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            throw new Error(text || `bootstrap_failed_${resp.status}`);
          }

          await current.getIdToken(true);
          tokenResult = await current.getIdTokenResult();
          hasClaim = tokenResult?.claims?.superAdmin === true;
        } catch (e: any) {
          Alert.alert('الصلاحيات', e?.message || 'تعذر تفعيل صلاحية السوبر أدمن');
        }
      }

      Alert.alert(
        'الصلاحيات',
        hasClaim
          ? '✅ superAdmin claim موجود. تقدر ترفع الصور.'
          : '❌ superAdmin claim غير موجود. انتظر مزامنة الفنكشن أو سجّل خروج/دخول.',
      );
    } catch (error: any) {
      Alert.alert(t('loginErrorTitle'), error?.message || 'تعذر تحديث الصلاحيات');
    } finally {
      setRefreshingPerms(false);
    }
  }, [isSuperAdmin]);

  const loadAds = React.useCallback(async () => {
    if (!isSuperAdmin) return;

    const snap = await getDbSnapshot(dbRef(db, 'popupAds'), 'popupAds', { showAlert: false });
    const items: PopupAd[] = [];

    snap.forEach((child: any) => {
      const id = child.key;
      const value = child.val?.();
      if (!id || !value) return undefined;
      items.push({ id, ...value });
      return undefined;
    });

    setAds(sortPopupAds(items));
  }, [isSuperAdmin]);

  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!isSuperAdmin) {
        setLoading(false);
        return;
      }

      try {
        await loadAds();
      } catch (error: any) {
        if (mounted) {
          Alert.alert(t('loginErrorTitle'), error?.message || 'تعذر تحميل الإعلانات');
        }
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
  }, [isSuperAdmin, loadAds]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAds();
    } catch (error: any) {
      Alert.alert(t('loginErrorTitle'), error?.message || 'تعذر تحديث القائمة');
    } finally {
      setRefreshing(false);
    }
  }, [loadAds]);

  const resetForm = () => {
    setForm(emptyForm());
    setSelectedImageUri(null);
    setSelectedPreviewUri(null);
  };

  const selectAd = (ad: PopupAd) => {
    setForm({
      id: ad.id,
      title: ad.title || '',
      description: ad.description || '',
      imageUrl: ad.imageUrl || '',
      mediumUrl: String(ad.mediumUrl || ''),
      thumbnailUrl: String(ad.thumbnailUrl || ''),
      isActive: Boolean(ad.isActive),
      startDate: toLocalInputValue(Number(ad.startDate || Date.now())),
      endDate: toLocalInputValue(Number(ad.endDate || Date.now() + 7 * 24 * 60 * 60 * 1000)),
      repeatType: (ad.repeatType || 'every_open') as RepeatType,
      priority: String(Number(ad.priority || 0)),
      linkType: (ad.linkType || 'none') as LinkType,
      linkUrl: ad.linkUrl || '',
    });

    setSelectedImageUri(null);
    setSelectedPreviewUri(String(ad.thumbnailUrl || ad.imageUrl || ''));
  };

  const pickImage = async () => {
    if (!isSuperAdmin) {
      Alert.alert(t('warningTitle'), 'هذه الصفحة للسوبر أدمن فقط');
      return;
    }

    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8 });
    if (result.didCancel) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setSelectedImageUri(asset.uri);
    setSelectedPreviewUri(asset.uri);
  };

  const saveAd = async () => {
    if (!user?.isSuperAdmin || !user.uid) {
      Alert.alert(t('warningTitle'), 'هذه الصفحة للسوبر أدمن فقط');
      return;
    }

    const startMs = msFromLocalInputValue(form.startDate);
    const endMs = msFromLocalInputValue(form.endDate);

    if (!startMs || !endMs || startMs >= endMs) {
      Alert.alert(t('warningTitle'), 'تواريخ غير صحيحة');
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(form.id);

      const popupRef = isEdit
        ? dbRef(db, `popupAds/${String(form.id)}`)
        : push(dbRef(db, 'popupAds'));
      const popupId = isEdit ? String(form.id) : popupRef.key;
      if (!popupId) throw new Error('تعذر إنشاء رقم الإعلان');

      let imageUrl = form.imageUrl.trim();
      let mediumUrl = form.mediumUrl.trim();
      let thumbnailUrl = form.thumbnailUrl.trim();

      if (selectedImageUri) {
        try {
          await auth.currentUser?.getIdToken(true);
        } catch {
          // ignore
        }
        const media = await uploadListingMedia('popup-ads', popupId, [{ image: selectedImageUri }]);
        imageUrl = media.imageUrl;
        mediumUrl = media.mediumUrl;
        thumbnailUrl = media.thumbnailUrl;
      }

      if (!imageUrl) {
        Alert.alert(t('warningTitle'), 'الصورة مطلوبة');
        return;
      }

      const payload = {
        title: form.title.trim() || '',
        description: form.description.trim() || '',
        imageUrl,
        mediumUrl,
        thumbnailUrl,
        isActive: Boolean(form.isActive),
        startDate: startMs,
        endDate: endMs,
        repeatType: form.repeatType,
        priority: Number(form.priority || '0') || 0,
        linkType: form.linkType,
        linkUrl: form.linkUrl.trim() || '',
      };

      if (isEdit) {
        await update(popupRef, { ...payload, updatedAt: Date.now() });
      } else {
        await set(popupRef, {
          ...payload,
          createdBy: user.uid,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      await loadAds();
      if (!isEdit) resetForm();
      setSelectedImageUri(null);
      Alert.alert(t('successTitle'), isEdit ? 'تم حفظ التعديل' : 'تمت إضافة الإعلان');
    } catch (error: any) {
      Alert.alert(t('loginErrorTitle'), error?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: PopupAd) => {
    if (!user?.isSuperAdmin) return;
    setBusyId(ad.id);
    try {
      await update(dbRef(db, `popupAds/${ad.id}`), {
        isActive: !ad.isActive,
        updatedAt: Date.now(),
      });
      await loadAds();
    } catch (error: any) {
      Alert.alert(t('loginErrorTitle'), error?.message || 'تعذر تحديث الحالة');
    } finally {
      setBusyId(null);
    }
  };

  const deleteAd = async (ad: PopupAd) => {
    if (!user?.isSuperAdmin) return;

    Alert.alert(t('confirmTitle'), `حذف الإعلان: ${ad.title?.trim() || t('untitled')}؟`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          setBusyId(ad.id);
          try {
            await remove(dbRef(db, `popupAds/${ad.id}`));

            if (form.id === ad.id) resetForm();
            await loadAds();
          } catch (error: any) {
            Alert.alert(t('loginErrorTitle'), error?.message || 'تعذر حذف الإعلان');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  if (!isSuperAdmin) {
    return (
      <View style={s.centeredState}>
        <Text style={s.centeredTitle}>هذه الصفحة للسوبر أدمن فقط</Text>
        <Text style={s.centeredSub}>سجّل دخولك بحساب سوبر أدمن عشان تقدر تضيف Popup Ads.</Text>
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
        <View style={s.heroHeader}>
          <View style={s.heroHeaderLeft}>
            <Text style={s.heroTitle}>Popup Ads</Text>
            <Text style={s.heroSub}>إعلانات افتتاحية تظهر للمستخدم حسب التكرار والأولوية</Text>
          </View>

          <TouchableOpacity
            style={[s.secondaryBtn, refreshingPerms && s.secondaryBtnDisabled]}
            activeOpacity={0.88}
            onPress={refreshPermissions}
            disabled={refreshingPerms}
          >
            <Text style={s.secondaryBtnText}>{refreshingPerms ? '...' : 'تحديث الصلاحيات'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.formCard}>
        <View style={[s.formHeader, compactScreen && s.formHeaderCompact]}>
          <Text style={s.sectionTitle}>{form.id ? 'تعديل إعلان' : 'إضافة إعلان'}</Text>
          <TouchableOpacity style={s.secondaryBtn} activeOpacity={0.88} onPress={resetForm}>
            <Text style={s.secondaryBtnText}>➕ إعلان جديد</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.fieldLabel}>الصورة</Text>
        <TouchableOpacity style={s.imagePicker} activeOpacity={0.88} onPress={pickImage}>
          <Text style={s.imagePickerText}>{selectedPreviewUri || form.imageUrl ? 'تغيير الصورة' : '📸 اختر صورة'}</Text>
          <Text style={s.imagePickerHint}>يفضل صورة واضحة ومناسبة للموبايل</Text>
        </TouchableOpacity>

        {selectedPreviewUri || form.imageUrl ? (
          <View style={s.previewCard}>
            <FastAdImage uri={selectedPreviewUri || form.thumbnailUrl || form.imageUrl} style={s.previewImage} placeholderColor={colors.darkLight} showWatermark={false} />
          </View>
        ) : null}

        <Text style={s.fieldLabel}>العنوان (اختياري)</Text>
        <TextInput
          value={form.title}
          onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
          placeholder="مثال: افتتاح الفرع الجديد"
          placeholderTextColor={colors.silver + '88'}
          style={s.input}
        />

        <Text style={s.fieldLabel}>الوصف (اختياري)</Text>
        <TextInput
          value={form.description}
          onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
          placeholder="تفاصيل بسيطة..."
          placeholderTextColor={colors.silver + '88'}
          style={[s.input, s.textarea]}
          multiline
        />

        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.fieldLabel}>تاريخ البداية</Text>
            <TextInput
              value={form.startDate}
              onChangeText={(v) => setForm((p) => ({ ...p, startDate: v }))}
              placeholder="YYYY-MM-DDTHH:mm"
              placeholderTextColor={colors.silver + '88'}
              style={s.input}
              autoCapitalize="none"
            />
          </View>
          <View style={s.col}>
            <Text style={s.fieldLabel}>تاريخ النهاية</Text>
            <TextInput
              value={form.endDate}
              onChangeText={(v) => setForm((p) => ({ ...p, endDate: v }))}
              placeholder="YYYY-MM-DDTHH:mm"
              placeholderTextColor={colors.silver + '88'}
              style={s.input}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.fieldLabel}>الأولوية</Text>
            <TextInput
              value={form.priority}
              onChangeText={(v) => setForm((p) => ({ ...p, priority: v }))}
              placeholder="0"
              placeholderTextColor={colors.silver + '88'}
              style={s.input}
              keyboardType="numeric"
            />
          </View>
          <View style={s.col}>
            <Text style={s.fieldLabel}>الحالة</Text>
            <TouchableOpacity
              style={[s.toggleBtn, form.isActive ? s.toggleBtnOn : s.toggleBtnOff]}
              activeOpacity={0.88}
              onPress={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            >
              <Text style={[s.toggleText, form.isActive ? s.toggleTextOn : s.toggleTextOff]}>{form.isActive ? 'مفعّل' : 'معطّل'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.fieldLabel}>التكرار</Text>
        <View style={s.chipRow}>
          <RepeatChip label="كل فتح" active={form.repeatType === 'every_open'} onPress={() => setForm((p) => ({ ...p, repeatType: 'every_open' }))} />
          <RepeatChip label="كل 24 ساعة" active={form.repeatType === 'daily'} onPress={() => setForm((p) => ({ ...p, repeatType: 'daily' }))} />
          <RepeatChip label="كل 7 أيام" active={form.repeatType === 'weekly'} onPress={() => setForm((p) => ({ ...p, repeatType: 'weekly' }))} />
          <RepeatChip label="مرة واحدة" active={form.repeatType === 'once'} onPress={() => setForm((p) => ({ ...p, repeatType: 'once' }))} />
        </View>

        <Text style={s.fieldLabel}>نوع الرابط (اختياري)</Text>
        <View style={s.chipRow}>
          <RepeatChip label="بدون" active={form.linkType === 'none'} onPress={() => setForm((p) => ({ ...p, linkType: 'none' }))} />
          <RepeatChip label="خارجي" active={form.linkType === 'external'} onPress={() => setForm((p) => ({ ...p, linkType: 'external' }))} />
          <RepeatChip label="داخلي" active={form.linkType === 'internal'} onPress={() => setForm((p) => ({ ...p, linkType: 'internal' }))} />
        </View>

        <Text style={s.fieldLabel}>الرابط</Text>
        <TextInput
          value={form.linkUrl}
          onChangeText={(v) => setForm((p) => ({ ...p, linkUrl: v }))}
          placeholder={form.linkType === 'internal' ? 'مثال: CarsTab' : 'https://...'}
          placeholderTextColor={colors.silver + '88'}
          style={s.input}
          autoCapitalize="none"
        />

        <TouchableOpacity style={[s.primaryBtn, saving && s.primaryBtnDisabled]} activeOpacity={0.88} onPress={saveAd} disabled={saving}>
          <Text style={s.primaryBtnText}>{saving ? t('savingShort') : (form.id ? 'حفظ التعديل' : 'إضافة الإعلان')}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.listCard}>
        <View style={[s.listHeader, compactScreen && s.listHeaderCompact]}>
          <Text style={s.sectionTitle}>القائمة</Text>
          <View style={s.statPill}><Text style={s.statPillText}>{ads.length} إعلان</Text></View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={s.loading} />
        ) : ads.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyTitle}>لا توجد إعلانات</Text>
            <Text style={s.emptySub}>أضف أول إعلان من النموذج أعلاه</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {ads.map((ad) => {
              const isBusy = busyId === ad.id;
              const badgeText = ad.isActive ? 'Active' : 'Disabled';

              return (
                <View key={ad.id} style={s.adCard}>
                  <View style={s.adRow}>
                    <View style={s.adThumb}>
                      <FastAdImage uri={String(ad.thumbnailUrl || ad.imageUrl)} style={s.adThumbImg} placeholderColor={colors.darkLight} showWatermark={false} />
                    </View>

                    <View style={s.adMain}>
                      <View style={s.adBadges}>
                        <View style={[s.badge, ad.isActive ? s.badgeOn : s.badgeOff]}>
                          <Text style={[s.badgeText, ad.isActive ? s.badgeTextOn : s.badgeTextOff]}>{badgeText}</Text>
                        </View>
                        <View style={s.badgeNeutral}>
                          <Text style={s.badgeNeutralText}>Priority: {ad.priority}</Text>
                        </View>
                        <View style={s.badgeNeutral}>
                          <Text style={s.badgeNeutralText}>{ad.repeatType}</Text>
                        </View>
                      </View>

                      <Text style={s.adTitle} numberOfLines={1}>{ad.title || '(بدون عنوان)'}</Text>
                      <Text style={s.adDates} numberOfLines={2}>
                        {new Date(ad.startDate).toLocaleString('ar-KW')} → {new Date(ad.endDate).toLocaleString('ar-KW')}
                      </Text>
                    </View>
                  </View>

                  <View style={s.adActions}>
                    <TouchableOpacity style={s.actionBtn} activeOpacity={0.88} onPress={() => selectAd(ad)}>
                      <Text style={s.actionBtnText}>تعديل</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.actionBtn, s.actionBtnMuted]}
                      activeOpacity={0.88}
                      onPress={() => toggleActive(ad)}
                      disabled={isBusy}
                    >
                      <Text style={[s.actionBtnText, s.actionBtnTextMuted]}>{isBusy ? '...' : (ad.isActive ? 'تعطيل' : 'تفعيل')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.actionBtn, s.actionBtnDanger]}
                      activeOpacity={0.88}
                      onPress={() => deleteAd(ad)}
                      disabled={isBusy}
                    >
                      <Text style={[s.actionBtnText, s.actionBtnTextDanger]}>{isBusy ? '...' : t('delete')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },

  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.dark },
  centeredTitle: { color: colors.white, fontWeight: '900', fontSize: 18, textAlign: 'center' },
  centeredSub: { color: colors.silverLight, marginTop: 10, textAlign: 'center', lineHeight: 20 },

  heroCard: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.darkCard,
    padding: spacing.xl,
    overflow: 'hidden',
    ...shadows.glow,
  },
  heroHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  heroHeaderLeft: { flex: 1, minWidth: 0 },
  heroGlow: { ...StyleSheet.absoluteFillObject },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '900' },
  heroSub: { color: colors.silverLight, marginTop: 8, lineHeight: 20 },

  formCard: {
    marginTop: 16,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.darkCard,
    padding: spacing.xl,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  formHeaderCompact: { flexDirection: 'column', alignItems: 'stretch' },

  listCard: {
    marginTop: 16,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.darkCard,
    padding: spacing.xl,
  },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  listHeaderCompact: { flexDirection: 'column', alignItems: 'stretch' },

  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: '900' },

  fieldLabel: { color: colors.silverLight, marginTop: 14, marginBottom: 8, fontWeight: '800' },
  input: {
    backgroundColor: colors.metal,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    color: colors.white,
    fontWeight: '700',
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },

  row: { flexDirection: 'row', gap: 12, marginTop: 6 },
  col: { flex: 1 },

  imagePicker: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.metal,
    padding: spacing.lg,
  },
  imagePickerDisabled: { opacity: 0.7 },
  imagePickerText: { color: colors.white, fontWeight: '900' },
  imagePickerHint: { color: colors.silverLight, marginTop: 6, lineHeight: 18, fontSize: 12 },

  previewCard: {
    marginTop: 12,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.metal,
  },
  previewImage: { width: '100%', height: 220 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.metal,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: 'rgba(227,30,36,0.12)' },
  chipText: { color: colors.silverLight, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.primary },

  toggleBtn: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnOn: { borderColor: 'rgba(48,209,88,0.35)', backgroundColor: 'rgba(48,209,88,0.12)' },
  toggleBtnOff: { borderColor: colors.metalBorder, backgroundColor: colors.metal },
  toggleText: { fontWeight: '900' },
  toggleTextOn: { color: colors.green },
  toggleTextOff: { color: colors.silverLight },

  primaryBtn: {
    marginTop: 18,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: colors.white, fontWeight: '900' },

  secondaryBtn: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.metal,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryBtnDisabled: { opacity: 0.7 },
  secondaryBtnText: { color: colors.white, fontWeight: '800', fontSize: 12 },

  statPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.metal,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  statPillText: { color: colors.silverLight, fontWeight: '900', fontSize: 12 },

  loading: { marginTop: 22 },

  emptyState: { paddingVertical: 22, alignItems: 'center' },
  emptyTitle: { color: colors.white, fontWeight: '900' },
  emptySub: { color: colors.silverLight, marginTop: 8, textAlign: 'center', lineHeight: 20 },

  adCard: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.darkLight,
    padding: spacing.lg,
  },
  adRow: { flexDirection: 'row', gap: 12 },
  adThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.metal,
  },
  adThumbImg: { width: '100%', height: '100%' },
  adMain: { flex: 1, minWidth: 0 },

  adBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  badgeOn: { borderColor: 'rgba(48,209,88,0.25)', backgroundColor: 'rgba(48,209,88,0.10)' },
  badgeOff: { borderColor: colors.metalBorder, backgroundColor: colors.metal },
  badgeText: { fontSize: 10, fontWeight: '900' },
  badgeTextOn: { color: colors.green },
  badgeTextOff: { color: colors.silverLight },

  badgeNeutral: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.metalBorder, backgroundColor: colors.metal },
  badgeNeutralText: { fontSize: 10, fontWeight: '900', color: colors.silverLight },

  adTitle: { color: colors.white, fontWeight: '900', marginTop: 8 },
  adDates: { color: colors.silverLight, marginTop: 6, lineHeight: 18, fontSize: 12 },

  adActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  actionBtn: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.metal,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionBtnText: { color: colors.white, fontWeight: '900', fontSize: 12 },
  actionBtnMuted: { backgroundColor: colors.darkCard },
  actionBtnTextMuted: { color: colors.silverLight },
  actionBtnDanger: { borderColor: 'rgba(227,30,36,0.25)', backgroundColor: 'rgba(227,30,36,0.10)' },
  actionBtnTextDanger: { color: colors.primary },
});
