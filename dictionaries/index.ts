import { cache } from "react";

export type LanguageCode = "tr" | "en" | "ru" | "ar" | "me" | "uk" | "it" | "de" | "sr";

const dictionaries = {
  tr: () => import("./tr.json").then((module) => module.default),
  en: () => import("./en.json").then((module) => module.default),
  ru: () => import("./ru.json").then((module) => module.default),
  ar: () => import("./ar.json").then((module) => module.default),
  me: () => import("./me.json").then((module) => module.default),
  uk: () => import("./uk.json").then((module) => module.default),
  it: () => import("./it.json").then((module) => module.default),
  de: () => import("./de.json").then((module) => module.default),
  sr: () => import("./sr.json").then((module) => module.default),
};

export const getDictionary = cache(async (locale: LanguageCode) => {
  const dictionaryLoadFunc = dictionaries[locale] ?? dictionaries.en;
  return dictionaryLoadFunc();
});
