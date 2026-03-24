import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { routing } from './routing';

/**
 * Dictionary JSON uses dot-notation flat keys ("hero.title").
 * use-intl resolves t("hero.title") via nested messages.hero.title, not messages["hero.title"].
 */
function dotFlatKeysToNestedMessages(
  flat: Record<string, string>
): AbstractIntlMessages {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let node: Record<string, unknown> = out;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      const next = node[p];
      if (next == null || typeof next !== "object" || Array.isArray(next)) {
        node[p] = {};
      }
      node = node[p] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }
  return out as AbstractIntlMessages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const raw = (await import(`../dictionaries/${locale}.json`)).default as Record<
    string,
    string
  >;
  const messages = dotFlatKeysToNestedMessages(raw);

  return {
    locale,
    messages,
  };
});
