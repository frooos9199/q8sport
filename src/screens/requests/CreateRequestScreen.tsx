import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { push, ref as dbRef, serverTimestamp, set as dbSet, update } from '@react-native-firebase/database';

import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { colors, radius, shadows, spacing } from '../../lib/theme';
import PremiumButton from '../../components/PremiumButton';

type Category = 'car' | 'part' | 'other';

export default function CreateRequestScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const listing = route?.params?.listing;
  const isEditing = Boolean(listing?.id);

  const [category, setCategory] = useState<Category>(listing?.category || 'car');
  const [title, setTitle] = useState(listing?.title?.ar || '');
  const [description, setDescription] = useState(listing?.description?.ar || '');
  const [budget, setBudget] = useState(listing?.budget ? String(listing.budget) : '');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return title.trim().length >= 3 && description.trim().length >= 5 && !submitting;
  }, [description, submitting, title]);

  const submit = async () => {
    if (!user) {
      Alert.alert('تسجيل الدخول', 'لازم تسجل دخول عشان تنشئ طلب');
      navigation.navigate('Login');
      return;
    }

    const titleValue = title.trim();
    const descriptionValue = description.trim();

    if (titleValue.length < 3) {
      Alert.alert('خطأ', 'اكتب عنوان مناسب');
      return;
    }
    if (descriptionValue.length < 5) {
      Alert.alert('خطأ', 'اكتب وصف مناسب');
      return;
    }

    const budgetNumber = budget.trim().length ? Number(budget.trim()) : undefined;
    if (budgetNumber != null && Number.isNaN(budgetNumber)) {
      Alert.alert('خطأ', 'الميزانية لازم تكون رقم');
      return;
    }

    setSubmitting(true);
    try {
      const newRef = isEditing ? dbRef(db, `requests/${listing.id}`) : push(dbRef(db, 'requests'));

      const payload = {
        userId: user.uid,
        userName: user.name || '',
        userWhatsapp: user.whatsapp || '',
        title: { ar: titleValue, en: titleValue },
        description: { ar: descriptionValue, en: descriptionValue },
        category,
        budget: budgetNumber,
        status: 'open',
        ...(isEditing ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() }),
      };

      if (isEditing) {
        await update(newRef, payload);
      } else {
        await dbSet(newRef, payload);
      }

      Alert.alert('تم', isEditing ? 'تم تحديث الطلب بنجاح' : 'تم إنشاء الطلب بنجاح');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('خطأ', e?.message || 'تعذر إنشاء الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.title}>{isEditing ? 'تعديل الطلب' : 'إنشاء طلب'}</Text>
          <Text style={s.sub}>{isEditing ? 'حدث المطلوب وعدل التفاصيل مباشرة' : 'اختر نوع الطلب واكتب التفاصيل'}</Text>

          <View style={s.section}>
            <Text style={s.label}>النوع</Text>
            <View style={s.row}>
              <Chip label="سيارة" active={category === 'car'} onPress={() => setCategory('car')} />
              <Chip label="قطعة" active={category === 'part'} onPress={() => setCategory('part')} />
              <Chip label="أخرى" active={category === 'other'} onPress={() => setCategory('other')} />
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.label}>العنوان</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="مثال: أبي بورش باناميرا 2020"
              placeholderTextColor={colors.silver + '66'}
              style={s.input}
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>الوصف</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="اكتب التفاصيل المطلوبة"
              placeholderTextColor={colors.silver + '66'}
              style={[s.input, s.textarea]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>الميزانية (اختياري)</Text>
            <TextInput
              value={budget}
              onChangeText={setBudget}
              placeholder="مثال: 5000"
              placeholderTextColor={colors.silver + '66'}
              keyboardType="number-pad"
              style={s.input}
            />
          </View>

          <PremiumButton title={submitting ? 'جاري الحفظ…' : isEditing ? 'حفظ التعديلات' : 'إنشاء الطلب'} onPress={submit} variant="primary" icon="➕" style={{ opacity: canSubmit ? 1 : 0.6 }} />
          <TouchableOpacity style={s.cancel} activeOpacity={0.85} onPress={() => navigation.goBack()}>
            <Text style={s.cancelText}>إلغاء</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[c.chip, active && c.chipActive]}>
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

  section: { marginTop: 16 },
  label: { color: colors.silver, fontSize: 12, fontWeight: '700', marginBottom: 8 },

  row: { flexDirection: 'row', gap: 10 },

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
  chipActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primaryBorder,
  },
  chipText: { color: colors.silver, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.primary },
});
