import { defineRouting } from 'next-intl/routing';

export const locales = ['tr', 'en', 'de', 'it', 'ru', 'uk', 'sr', 'me', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'tr';

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
  ru: 'Русский',
  uk: 'Українська',
  sr: 'Српски',
  me: 'Crnogorski',
  ar: 'العربية',
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
});
