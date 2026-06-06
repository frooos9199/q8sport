import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';

const INSTAGRAM_USERNAME = 'q8.sport.car';
const INSTAGRAM_APP_URL = `instagram://user?username=${INSTAGRAM_USERNAME}`;
const INSTAGRAM_WEB_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;
const FOLLOW_PROMPT_LAST_SHOWN_AT_KEY = 'instagram-follow-prompt:last-shown-at';
const PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export async function openInstagramProfile(): Promise<void> {
  try {
    const canOpenApp = await Linking.canOpenURL(INSTAGRAM_APP_URL);
    await Linking.openURL(canOpenApp ? INSTAGRAM_APP_URL : INSTAGRAM_WEB_URL);
  } catch {
    try {
      await Linking.openURL(INSTAGRAM_WEB_URL);
    } catch {
      // ignore
    }
  }
}

export async function shouldShowInstagramFollowPrompt(now = Date.now()): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(FOLLOW_PROMPT_LAST_SHOWN_AT_KEY);
    if (!raw) return true;

    const lastShownAt = Number(raw);
    if (!Number.isFinite(lastShownAt) || lastShownAt <= 0) return true;

    return now - lastShownAt >= PROMPT_COOLDOWN_MS;
  } catch {
    return true;
  }
}

async function markInstagramFollowPromptShown(now = Date.now()): Promise<void> {
  try {
    await AsyncStorage.setItem(FOLLOW_PROMPT_LAST_SHOWN_AT_KEY, String(now));
  } catch {
    // ignore
  }
}

export async function showInstagramFollowPrompt(options: {
  onDone: () => void;
  title?: string;
  message?: string;
  followLabel?: string;
  laterLabel?: string;
}): Promise<boolean> {
  const eligible = await shouldShowInstagramFollowPrompt();
  if (!eligible) return false;

  await markInstagramFollowPromptShown();

  const title = options.title || 'تابعنا على إنستقرام';
  const message = options.message || 'تابع @Q8.Sport.Car عشان تشوف أحدث العروض أول بأول.';
  const followLabel = options.followLabel || 'تابع إنستقرام';
  const laterLabel = options.laterLabel || 'لاحقاً';

  Alert.alert(title, message, [
    {
      text: laterLabel,
      style: 'cancel',
      onPress: options.onDone,
    },
    {
      text: followLabel,
      onPress: async () => {
        await openInstagramProfile();
        options.onDone();
      },
    },
  ]);

  return true;
}
