/**
 * Zero-dependency formatters.
 *
 * These intentionally avoid `date-fns`/`Intl` gymnastics on the server so the
 * output is deterministic and matches between the server-rendered markup and
 * the client hydration pass (a mismatch would trip React's hydration check).
 */

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ar: [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
} as const;

export type SupportedLocale = keyof typeof MONTHS;

/** `2024-03` → `Mar 2024` / `مارس ٢٠٢٤`. */
export function formatMonthYear(value: string | Date | null | undefined, locale: SupportedLocale) {
  if (!value) return null;
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;

  const month = MONTHS[locale][date.getUTCMonth()];
  const year =
    locale === 'ar' ? toArabicDigits(String(date.getUTCFullYear())) : date.getUTCFullYear();
  return `${month} ${year}`;
}

/** Full date for meta tags: `2024-03-18` → `18 March 2024`. */
export function formatIsoDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

/** `2` → `02`, useful for timeline markers. */
export function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Convert Western digits to Arabic-Indic digits.
 * Used for decorative numerals (timeline year markers) so the RTL layout looks
 * native, while machine-readable values (ids, aria labels) stay in Latin.
 */
export function toArabicDigits(value: string): string {
  return value.replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)] ?? digit);
}

/** Locale-aware digits for any display value. */
export function formatNumber(value: number, locale: SupportedLocale): string {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-GB').format(value);
  return locale === 'ar'
    ? formatted.replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)] ?? d)
    : formatted;
}
