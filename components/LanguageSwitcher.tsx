"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const availableLanguages: {
  code: string;
  name: string;
  flag: string;
  chooseLabel: string;
}[] = [
  { code: "tr", name: "Türkçe",     flag: "TR", chooseLabel: "Dil Seçin" },
  { code: "en", name: "English",    flag: "EN", chooseLabel: "Choose Language" },
  { code: "ru", name: "Русский",    flag: "RU", chooseLabel: "Выберите язык" },
  { code: "ar", name: "العربية",   flag: "AR", chooseLabel: "اختر اللغة" },
  { code: "me", name: "Crnogorski", flag: "ME", chooseLabel: "Izaberite jezik" },
  { code: "uk", name: "Українська", flag: "UK", chooseLabel: "Оберіть мову" },
  { code: "it", name: "Italiano",   flag: "IT", chooseLabel: "Scegli lingua" },
  { code: "de", name: "Deutsch",    flag: "DE", chooseLabel: "Sprache wählen" },
  { code: "sr", name: "Srpski",     flag: "SR", chooseLabel: "Izaberite jezik" },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const currentCode = useLocale();

  const selectedLang =
    availableLanguages.find((l) => l.code === currentCode) || availableLanguages[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (l: (typeof availableLanguages)[0]) => {
    setIsOpen(false);
    router.replace(pathname, { locale: l.code });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                   text-gray-600 dark:text-gray-300
                   hover:text-gray-900 dark:hover:text-white
                   hover:bg-gray-100/80 dark:hover:bg-white/8
                   border border-transparent hover:border-gray-200 dark:hover:border-white/10
                   transition-all duration-200 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Language selector"
      >
        <Globe className="w-3.5 h-3.5 text-teal-500 shrink-0" />
        <span className="text-xs tracking-widest font-semibold uppercase">
          {selectedLang.flag}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-teal-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-52
                     bg-white dark:bg-[#1c1c1e]
                     border border-gray-200 dark:border-white/10
                     rounded-xl overflow-hidden
                     shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]
                     z-50 animate-slide-down"
          role="listbox"
          aria-label="Language options"
          dir="ltr"
        >
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {selectedLang.chooseLabel}
            </p>
          </div>

          <ul className="max-h-64 overflow-y-auto py-1">
            {availableLanguages.map((l) => {
              const isActive = selectedLang.code === l.code;
              return (
                <li key={l.code} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => handleSelect(l)}
                    className={`w-full text-left px-4 py-2.5 text-xs
                                flex items-center gap-3 transition-colors duration-150 cursor-pointer
                                ${
                                  isActive
                                    ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-400/10 font-semibold"
                                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/6"
                                }`}
                  >
                    <span
                      className={`text-xs font-bold tracking-wider w-5 shrink-0
                                  ${isActive ? "text-teal-500" : "text-gray-400 dark:text-gray-500"}`}
                    >
                      {l.flag}
                    </span>
                    <span className="uppercase tracking-widest">{l.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
