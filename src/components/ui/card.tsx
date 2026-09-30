import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Surface primitives.
 *
 * `Card` is the single container used across the public site and the admin
 * dashboard; the sub-components exist so call sites stay declarative
 * (`<Card><CardHeader/><CardContent/></Card>`) instead of re-implementing
 * padding and spacing at every location.
 */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'border-border bg-surface text-foreground relative flex flex-col rounded-xl border',
        'shadow-xs transition-[border-color,box-shadow,transform] duration-300 ease-out',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1.5 p-6', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-h4 leading-tight font-semibold', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-small text-muted-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-3 p-6 pt-0', className)}
      {...props}
    />
  );
}
