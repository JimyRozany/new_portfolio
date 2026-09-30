'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

export function Avatar({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'border-border relative flex size-10 shrink-0 overflow-hidden rounded-full border',
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-surface-3 text-small text-muted-foreground flex size-full items-center justify-center font-medium',
        className,
      )}
      {...props}
    />
  );
}

const SIZES = {
  xs: 'size-7 text-caption',
  sm: 'size-9 text-caption',
  md: 'size-10 text-small',
  lg: 'size-14 text-body-lg',
} as const;

/**
 * Avatar for a person, with an initials fallback.
 *
 * Composes the three Radix primitives that every caller would otherwise have to
 * wire up by hand. Radix already handles the interesting case --- a broken or
 * missing image automatically reveals the fallback --- so `src` is optional and
 * the initials are derived from the name, taking the first letter of the first
 * two words.
 */
export function UserAvatar({
  src,
  name,
  size = 'md',
  className,
}: {
  /** Uploaded image path, or `null` when the person has no photo. */
  src?: string | null;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <Avatar className={cn(SIZES[size], className)}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback className={SIZES[size]}>{initials}</AvatarFallback>
    </Avatar>
  );
}
