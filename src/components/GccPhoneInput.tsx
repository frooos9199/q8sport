import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GCC_COUNTRIES, getGccCountry, sanitizeNationalNumber, type GccCountry } from '../lib/gccPhone';
import { colors, radius, spacing } from '../lib/theme';
import { getLocale, t } from '../i18n';

type Props = {
  icon?: string;
  country: GccCountry['code'];
  onCountryChange: (code: GccCountry['code']) => void;
  nationalNumber: string;
  onNationalNumberChange: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
};

export default function GccPhoneInput({
  icon,
  country,
  onCountryChange,
  nationalNumber,
  onNationalNumberChange,
  placeholder,
  editable = true,
}: Props) {
  const selected = getGccCountry(country);
  const maxLen = selected.nationalNumberLength;
  const [pickerOpen, setPickerOpen] = useState(false);
  const locale = getLocale();

  const pickCountry = (code: GccCountry['code']) => {
    onCountryChange(code);
    onNationalNumberChange(sanitizeNationalNumber(code, nationalNumber));
    setPickerOpen(false);
  };

  return (
    <View>
      <View style={s.inputWrap}>
        {icon ? <Text style={s.inputIcon}>{icon}</Text> : null}
        <TouchableOpacity
          activeOpacity={0.85}
          style={s.prefixWrap}
          onPress={() => setPickerOpen(true)}
          disabled={!editable}
          accessibilityRole="button"
          accessibilityLabel={t('gccPickCountryAccessibility')}
        >
          <Text style={s.prefixText}>{selected.flag} +{selected.dialCode}</Text>
          <Text style={s.chevron}>▾</Text>
        </TouchableOpacity>
        <TextInput
          value={nationalNumber}
          onChangeText={(value) => onNationalNumberChange(sanitizeNationalNumber(country, value))}
          style={s.input}
          placeholder={placeholder || t('gccPhonePlaceholder', { maxLen })}
          placeholderTextColor={colors.silver + '50'}
          keyboardType="phone-pad"
          editable={editable}
          maxLength={maxLen}
        />
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={pickerOpen}
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerOpen(false)} />
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{t('gccChooseCountryTitle')}</Text>
            <FlatList
              data={GCC_COUNTRIES}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const active = item.code === country;
                const countryName = locale === 'ar' ? item.nameAr : item.nameEn;
                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => pickCountry(item.code)}
                    style={[s.countryRow, active && s.countryRowActive]}
                    accessibilityRole="button"
                    accessibilityLabel={t('gccPickCountryItemAccessibility', { name: countryName })}
                  >
                    <Text style={s.countryFlag}>{item.flag}</Text>
                    <View style={s.countryMeta}>
                      <Text style={s.countryName}>{countryName}</Text>
                      <Text style={s.countryDial}>+{item.dialCode}</Text>
                    </View>
                    {active ? <Text style={s.countryCheck}>✓</Text> : <Text style={s.countryCheckPlaceholder} />}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={s.separator} />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.metal,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  prefixWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.metalBorder,
  },
  prefixText: { color: colors.white, fontWeight: '900', fontSize: 13 },
  chevron: { marginLeft: 6, color: colors.silver, fontWeight: '900' },
  input: { flex: 1, paddingVertical: 14, color: colors.white, fontSize: 15 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.black + '99',
  },
  modalCard: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalTitle: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 16,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.metalBorder,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.darkCard,
  },
  countryRowActive: {
    backgroundColor: colors.primaryGlow,
  },
  countryFlag: { fontSize: 18, marginRight: 12 },
  countryMeta: { flex: 1 },
  countryName: { color: colors.white, fontWeight: '900', fontSize: 14 },
  countryDial: { color: colors.silver, fontWeight: '800', fontSize: 12, marginTop: 2 },
  countryCheck: { color: colors.primary, fontWeight: '900', fontSize: 16 },
  countryCheckPlaceholder: { width: 14 },
  separator: { height: 1, backgroundColor: colors.metalBorder, marginLeft: spacing.xl },
});
