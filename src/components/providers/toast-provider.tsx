'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from 'next-themes';
import { useDirection } from '@/hooks/use-direction';

/**
 * Toast host.
 *
 * Stays in sync with the active theme so notifications never look pasted on
 * from a different design system. The `dir` prop flips the stack to the
 * correct edge in Arabic (RTL).
 */
export function ToastProvider() {
  const { resolvedTheme } = useTheme();
  const direction = useDirection();

  return (
    <SonnerToaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      dir={direction}
      position={direction === 'rtl' ? 'bottom-left' : 'bottom-right'}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group rounded-lg border border-border bg-surface text-foreground shadow-lg backdrop-blur-xl',
          title: 'text-body font-medium',
          description: 'text-small text-muted-foreground',
          actionButton:
            'bg-foreground text-background rounded-md px-3 py-1.5 text-caption font-medium',
          cancelButton: 'bg-surface-2 text-muted-foreground rounded-md px-3 py-1.5 text-caption',
        },
      }}
    />
  );
}
