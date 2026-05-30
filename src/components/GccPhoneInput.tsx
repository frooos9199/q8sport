import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GCC_COUNTRIES, getGccCountry, sanitizeNationalNumber, type GccCountry } from '../lib/gccPhone';
import { colors, radius, spacing } from '../lib/theme';

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

  return (
    <View>
      <View style={s.flagsRow}>
        {GCC_COUNTRIES.map(item => {
          const active = item.code === country;
          return (
            <TouchableOpacity
              key={item.code}
              activeOpacity={0.85}
              onPress={() => onCountryChange(item.code)}
              style={[s.flagChip, active && s.flagChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`اختيار دولة ${item.nameAr}`}
              disabled={!editable}
            >
              <Text style={[s.flagText, active && s.flagTextActive]}>{item.flag}</Text>
              <Text style={[s.dialText, active && s.flagTextActive]}>+{item.dialCode}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.inputWrap}>
        {icon ? <Text style={s.inputIcon}>{icon}</Text> : null}
        <View style={s.prefixWrap}>
          <Text style={s.prefixText}>{selected.flag} +{selected.dialCode}</Text>
        </View>
        <TextInput
          value={nationalNumber}
          onChangeText={(value) => onNationalNumberChange(sanitizeNationalNumber(country, value))}
          style={s.input}
          placeholder={placeholder || `رقمك بدون فتح الخط (${maxLen} أرقام)`}
          placeholderTextColor={colors.silver + '50'}
          keyboardType="phone-pad"
          editable={editable}
          maxLength={maxLen}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  flagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    backgroundColor: colors.metal,
  },
  flagChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  flagText: { fontSize: 15, color: colors.white },
  dialText: { fontSize: 12, fontWeight: '800', color: colors.silver },
  flagTextActive: { color: colors.white },

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
    paddingVertical: 12,
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.metalBorder,
  },
  prefixText: { color: colors.white, fontWeight: '900', fontSize: 13 },
  input: { flex: 1, paddingVertical: 14, color: colors.white, fontSize: 15 },
});
