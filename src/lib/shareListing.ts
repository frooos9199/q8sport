import { Alert, Linking, Platform, Share as NativeShare } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import RNShare, { Social } from 'react-native-share';

export type ShareTarget = 'whatsapp' | 'instagram' | 'tiktok' | 'snapchat';

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

function copyShareMessage(message: string) {
  Clipboard.setString(message);
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

  const imageUrls = toImageUrlList(imageUrl);
  const assets = imageUrls.length ? await fetchImagesAsDataUrls(imageUrls, 10) : [];
  const assetUrls = assets.map(a => a.dataUrl);

  if (target === 'whatsapp') {
    copyShareMessage(trimmedMessage);

    if (assetUrls.length) {
      try {
        await RNShare.shareSingle({
          social: Social.Whatsapp,
          message: trimmedMessage,
          url: assetUrls.length === 1 ? assetUrls[0] : undefined,
          urls: assetUrls.length > 1 ? assetUrls : undefined,
          type: assets.length === 1 ? assets[0].contentType : 'image/*',
          title: 'Q8 Sport Car',
          failOnCancel: false,
        } as any);
        return;
      } catch {
        try {
          await RNShare.open({
            message: trimmedMessage,
            urls: assetUrls,
            type: 'image/*',
            title: 'Q8 Sport Car',
            failOnCancel: false,
          });
          return;
        } catch {
          // fall through to text-only WhatsApp link
        }
      }
    }

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(trimmedMessage)}`;
    if (await Linking.canOpenURL(whatsappUrl)) {
      await Linking.openURL(whatsappUrl);
      return;
    }
  }

  if (target === 'instagram') {
    copyShareMessage(trimmedMessage);

    if (assetUrls.length) {
      if (assetUrls.length === 1) {
        try {
          await RNShare.shareSingle({
            social: Social.Instagram,
            url: assetUrls[0],
            type: assets[0].contentType,
          });
          notifyCopied();
          return;
        } catch {
          // fall through
        }
      }

      if (assetUrls.length > 1) {
        // iOS Instagram feed doesn't reliably accept direct multi-image share.
        // Most apps fall back to the system share sheet (user picks Instagram).
        if (Platform.OS === 'android') {
          try {
            await RNShare.shareSingle({
              social: Social.Instagram,
              urls: assetUrls,
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
            message: trimmedMessage,
            urls: assetUrls,
            type: 'image/*',
            title: 'Q8 Sport Car',
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
    copyShareMessage(trimmedMessage);

    if (assetUrls.length) {
      try {
        await RNShare.open({
          urls: assetUrls,
          type: 'image/*',
          title: 'Q8 Sport Car',
          failOnCancel: false,
        });
        notifyCopied();
        return;
      } catch {
        try {
          await RNShare.open({
            message: trimmedMessage,
            urls: assetUrls,
            type: 'image/*',
            title: 'Q8 Sport Car',
            failOnCancel: false,
          });
          notifyCopied();
          return;
        } catch {
          // fall through to app open
        }
      }
    }

    if (!assetUrls.length && imageUrls.length) {
      try {
        await RNShare.open({
          urls: imageUrls,
          type: 'image/*',
          title: 'Q8 Sport Car',
          failOnCancel: false,
        });
        notifyCopied();
        return;
      } catch {
        // fall through to app open
      }
    }

    const opened = await openFirstSupportedUrl([
      'tiktok://',
      'snssdk1180://',
      'snssdk1233://',
      'musically://',
    ]);
    if (opened) {
      notifyCopied();
      return;
    }
  }

  if (target === 'snapchat') {
    copyShareMessage(trimmedMessage);

    if (assetUrls.length) {
      try {
        await RNShare.open({
          urls: assetUrls,
          type: 'image/*',
          title: 'Q8 Sport Car',
          failOnCancel: false,
        });
        notifyCopied();
        return;
      } catch {
        try {
          await RNShare.open({
            message: trimmedMessage,
            urls: assetUrls,
            type: 'image/*',
            title: 'Q8 Sport Car',
            failOnCancel: false,
          });
          notifyCopied();
          return;
        } catch {
          try {
            await RNShare.shareSingle({
              social: Social.Snapchat,
              message: trimmedMessage,
              url: assetUrls.length === 1 ? assetUrls[0] : undefined,
              urls: assetUrls.length > 1 ? assetUrls : undefined,
              type: assets.length === 1 ? assets[0].contentType : 'image/*',
              title: 'Q8 Sport Car',
            } as any);
            notifyCopied();
            return;
          } catch {
            // fall through to deep-link open
          }
        }
      }
    }

    if (!assetUrls.length && imageUrls.length) {
      try {
        await RNShare.open({
          urls: imageUrls,
          type: 'image/*',
          title: 'Q8 Sport Car',
          failOnCancel: false,
        });
        notifyCopied();
        return;
      } catch {
        // fall through to deep-link open
      }
    }

    const opened = await openFirstSupportedUrl([
      'snapchat://camera',
      'snapchat://creativekit',
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