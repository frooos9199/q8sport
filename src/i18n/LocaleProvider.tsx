import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocale, setLocale as setLocaleInternal } from './index';

export type Locale = 'ar' | 'en';

const STORAGE_KEY = 'q8sport.locale';

type LocaleContextValue = {
  locale: Locale;
  setAppLocale: (next: Locale) => void;
};

const LocaleContext = React.createContext<LocaleContextValue>({
  locale: 'ar',
  setAppLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<Locale>(getLocale());

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (saved === 'ar' || saved === 'en') {
          setLocaleInternal(saved);
          setLocale(saved);
        }
      } catch {
        // ignore
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const setAppLocale = React.useCallback((next: Locale) => {
    setLocaleInternal(next);
    setLocale(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setAppLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return React.useContext(LocaleContext);
}
