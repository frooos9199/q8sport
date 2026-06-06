import { getLocale } from '../i18n';

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

  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    numeric: 'always',
    style: 'long',
  });

  if (diffSeconds < 60) {
    return rtf.format(-Math.max(1, diffSeconds), 'second');
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute');
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return rtf.format(-diffDays, 'day');
  }

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}