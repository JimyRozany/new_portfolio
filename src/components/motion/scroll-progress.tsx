'use client';

import { motion, useScroll, useSpring } from 'motion/react';

/**
 * Reading-progress bar pinned to the top of the viewport.
 *
 * Uses a spring so the bar glides instead of ticking frame-by-frame, and it
 * renders nothing until the page is actually scrollable.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  return <motion.div aria-hidden="true" className={cnProgress(className)} style={{ scaleX }} />;
}

function cnProgress(className?: string) {
  return [
    'fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent rtl:origin-right',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}
