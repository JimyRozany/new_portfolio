'use client';

import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import {
  useCallback,
  type CSSProperties,
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';

export type SpotlightCardProps = ComponentProps<'div'> & {
  children: ReactNode;
  /** Diameter of the glow in pixels. */
  radius?: number;
  /** Any CSS colour; defaults to the ambient accent token. */
  color?: string;
  /** Only follow a mouse cursor (skips the work on touch devices). */
  hoverOnly?: boolean;
};

/**
 * Card with a cursor-following highlight.
 *
 * A single moving radial gradient makes a flat card feel alive and signals
 * interactivity. The pointer position is written straight to CSS variables via
 * Motion's `useMotionValue`, so the effect never triggers a React re-render —
 * that matters because this runs on every pointer move.
 */
export function SpotlightCard({
  children,
  className,
  radius = 320,
  color = 'var(--glow-a)',
  hoverOnly = true,
  style,
  ...props
}: SpotlightCardProps) {
  const pointerX = useMotionValue(-9999);
  const pointerY = useMotionValue(-9999);

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${pointerX}px ${pointerY}px, ${color}, transparent 70%)`;

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (hoverOnly && event.pointerType !== 'mouse') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      pointerX.set(event.clientX - bounds.left);
      pointerY.set(event.clientY - bounds.top);
    },
    [hoverOnly, pointerX, pointerY],
  );

  const handlePointerLeave = useCallback(() => {
    // Park the glow far outside the card so it fades out cleanly.
    pointerX.set(-9999);
    pointerY.set(-9999);
  }, [pointerX, pointerY]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={style}
      className={cn('group/spotlight relative isolate overflow-hidden', className)}
      {...props}
    >
      {/* `pointer-events-none` keeps the glow from swallowing clicks. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/spotlight:opacity-100"
        style={{ background }}
      />
      {children}
    </div>
  );
}

/** Small reusable helper so callers can tune the glow without inline objects. */
export function spotlightVars(color: string): CSSProperties {
  return { ['--spotlight-color' as string]: color } as CSSProperties;
}
