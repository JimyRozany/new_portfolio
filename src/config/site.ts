import type { Locale } from '@/i18n/routing';
/**
 * Static, non-editable identity data.
 *
 * Anything the owner is allowed to change later from the admin dashboard lives
 * in the database instead — this file only holds values that describe *the
 * application itself* (default SEO, contact details, feature flags).
 */
export const siteConfig = {
  name: 'Mohamed Gamal',
  shortName: 'Gamal',
  /** Used by next-intl for the `<title>` template and by metadata helpers. */
  titleTemplate: '%s · Mohamed Gamal',
  description: {
    en: 'Full Stack Developer building production-grade web applications with Laravel, React and Next.js.',
    ar: 'مطوّر ويب فُل ستاك أبني تطبيقات ويب جاهزة للإنتاج باستخدام Laravel و React و Next.js.',
  },
  /** Primary role line shown in the hero and the document title fallback. */
  role: {
    en: 'Full Stack Developer',
    ar: 'مطوّر فُل ستاك',
  },
  location: {
    city: { en: 'Cairo', ar: 'القاهرة' },
    country: { en: 'Egypt', ar: 'مصر' },
    timeZone: 'Africa/Cairo',
  },
  contact: {
    email: 'rozny@yahoo.com',
    phone: '+20 115 379 1575',
  },
  social: {
    github: 'https://github.com/JimyRozany',
    linkedin: 'https://linkedin.com/in/rozny',
  },
  /** Local fallback copy used before the CMS has any rows. */
  locales: {
    en: 'English',
    ar: 'العربية',
  },
  localeLabels: {
    en: 'English',
    ar: 'العربية',
  },
  defaultLocale: 'en' as Locale,
  /** Public URL used for canonical links, sitemap entries and Open Graph. */
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const;

/** Native-language names, shown in the language switcher. */
export const localeNativeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

/** BCP-47 tags used for `Intl.*` formatting of dates, numbers and plurals. */
export const localeTags: Record<Locale, string> = {
  en: 'en-GB',
  ar: 'ar-EG',
};

export type SiteConfig = typeof siteConfig;
