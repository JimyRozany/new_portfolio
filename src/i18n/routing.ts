import { defineRouting } from 'next-intl/routing';

/**
 * The two supported languages.
 * `ar` renders RTL, `en` renders LTR — see `getDirection` in `direction.ts`.
 */
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  // Every public URL is prefixed with the locale so each language has a
  // stable, shareable, indexable address (needed for correct hreflang tags).
  localePrefix: 'always',
  // Keep the visitor's language preference in a cookie so the middleware can
  // detect returning Arabic visitors coming in from a shared link.
  localeDetection: true,
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  },
});

export type Locale = (typeof routing.locales)[number];
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;

/** BCP-47 tags used for `Intl.*` formatting of dates, numbers and plurals. */
export const localeTags: Record<Locale, string> = {
  en: 'en-GB',
  ar: 'ar-EG',
};

/** Narrowing helper for values coming from route params or search params. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (routing.locales as readonly string[]).includes(value);
}
