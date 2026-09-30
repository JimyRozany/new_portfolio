'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Theme provider.
 *
 * - `attribute="class"` toggles `.dark` on `<html>`, which is what the
 *   `@custom-variant dark` rule in `globals.css` keys off.
 * - `defaultTheme="system"` makes the OS preference the initial state.
 * - `disableTransitionOnChange` prevents a 300ms colour cross-fade on every
 *   element when the theme flips.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="portfolio-theme"
      themes={['light', 'dark', 'system']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
