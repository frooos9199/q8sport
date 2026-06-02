import { Alert, Linking, Share } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

type ShareTarget = 'whatsapp' | 'instagram' | 'tiktok' | 'snapchat';

async function openFirstSupportedUrl(urls: string[]) {
  for (const url of urls) {
    try {
      // canOpenURL may be restricted by iOS LSApplicationQueriesSchemes or Android <queries>
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // ignore and try next
    }
  }
  return false;
}

function notifyCopied() {
  Alert.alert('تم النسخ', 'نسخنا نص الإعلان. الصقه داخل التطبيق اللي فتحناه.');
}

export async function shareListing(target: ShareTarget, message: string) {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return;
  }

  if (target === 'whatsapp') {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(trimmedMessage)}`;

    if (await Linking.canOpenURL(whatsappUrl)) {
      await Linking.openURL(whatsappUrl);
      return;
    }
  }

  if (target === 'instagram') {
    Clipboard.setString(trimmedMessage);
    const opened = await openFirstSupportedUrl([
      'instagram://app',
      'instagram://camera',
    ]);
    if (opened) {
      notifyCopied();
      return;
    }
  }

  if (target === 'tiktok') {
    Clipboard.setString(trimmedMessage);
    const opened = await openFirstSupportedUrl([
      'tiktok://',
      'snssdk1233://',
    ]);
    if (opened) {
      notifyCopied();
      return;
    }
  }

  if (target === 'snapchat') {
    Clipboard.setString(trimmedMessage);
    const opened = await openFirstSupportedUrl([
      'snapchat://camera',
      'snapchat://',
    ]);
    if (opened) {
      notifyCopied();
      return;
    }
  }

  await Share.share({
    message: trimmedMessage,
    title: 'Q8 Sport Car',
  });
}