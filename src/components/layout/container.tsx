import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Horizontal page gutter.
 *
 * Wraps every section so the public site and the admin dashboard share exactly
 * one content width — this is the main lever for the site feeling "framed".
 */
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="container" className={cn('container-page', className)} {...props} />;
}

export type SectionProps = ComponentProps<'section'> & {
  children: ReactNode;
  /** `sm` for compact bands, `md` (default) for standard, `lg` for hero-sized. */
  spacing?: 'sm' | 'md' | 'lg';
  /** Adds the faint technical grid behind the content. */
  grid?: boolean;
  /** Draws a hairline between this section and the previous one. */
  divided?: boolean;
};

const SPACING = {
  sm: 'py-14 sm:py-16',
  md: 'py-20 sm:py-24 lg:py-28',
  lg: 'py-24 sm:py-32 lg:py-40',
} as const;

/** Vertical rhythm for a page section. */
export function Section({
  children,
  className,
  spacing = 'md',
  grid,
  divided,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        'relative isolate scroll-mt-24',
        SPACING[spacing],
        divided && 'hairline-t',
        className,
      )}
      {...props}
    >
      {grid ? (
        <div
          aria-hidden="true"
          className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]"
        />
      ) : null}
      {children}
    </section>
  );
}
