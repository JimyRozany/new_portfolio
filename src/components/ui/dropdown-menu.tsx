'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = 'end',
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-content"
        sideOffset={sideOffset}
        align={align}
        collisionPadding={12}
        className={cn(
          'border-border bg-surface z-50 min-w-44 overflow-hidden rounded-lg border p-1.5',
          'text-foreground shadow-lg',
          'data-[state=open]:animate-fade-up',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  destructive,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { destructive?: boolean }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-item"
      className={cn(
        'relative flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 select-none',
        'text-small transition-colors duration-150 outline-none',
        'focus:bg-surface-2 data-[highlighted]:bg-surface-2',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        '[&_svg]:text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0',
        destructive &&
          'text-danger focus:bg-danger-soft data-[highlighted]:bg-danger-soft [&_svg]:text-danger',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-label"
      className={cn(
        'text-caption text-subtle-foreground px-3 py-1.5 font-medium tracking-wider uppercase',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-separator"
      className={cn('bg-border -mx-1.5 my-1.5 h-px', className)}
      {...props}
    />
  );
}
