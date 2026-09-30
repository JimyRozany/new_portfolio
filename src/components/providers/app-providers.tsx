'use client';

import type { ReactNode } from 'react';
import { MotionProvider } from './motion-provider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';

/**
 * Single client boundary for the whole application.
 *
 * Composing the providers in one place avoids nesting-order bugs (theme before
 * toasts, motion before anything that animates) and guarantees the public site
 * and the admin dashboard mount the same runtime.
 *
 * `NextIntlClientProvider` is deliberately *not* here: both layouts already
 * wrap their tree in it (they need the locale to configure it), so adding it
 * again would create a second, locale-less provider.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionProvider>
        {children}
        <ToastProvider />
      </MotionProvider>
    </ThemeProvider>
  );
}
