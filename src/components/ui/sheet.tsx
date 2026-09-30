'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';
import { DialogOverlay, DialogPortal } from './dialog';

/**
 * Sheet — a panel that slides in from the inline-start edge.
 *
 * Used for the mobile navigation drawer and the admin sidebar on small
 * screens. `side` is logical (`start` / `end`) so it automatically mirrors
 * correctly in Arabic.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const DialogDescriptionPrimitive = DialogPrimitive.Description;
export const SheetDescription = DialogPrimitive.Description;

/**
 * Off-canvas states.
 *
 * `translate` is physical, so the `rtl:` variant flips the direction for the
 * Arabic layout — the panel always leaves through the edge it entered from.
 */
const SIDE_CLASSES = {
  start:
    'inset-y-0 start-0 h-full w-[min(22rem,85vw)] data-[state=closed]:-translate-x-full rtl:data-[state=closed]:translate-x-full',
  end: 'inset-y-0 end-0 h-full w-[min(22rem,85vw)] data-[state=closed]:translate-x-full rtl:data-[state=closed]:-translate-x-full',
  bottom:
    'inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-2xl border-t data-[state=closed]:translate-y-full',
} as const;

export function SheetContent({
  className,
  children,
  side = 'start',
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { side?: keyof typeof SIDE_CLASSES }) {
  const t = useTranslations('common');

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'border-border bg-surface fixed z-50 flex flex-col p-6 shadow-xl',
          'data-[state=open]:animate-fade-in transition-transform duration-300 ease-out',
          SIDE_CLASSES[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="sr-only">{t('close')}</DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
