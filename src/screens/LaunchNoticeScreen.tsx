import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, spacing } from '../lib/theme';
import { t } from '../i18n';

type LaunchNoticeScreenProps = {
  onAgree: () => void;
};

export default function LaunchNoticeScreen({ onAgree }: LaunchNoticeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.badge} maxFontSizeMultiplier={1.2}>
            {t('launchNoticeBadge')}
          </Text>
          <Text style={styles.title} maxFontSizeMultiplier={1.2}>
            {t('launchNoticeTitle')}
          </Text>
          <Text style={styles.body} maxFontSizeMultiplier={1.35}>
            {t('launchNoticeBody1')}
          </Text>
          <Text style={styles.body} maxFontSizeMultiplier={1.35}>
            {t('launchNoticeBody2')}
          </Text>

          <TouchableOpacity activeOpacity={0.88} onPress={onAgree} style={styles.button}>
            <Text style={styles.buttonText} maxFontSizeMultiplier={1.2}>
              {t('agree')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: 24,
    width: '100%',
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