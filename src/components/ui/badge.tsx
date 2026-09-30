import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-2 text-muted-foreground',
        outline: 'border-border-strong bg-transparent text-muted-foreground',
        accent: 'border-accent/30 bg-accent-soft text-accent-soft-foreground',
        solid: 'border-transparent bg-foreground text-background',
        success: 'border-success/25 bg-success-soft text-success-foreground',
        warning: 'border-warning/25 bg-warning-soft text-warning-foreground',
        danger: 'border-danger/25 bg-danger-soft text-danger-foreground',
        info: 'border-info/25 bg-info-soft text-info-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-caption',
        md: 'px-3 py-1 text-caption',
        lg: 'px-4 py-1.5 text-small',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/**
 * Small pulsing dot used for "available for work" style indicators.
 * Colour alone never carries the meaning — the text label next to it does.
 */
export function StatusDot({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span data-slot="status-dot" className={cn('relative flex size-2', className)} {...props}>
      <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-60" />
      <span className="bg-success relative inline-flex size-2 rounded-full" />
    </span>
  );
}
