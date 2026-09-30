'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

export const TooltipProvider = ({
  delayDuration = 200,
  skipDelayDuration = 300,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    {...props}
  />
);

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>;
}

export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'border-border bg-foreground z-50 rounded-md border px-2.5 py-1.5',
          'text-caption text-background shadow-md',
          'data-[state=delayed-open]:animate-fade-in',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
