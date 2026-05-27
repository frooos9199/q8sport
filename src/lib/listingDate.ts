import { getLocale } from '../i18n';

function toMillis(value: any): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
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

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}