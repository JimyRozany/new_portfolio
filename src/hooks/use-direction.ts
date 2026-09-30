'use client';

import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { getDirection, type Direction } from '@/i18n/direction';
import type { Locale } from '@/i18n/routing';

/**
 * Reading direction of the active locale.
 *
 * Components that need to mirror a physical animation (a horizontal slide, for
 * example) read this instead of touching `document`, which keeps them safe to
 * server-render and free of hydration mismatches.
 */
export function useDirection(): Direction {
  const locale = useLocale();
  return useMemo(() => getDirection(locale as Locale), [locale]);
}
