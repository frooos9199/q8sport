"use client";
import { createContext, useContext } from "react";
import { Locale } from "@/types";
import { getDictionary } from "@/i18n";

type LocaleContextType = {
  locale: Locale;
  t: ReturnType<typeof getDictionary>;
  dir: "rtl" | "ltr";
};

const LocaleContext = createContext<LocaleContextType>({
  locale: "ar",
  t: getDictionary("ar"),
  dir: "rtl",
});

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = getDictionary(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <LocaleContext.Provider value={{ locale, t, dir }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
