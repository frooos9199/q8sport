export type GccCountry = {
  code: 'KW' | 'SA' | 'AE' | 'QA' | 'BH' | 'OM';
  nameAr: string;
  flag: string;
  dialCode: string; // digits only
  nationalNumberLength: number;
};

export const GCC_COUNTRIES: readonly GccCountry[] = [
  { code: 'KW', nameAr: 'الكويت', flag: '🇰🇼', dialCode: '965', nationalNumberLength: 8 },
  { code: 'SA', nameAr: 'السعودية', flag: '🇸🇦', dialCode: '966', nationalNumberLength: 9 },
  { code: 'AE', nameAr: 'الإمارات', flag: '🇦🇪', dialCode: '971', nationalNumberLength: 9 },
  { code: 'QA', nameAr: 'قطر', flag: '🇶🇦', dialCode: '974', nationalNumberLength: 8 },
  { code: 'BH', nameAr: 'البحرين', flag: '🇧🇭', dialCode: '973', nationalNumberLength: 8 },
  { code: 'OM', nameAr: 'عُمان', flag: '🇴🇲', dialCode: '968', nationalNumberLength: 8 },
] as const;

export function getGccCountry(code: GccCountry['code']) {
  return GCC_COUNTRIES.find(item => item.code === code) || GCC_COUNTRIES[0];
}

export function onlyDigits(value: string) {
  return (value || '').replace(/\D+/g, '');
}

export function sanitizeNationalNumber(countryCode: GccCountry['code'], value: string) {
  const country = getGccCountry(countryCode);
  const digits = onlyDigits(value);
  return digits.slice(0, country.nationalNumberLength);
}

export function buildE164(countryCode: GccCountry['code'], nationalNumber: string) {
  const country = getGccCountry(countryCode);
  const nationalDigits = sanitizeNationalNumber(countryCode, nationalNumber);
  if (!nationalDigits) return '';
  return `+${country.dialCode}${nationalDigits}`;
}

export function parseToGccNumber(
  input: string,
  options?: { defaultCountry?: GccCountry['code'] },
): { country: GccCountry['code']; nationalNumber: string } {
  const defaultCountry = options?.defaultCountry || 'KW';
  const digits = onlyDigits(input);

  if (!digits) {
    return { country: defaultCountry, nationalNumber: '' };
  }

  for (const country of GCC_COUNTRIES) {
    const prefix = country.dialCode;
    if (digits.startsWith(prefix) && digits.length >= prefix.length + 6) {
      const national = digits.slice(prefix.length);
      return { country: country.code, nationalNumber: sanitizeNationalNumber(country.code, national) };
    }
  }

  // Heuristic: if local Kuwait number (8 digits) assume KW.
  if (digits.length === 8) {
    return { country: 'KW', nationalNumber: sanitizeNationalNumber('KW', digits) };
  }

  // Fallback: keep default country and keep last N digits.
  const fallbackCountry = getGccCountry(defaultCountry);
  return {
    country: defaultCountry,
    nationalNumber: digits.slice(-fallbackCountry.nationalNumberLength),
  };
}

export function toWaMeDigits(phone: string) {
  const digits = onlyDigits(phone);
  if (!digits) return '';

  // Safety net for legacy Kuwait local numbers.
  if (digits.length === 8) {
    return `965${digits}`;
  }

  return digits;
}
