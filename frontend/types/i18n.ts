/** Unified localised-text type (TyON v1.1).
 *
 *  Every AI-generated text field uses this structure so the frontend can
 *  render either language without re-fetching.
 *
 *  Access pattern in components:
 *    const lang = useLocale() as "en" | "zh";
 *    field[lang]  // → string
 */
export interface LocalizedText {
  en: string;
  zh: string;
}
