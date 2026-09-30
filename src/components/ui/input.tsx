import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Form field primitives.
 *
 * The public contact form and every admin form share these components so
 * focus rings, error states and disabled styling can never drift apart.
 */

const fieldControlVariants = cva(
  [
    'w-full rounded-lg border border-input bg-surface text-foreground',
    'placeholder:text-subtle-foreground',
    'transition-[border-color,box-shadow,background-color] duration-200 ease-out',
    'focus-visible:border-foreground/40 focus-visible:outline-none',
    'focus-visible:ring-[3px] focus-visible:ring-ring/25',
    'disabled:cursor-not-allowed disabled:opacity-60',
    'aria-invalid:border-danger aria-invalid:ring-[3px] aria-invalid:ring-danger/20',
  ],
  {
    variants: {
      size: {
        sm: 'h-9 px-3 text-small',
        md: 'h-11 px-4 text-body',
        lg: 'h-13 px-5 text-body-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export type InputProps = Omit<ComponentProps<'input'>, 'size'> &
  VariantProps<typeof fieldControlVariants>;

export function Input({ className, size, type = 'text', ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(fieldControlVariants({ size }), className)}
      {...props}
    />
  );
}

export type TextareaProps = Omit<ComponentProps<'textarea'>, 'size'> &
  VariantProps<typeof fieldControlVariants>;

export function Textarea({ className, rows = 5, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(fieldControlVariants(), 'min-h-28 resize-y py-3 leading-relaxed', className)}
      {...props}
    />
  );
}

export type SelectProps = Omit<ComponentProps<'select'>, 'size'> &
  VariantProps<typeof fieldControlVariants>;

/**
 * Native `<select>` styled to match the design system.
 * A native control keeps full keyboard and mobile-wheel accessibility for free.
 */
export function Select({ className, size, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(fieldControlVariants({ size }), 'appearance-none pe-10', className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="text-muted-foreground pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2"
      >
        <path
          d="m6 8 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'text-small text-foreground font-medium',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

/** Optional helper / hint text rendered under a control. */
export function FieldHint({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-caption text-subtle-foreground', className)} {...props} />;
}

/** Validation message. `tone="error"` also sets the ARIA live politeness. */
export function FieldError({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className={cn('text-caption text-danger flex items-center gap-1.5', className)}
      {...props}
    />
  );
}
