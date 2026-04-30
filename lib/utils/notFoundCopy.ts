import type { Locale } from "@/i18n/routing";

export type NotFoundCopy = {
  title: string;
  subtitle: string;
  ctaServices: string;
  ctaHome: string;
};

export const NOT_FOUND_COPY: Record<Locale, NotFoundCopy> = {
  me: {
    title: "Stranica nije pronađena",
    subtitle: "Stranica koju tražite ne postoji ili je premještena.",
    ctaServices: "Pogledajte naše usluge",
    ctaHome: "Početna",
  },
  sr: {
    title: "Страница није пронађена",
    subtitle: "Страница коју тражите не постоји или је премештена.",
    ctaServices: "Погледајте наше услуге",
    ctaHome: "Почетна",
  },
  en: {
    title: "Page Not Found",
    subtitle: "The page you're looking for doesn't exist or has been moved.",
    ctaServices: "Browse our services",
    ctaHome: "Home",
  },
  tr: {
    title: "Sayfa Bulunamadı",
    subtitle: "Aradığınız sayfa mevcut değil veya taşınmış.",
    ctaServices: "Hizmetlerimize göz atın",
    ctaHome: "Ana sayfa",
  },
  de: {
    title: "Seite nicht gefunden",
    subtitle: "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    ctaServices: "Unsere Dienstleistungen ansehen",
    ctaHome: "Startseite",
  },
  it: {
    title: "Pagina non trovata",
    subtitle: "La pagina che cerchi non esiste o è stata spostata.",
    ctaServices: "Sfoglia i nostri servizi",
    ctaHome: "Home",
  },
  ru: {
    title: "Страница не найдена",
    subtitle:
      "Страница, которую вы ищете, не существует или была перемещена.",
    ctaServices: "Посмотреть наши услуги",
    ctaHome: "Главная",
  },
  ar: {
    title: "الصفحة غير موجودة",
    subtitle: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    ctaServices: "تصفح خدماتنا",
    ctaHome: "الرئيسية",
  },
  uk: {
    title: "Сторінку не знайдено",
    subtitle: "Сторінка, яку ви шукаєте, не існує або була переміщена.",
    ctaServices: "Переглянути наші послуги",
    ctaHome: "Головна",
  },
};
