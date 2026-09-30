'use client';

import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { EASE_OUT_EXPO } from './motion-presets';

/**
 * Page transition.
 *
 * `AnimatePresence` is keyed on the pathname, so navigating between routes
 * cross-fades and lifts the incoming page slightly. The exit animation is kept
 * short (0.2s) so navigation never feels like it is waiting on decoration.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
