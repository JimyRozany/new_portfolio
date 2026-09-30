import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Technology / keyword chip.
 *
 * Used for the skills grid, project technology lists and the hero strip. The
 * mono font and the tighter padding make a wall of chips read as a technical
 * index rather than a pile of buttons.
 */
const chipVariants = cva(
  'inline-flex items-center gap-2 rounded-full border transition-colors duration-200',
  {
    variants: {
      variant: {
        outline:
          'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground',
        solid: 'border-transparent bg-foreground text-background',
        soft: 'border-transparent bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground',
        accent: 'border-accent/30 bg-accent-soft text-accent-foreground',
      },
      size: {
        sm: 'px-2.5 py-1 text-caption',
        md: 'px-3.5 py-1.5 text-caption',
        lg: 'px-4 py-2 text-small',
      },
    },
    defaultVariants: { variant: 'outline', size: 'md' },
  },
);

export type ChipProps = {
  children: ReactNode;
  className?: string;
} & VariantProps<typeof chipVariants>;

export function Chip({ children, className, variant, size, ...props }: ChipProps) {
  return (
    <span data-slot="chip" className={cn(chipVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}

/** Dot rendered before a chip label to add texture without adding colour noise. */
export function ChipDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('size-1.5 rounded-full bg-current opacity-40', className)}
    />
  );
}
