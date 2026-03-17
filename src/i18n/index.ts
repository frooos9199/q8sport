import { ar } from "./ar";
import { en } from "./en";
import { Locale } from "@/types";

const dictionaries = { ar, en };

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries.ar;
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
