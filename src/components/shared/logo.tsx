import { cn } from '@/lib/utils/cn';

export type LogoProps = {
  /** Text rendered next to the mark; omit for a mark-only lockup. */
  name?: string;
  className?: string;
  /** Renders a monochrome mark (used on dark image backgrounds). */
  variant?: 'default' | 'muted';
};

/**
 * Brand mark.
 *
 * A hand-drawn geometric "M/G" monogram built from strokes rather than an icon
 * font, so it inherits `currentColor`, scales perfectly and adds no extra
 * network request. The accent dot is the single volt-coloured detail that ties
 * the identity together.
 */
export function Logo({ name, className, variant = 'default' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative grid size-9 shrink-0 place-items-center">
        <svg viewBox="0 0 36 36" fill="none" className="size-9" role="img" aria-hidden="true">
          <rect
            x="0.75"
            y="0.75"
            width="34.5"
            height="34.5"
            rx="10.5"
            className={cn(
              'border',
              variant === 'muted' ? 'border-border-strong/70' : 'border-border-strong',
            )}
            fill="var(--surface)"
          />
          <path
            d="M10 24.5V11.5L18 19.5L26 11.5V24.5"
            className="stroke-foreground"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="26.6" cy="11.4" r="2.3" className="fill-accent" />
        </svg>
      </span>

      {name ? (
        <span className="font-display text-body-lg leading-none font-semibold tracking-tight">
          {name}
        </span>
      ) : null}
    </span>
  );
}
