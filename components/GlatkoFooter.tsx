"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function GlatkoFooter() {
  const t = useTranslations();

  const columns = [
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.about"), href: "/about" },
        { label: t("footer.careers"), href: "/about" },
        { label: t("footer.contact"), href: "/contact" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.terms"), href: "/terms" },
        { label: t("footer.privacy"), href: "/privacy" },
        { label: t("footer.cookies"), href: "/cookies" },
        { label: t("footer.gdpr"), href: "/gdpr" },
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { label: t("footer.help"), href: "/contact" },
        { label: t("footer.becomeAPro"), href: "/register" },
        { label: t("footer.forPros"), href: "/register" },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#080808]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Glatko</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1" />
            </div>
            <p className="text-sm text-gray-500 dark:text-white/50 max-w-xs">
              {t("brand.description")}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-white/60 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-white/30">
            {t("footer.copyright")}
          </p>
          <p className="text-xs text-gray-400 dark:text-white/30">
            {t("footer.madeIn")} 🇲🇪
          </p>
        </div>
      </div>
    </footer>
  );
}
