/**
 * i18n routing configuration.
 *
 * Add new locales here to extend language support (de, fr, es, jp …)
 * without touching any component code.
 */
export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Check whether a string is a supported locale. */
export function isLocale(s: string): s is Locale {
  return (locales as readonly string[]).includes(s);
}
