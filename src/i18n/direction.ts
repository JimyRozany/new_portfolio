import type { Locale } from './routing';

export type Direction = 'ltr' | 'rtl';

/** Arabic is right-to-left; every other supported locale is left-to-right. */
const RTL_LOCALES: readonly string[] = ['ar', 'he', 'fa', 'ur'];

export function getDirection(locale: Locale): Direction {
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Physical CSS direction for a logical value.
 * Tailwind's logical utilities (`ms-*`, `text-start`) already handle this, but
 * a handful of third-party/inline styles still need the physical keyword.
 */
export function getFlexDirection(direction: Direction): 'row' | 'row-reverse' {
  return direction === 'rtl' ? 'row-reverse' : 'row';
}
