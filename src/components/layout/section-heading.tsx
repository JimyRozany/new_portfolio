import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Reveal } from '@/components/motion/reveal';

/**
 * Small uppercase label that sits above every section title.
 *
 * The leading dot + rule is the recurring "system status" motif used across
 * the site, which gives the layout a consistent editorial rhythm.
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'text-caption text-muted-foreground inline-flex items-center gap-3 font-medium tracking-[0.18em] uppercase',
        className,
      )}
    >
      <span aria-hidden="true" className="bg-accent size-1.5 rounded-full" />
      {children}
    </span>
  );
}

export type SectionHeadingProps = {
  /** Small uppercase label above the title. */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned slot for a "view all" link or a filter control. */
  action?: ReactNode;
  align?: 'start' | 'center';
  className?: string;
  /** Heading level for correct document outline. */
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
};

/**
 * The standard section header.
 *
 * Kept as one component so spacing, hierarchy and the reveal rhythm are
 * identical on every page — this is what stops a long scrolling page from
 * feeling like a pile of unrelated blocks.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
  className,
  as: Heading = 'h2',
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center md:text-center',
        className,
      )}
    >
      <Reveal offset="up" className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Heading
          id={id}
          className={cn('text-h1 mt-4 text-balance', align === 'center' && 'mx-auto')}
        >
          {title}
        </Heading>
        {description ? (
          <p className="text-body-lg text-muted-foreground mt-4 leading-relaxed">{description}</p>
        ) : null}
      </Reveal>

      {action ? (
        <Reveal offset="up" delay={0.12} className="shrink-0">
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}

export function SectionShell({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-10 sm:gap-14', className)} {...props}>
      {children}
    </div>
  );
}
