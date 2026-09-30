'use client';

import { useFormatter } from 'next-intl';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils/cn';

/**
 * A relative timestamp ("3 days ago") with an absolute fallback.
 *
 * Relative time depends on `Date.now()`, which differs between the server
 * render and hydration, so the two cannot agree. Rather than suppress the
 * mismatch, the server renders the absolute short date and the client swaps in
 * the relative form once mounted. That keeps the first paint correct, avoids a
 * layout jump being *caused* by the swap, and needs no hydration escape hatch.
 */
export function RelativeTime({ date, className }: { date: Date | string; className?: string }) {
  const mounted = useMounted();
  const format = useFormatter();
  const value = typeof date === 'string' ? new Date(date) : date;

  return (
    <time
      dateTime={value.toISOString()}
      className={cn('text-subtle-foreground shrink-0 text-xs whitespace-nowrap', className)}
    >
      {mounted ? format.relativeTime(value) : format.dateTime(value, { dateStyle: 'medium' })}
    </time>
  );
}
