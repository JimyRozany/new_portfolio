import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

/**
 * One statistic on the overview screen.
 *
 * The whole card is a link rather than a card with a small link inside, because
 * a 1:1 target is easier to hit and there is no other focusable element to
 * compete with. The card's real content is the number, so the arrow is
 * decorative and the accessible name comes from the label.
 */
export function CountCard({
  label,
  value,
  href,
  detail,
  emphasis = false,
}: {
  label: string;
  value: number;
  href: Route;
  detail: string | null;
  /** Draws attention, used for unread messages. */
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Card
        className={cn(
          'group-hover:border-foreground/20 h-full transition-colors',
          emphasis && 'border-accent/50',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-muted-foreground text-sm">{label}</p>
          <ArrowUpRight
            className="text-subtle-foreground group-hover:text-foreground size-4 shrink-0 transition-colors"
            aria-hidden="true"
          />
        </div>

        <p
          className={cn(
            'font-display mt-2 text-3xl leading-none font-semibold tracking-tight tabular-nums',
            emphasis && 'text-accent',
          )}
        >
          {value}
        </p>

        {detail ? <p className="text-subtle-foreground mt-1.5 text-xs">{detail}</p> : null}
      </Card>
    </Link>
  );
}
