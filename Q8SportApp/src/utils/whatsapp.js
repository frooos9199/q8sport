import { Alert, Linking, Platform } from 'react-native';

export const normalizeKuwaitPhone = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  // Kuwait local numbers are typically 8 digits; add country code 965
  if (digits.length === 8) return `965${digits}`;
  return digits;
};

export const openWhatsApp = async ({ phone, message }) => {
  const normalized = normalizeKuwaitPhone(phone);
  if (!normalized) {
    Alert.alert('خطأ', 'رقم التواصل غير متوفر');
    return false;
  }

  const text = message ? `?text=${encodeURIComponent(String(message))}` : '';
  const webUrl = `https://wa.me/${normalized}${text}`;

  // Prefer wa.me: works on iOS/Android and falls back to web if WhatsApp missing.
  try {
    const can = await Linking.canOpenURL(webUrl);
    if (can) {
      await Linking.openURL(webUrl);
      return true;
    }
  } catch {
    // ignore and try open anyway
  }

  try {
    await Linking.openURL(webUrl);
    return true;
  } catch (e) {
    // As last resort on Android, try the app scheme.
    if (Platform.OS === 'android') {
      const appUrl = `whatsapp://send?phone=${normalized}${message ? `&text=${encodeURIComponent(String(message))}` : ''}`;
      try {
        await Linking.openURL(appUrl);
        return true;
      } catch {
        // fallthrough
      }
    }

    Alert.alert('خطأ', 'تعذر فتح واتساب. تأكد من تثبيت واتساب أو جرّب مرة أخرى.');
    return false;
  }
};
