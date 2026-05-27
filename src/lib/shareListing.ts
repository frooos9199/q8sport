import { Linking, Share } from 'react-native';

type ShareTarget = 'whatsapp' | 'instagram' | 'tiktok' | 'snapchat';

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

  await Share.share({
    message: trimmedMessage,
    title: 'Q8 Sport Car',
  });
}