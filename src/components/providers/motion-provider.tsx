'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Global motion configuration.
 *
 * `reducedMotion="user"` makes the whole app respect the OS
 * "reduce motion" setting: every transform/opacity animation still runs, but
 * Motion collapses it to a simple cross-fade instead of movement. This is the
 * single place to tune the site's motion personality.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.9 }}
    >
      {children}
    </MotionConfig>
  );
}
