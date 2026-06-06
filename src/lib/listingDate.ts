import { getLocale } from '../i18n';

function formatArabicPublishedAgo(unit: 'second' | 'minute' | 'hour' | 'day', value: number): string {
  const n = Math.max(1, Math.floor(value));

  if (unit === 'second') {
    if (n === 1) return 'تم النشر قبل ثانية';
    if (n === 2) return 'تم النشر قبل ثانيتين';
    if (n <= 10) return `تم النشر قبل ${n} ثوان`;
    return `تم النشر قبل ${n} ثانية`;
  }

  if (unit === 'minute') {
    if (n === 1) return 'تم النشر قبل دقيقة';
    if (n === 2) return 'تم النشر قبل دقيقتين';
    if (n <= 10) return `تم النشر قبل ${n} دقائق`;
    return `تم النشر قبل ${n} دقيقة`;
  }

  if (unit === 'hour') {
    if (n === 1) return 'تم النشر قبل ساعة';
    if (n === 2) return 'تم النشر قبل ساعتين';
    if (n <= 10) return `تم النشر قبل ${n} ساعات`;
    return `تم النشر قبل ${n} ساعة`;
  }

  if (n === 1) return 'تم النشر قبل يوم';
  if (n === 2) return 'تم النشر قبل يومين';
  if (n <= 10) return `تم النشر قبل ${n} أيام`;
  return `تم النشر قبل ${n} يوم`;
}

function toMillis(value: any): number {
  const normalizeEpoch = (input: number): number => {
    if (!Number.isFinite(input) || input <= 0) return 0;
    // 10-digit epoch values are seconds; 13-digit values are milliseconds.
    return input < 100_000_000_000 ? input * 1000 : input;
  };

  if (typeof value === 'number' && Number.isFinite(value)) {
    return normalizeEpoch(value);
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return normalizeEpoch(numericValue);
    }

    const parsedValue = Date.parse(value);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }

  if (value && typeof value === 'object') {
    if (typeof value.toMillis === 'function') {
      return value.toMillis();
    }

    if (typeof value.seconds === 'number') {
      return value.seconds * 1000;
    }

    if (typeof value._seconds === 'number') {
      return value._seconds * 1000;
    }
  }

  return 0;
}

export function formatListingPublishedAt(value: any, locale = getLocale()): string | null {
  const timestamp = toMillis(value);

  if (!timestamp) {
    return null;
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffSeconds = Math.floor(diffMs / 1000);
  const isArabic = locale === 'ar';

  const rtf = new Intl.RelativeTimeFormat(isArabic ? 'ar-KW' : 'en-GB', {
    numeric: 'always',
    style: 'long',
  });

  if (diffSeconds < 60) {
    if (isArabic) return formatArabicPublishedAgo('second', diffSeconds);
    return rtf.format(-Math.max(1, diffSeconds), 'second');
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    if (isArabic) return formatArabicPublishedAgo('minute', diffMinutes);
    return rtf.format(-diffMinutes, 'minute');
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    if (isArabic) return formatArabicPublishedAgo('hour', diffHours);
    return rtf.format(-diffHours, 'hour');
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    if (isArabic) return formatArabicPublishedAgo('day', diffDays);
    return rtf.format(-diffDays, 'day');
  }

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}