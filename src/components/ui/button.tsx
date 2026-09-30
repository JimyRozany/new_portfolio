import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Button variants.
 *
 * The palette is intentionally small: a solid `primary` (near-black / white),
 * a `secondary` surface, a `ghost` for low-emphasis actions and `accent` for
 * the single highlighted call-to-action on a page. `destructive` is reserved
 * for irreversible actions only.
 */
export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-full font-medium select-none',
    'transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-background shadow-xs hover:bg-foreground/90 hover:shadow-md',
        secondary:
          'border border-border bg-surface text-foreground shadow-xs hover:border-border-strong hover:bg-surface-2',
        ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
        outline:
          'border border-border-strong bg-transparent text-foreground hover:border-foreground hover:bg-surface-2',
        accent:
          'bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover hover:shadow-glow',
        link: 'text-foreground underline-offset-4 hover:underline',
        destructive: 'bg-danger text-white shadow-xs hover:bg-danger/90',
        glass: 'glass border border-border text-foreground shadow-sm hover:bg-surface-2',
      },
      size: {
        sm: 'h-9 px-4 text-small',
        md: 'h-11 px-6 text-body',
        lg: 'h-13 px-8 text-body-lg',
        icon: 'size-10',
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render as the single child element (e.g. a `<Link>`) instead of a `<button>`. */
    asChild?: boolean;
    /** Show a spinner, disable interaction and mark the control busy for a11y. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {/*
        `Slot` (used by `asChild`) requires exactly one element child, so the
        spinner is only injected for the native `<button>` branch — an
        `asChild` button wraps a link and is never in a loading state.
      */}
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {children}
        </>
      )}
    </Component>
  );
}
