'use client';

import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { formatNumber, type SupportedLocale } from '@/lib/utils/format';

export type CounterProps = {
  /** Target value the counter settles on. */
  value: number;
  /** Seconds the count-up takes. */
  duration?: number;
  locale: SupportedLocale;
  className?: string;
  /** Rendered after the number, e.g. `+`. */
  suffix?: string;
};

/**
 * Counts up once the element scrolls into view.
 *
 * Implemented with `requestAnimationFrame` on a cubic ease-out curve rather
 * than a library so the easing matches `--ease-out-expo` used everywhere else,
 * and so the final value is exactly `value` (no floating-point drift).
 */
export function Counter({ value, duration = 1.6, locale, className, suffix }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let frame = 0;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      const progress = Math.min(1, elapsed / duration);

      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(eased * value));

      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {formatNumber(display, locale)}
      {suffix}
    </span>
  );
}
