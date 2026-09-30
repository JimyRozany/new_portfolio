import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/** Determinate progress bar (used for skill levels). */
export function Progress({
  value,
  className,
  label,
  ...props
}: ComponentProps<'div'> & { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
      className={cn('bg-surface-3 h-1.5 w-full overflow-hidden rounded-full', className)}
      {...props}
    >
      <div
        className="bg-foreground h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

const spinnerVariants = cva('animate-spin rounded-full border-2 border-current', {
  variants: {
    size: { sm: 'size-3.5', md: 'size-5', lg: 'size-8' },
  },
  defaultVariants: { size: 'md' },
});

export function Spinner({
  className,
  size,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof spinnerVariants>) {
  return (
    <span
      data-slot="spinner"
      role="status"
      className={cn(spinnerVariants({ size }), 'border-current/25 border-t-current', className)}
      {...props}
    >
      <span className="sr-only">Loading</span>
    </span>
  );
}
