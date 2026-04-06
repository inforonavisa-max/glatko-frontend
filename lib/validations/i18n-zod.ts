/** next-intl `t` shape for building Zod messages on server or client. */
export type ValidationTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;
