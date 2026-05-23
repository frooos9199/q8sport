import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, spacing } from '../lib/theme';

type LaunchNoticeScreenProps = {
  onAgree: () => void;
};

export default function LaunchNoticeScreen({ onAgree }: LaunchNoticeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>تنبيه مهم</Text>
        <Text style={styles.title}>سياسة النشر داخل التطبيق</Text>
        <Text style={styles.body}>
          يمنع منعا باتا عرض أو بيع أو طلب أي منتج يخص أقزوز السيارات أو إصدار الأصوات المزعجة.
        </Text>
        <Text style={styles.body}>
          باستخدامك التطبيق ونشرك لأي إعلان، فأنت تتحمل المسؤولية الكاملة عن محتوى الإعلان وأي مخالفة تنتج عنه.
        </Text>

        <TouchableOpacity activeOpacity={0.88} onPress={onAgree} style={styles.button}>
          <Text style={styles.buttonText}>موافق</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryGlow,
    color: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 16,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'right',
  },
  body: {
    color: colors.silverLight,
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 14,
    textAlign: 'right',
  },
  button: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
  },
});