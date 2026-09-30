'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/** Accessible on/off switch used across the admin forms for boolean fields. */
export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-out',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-foreground data-[state=unchecked]:bg-border-strong',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'bg-background pointer-events-none block size-5 rounded-full shadow-sm ring-0',
          'ease-spring transition-transform duration-200',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
          'rtl:data-[state=checked]:-translate-x-5',
        )}
      />
    </SwitchPrimitive.Root>
  );
}
