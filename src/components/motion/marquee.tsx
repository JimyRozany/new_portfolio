'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type MarqueeProps = {
  children: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  /** Pause the animation when a visitor hovers. */
  pauseOnHover?: boolean;
  className?: string;
  /**
   * Reverse direction — used for the second row of the hero strip so the two
   * rows drift apart instead of moving in lockstep.
   */
  reverse?: boolean;
};

/**
 * Infinite horizontal ticker.
 *
 * The track is rendered twice and translated by exactly `-50%`, which produces
 * a seamless loop with no JavaScript and no layout thrash. Both copies are
 * hidden from assistive tech to avoid the content being announced twice.
 */
export function Marquee({
  children,
  duration = 42,
  pauseOnHover = true,
  className,
  reverse = false,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'group relative flex w-full overflow-hidden',
        // Edge fades make the items appear to enter/leave instead of clipping.
        'mask-fade-x',
        className,
      )}
    >
      <div
        className={cn(
          'flex w-max shrink-0 items-center gap-10 pe-10',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div className="flex shrink-0 items-center gap-10" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
