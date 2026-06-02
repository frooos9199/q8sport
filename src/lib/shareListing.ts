import { Alert, Linking, Platform, Share as NativeShare } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import RNShare, { Social } from 'react-native-share';

type ShareTarget = 'whatsapp' | 'instagram' | 'tiktok' | 'snapchat';

type ShareImageInput = string | string[] | undefined;

function isLocalShareUrl(url: string) {
  return /^file:\/\//i.test(url) || /^content:\/\//i.test(url) || /^data:/i.test(url);
}

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

async function tryFetchImageAsDataUrl(imageUrl: string) {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const blob: any = await (res as any).blob();

    const FileReaderCtor = (global as any).FileReader;
    if (!FileReaderCtor) return null;

    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReaderCtor();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    if (!dataUrl.startsWith('data:')) return null;
    return { dataUrl, contentType };
  } catch {
    return null;
  }
}

function toImageUrlList(input: ShareImageInput): string[] {
  if (!input) return [];
  const list = Array.isArray(input) ? input : [input];
  const cleaned = list
    .filter((u): u is string => typeof u === 'string')
    .map(u => u.trim())
    .filter(Boolean);

  return Array.from(new Set(cleaned));
}

async function fetchImagesAsDataUrls(imageUrls: string[], limit: number) {
  const results: Array<{ dataUrl: string; contentType: string }> = [];
  for (const url of imageUrls.slice(0, Math.max(0, limit))) {
    if (isLocalShareUrl(url)) {
      // Local files can be passed to react-native-share directly.
      results.push({ dataUrl: url, contentType: 'image/*' });
      continue;
    }
    const asset = await tryFetchImageAsDataUrl(url);
    if (asset) results.push(asset);
  }
  return results;
}

export async function shareListing(target: ShareTarget, message: string, imageUrl?: ShareImageInput) {
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

    const imageUrls = toImageUrlList(imageUrl);

    if (imageUrls.length) {
      const assets = await fetchImagesAsDataUrls(imageUrls, 10);

      if (assets.length === 1) {
        try {
          await RNShare.shareSingle({
            social: Social.Instagram,
            url: assets[0].dataUrl,
            type: assets[0].contentType,
          });
          notifyCopied();
          return;
        } catch {
          // fall through
        }
      }

      if (assets.length > 1) {
        // iOS Instagram feed doesn't reliably accept direct multi-image share.
        // Most apps fall back to the system share sheet (user picks Instagram).
        if (Platform.OS === 'android') {
          try {
            await RNShare.shareSingle({
              social: Social.Instagram,
              urls: assets.map(a => a.dataUrl),
              type: 'image/*',
            });
            notifyCopied();
            return;
          } catch {
            // fall through
          }
        }

        // Backup: open the system share sheet with multiple images
        try {
          await RNShare.open({
            urls: assets.map(a => a.dataUrl),
            type: 'image/*',
            failOnCancel: false,
          });
          notifyCopied();
          return;
        } catch {
          // fall through
        }
      }
    }

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

    const imageUrls = toImageUrlList(imageUrl);

    if (imageUrls[0]) {
      const asset = await tryFetchImageAsDataUrl(imageUrls[0]);
      if (asset) {
        try {
          await RNShare.shareSingle({
            social: Social.Snapchat,
            url: asset.dataUrl,
            type: asset.contentType,
          });
          notifyCopied();
          return;
        } catch {
          // fall through to deep-link open
        }
      }
    }

    const opened = await openFirstSupportedUrl([
      'snapchat://camera',
      'snapchat://',
    ]);
    if (opened) {
      notifyCopied();
      return;
    }
  }

  await NativeShare.share({
    message: trimmedMessage,
    title: 'Q8 Sport Car',
  });
}