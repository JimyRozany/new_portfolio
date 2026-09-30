'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Shared animation vocabulary.
 *
 * All durations and easings live here (and in `globals.css`) rather than being
 * re-invented per component, which is what makes the whole site feel like one
 * coherent motion system. `MotionConfig reducedMotion="user"` in
 * `MotionProvider` automatically converts every one of these to a simple fade
 * for visitors who prefer reduced motion.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_STANDARD = [0.2, 0, 0, 1] as const;

/** Default timing for a single element entering the viewport. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

/** Softer variant for dense layouts where a 24px lift feels too much. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_STANDARD } },
};

export const fadeFromStart: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

export const fadeFromEnd: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

/** Subtle scale-up used by cards and images. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
};

/**
 * Container variant that cascades its children.
 * Children must declare `variants={fadeUp}` and rely on `staggerChildren`.
 */
export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** Default viewport trigger: fire once, slightly before the element is centred. */
export const viewportOnce = { once: true, amount: 0.2, margin: '0px 0px -80px 0px' } as const;

/** Directional offset that respects RTL (a positive `x` means "from the end"). */
export function offsetFor(direction: 'ltr' | 'rtl', amount: number) {
  return direction === 'rtl' ? -amount : amount;
}

/**
 * Shared `whileInView` props.
 * Returning this from a helper keeps the reveal behaviour identical between
 * sections, cards and list items.
 */
export const revealProps = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: viewportOnce,
} as const;

export function MotionDiv({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div className={cn(className)} {...props}>
      {children}
    </motion.div>
  );
}

export type MotionDivProps = React.ComponentProps<typeof motion.div>;
export type MotionVariants = Variants;
export type { ReactNode };
