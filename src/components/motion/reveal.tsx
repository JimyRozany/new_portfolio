'use client';

import { useDirection } from '@/hooks/use-direction';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { EASE_OUT_EXPO, fadeUp } from './motion-presets';

type Offset = 'up' | 'down' | 'start' | 'end' | 'none';

/**
 * Tags a reveal may render as.
 *
 * The animated elements have to be real list items or sections sometimes: a
 * `<div>` inside `<ol>` is invalid HTML and breaks the list semantics that make
 * a timeline navigable, so the tag is selectable rather than hard-coded to
 * `div`. Kept to the handful of structural tags the site actually needs.
 */
export type RevealTag = 'div' | 'li' | 'ul' | 'ol' | 'section' | 'article' | 'figure';

const MOTION_TAGS = {
  div: motion.div,
  li: motion.li,
  ul: motion.ul,
  ol: motion.ol,
  section: motion.section,
  article: motion.article,
  figure: motion.figure,
} as const;

const OFFSET_MAP: Record<Offset, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  start: { x: 32, y: 0 },
  end: { x: -32, y: 0 },
  none: { x: 0, y: 0 },
};

export type RevealProps<T extends RevealTag = 'div'> = {
  children?: React.ReactNode;
  className?: string;
  /** Direction the element travels *from*. */
  offset?: Offset;
  /** Element to render. Defaults to `div`; use `li` inside a list. */
  as?: T;
  /** Seconds to wait before animating. */
  delay?: number;
  /** Seconds the animation runs for. */
  duration?: number;
  /** Fraction of the element that must be visible before it animates. */
  amount?: number;
  /** Rest props forwarded to the underlying `motion` element. */
  motionProps?: React.ComponentProps<(typeof MOTION_TAGS)[T]>;
};

/**
 * Scroll-reveal wrapper — the workhorse animation of the public site.
 *
 * Design notes:
 *  - Fires **once** per element; a page that re-animates on every scroll pass
 *    feels restless and burns CPU.
 *  - `amount` plus a negative bottom margin means the reveal happens just
 *    before the element reaches the middle of the viewport.
 *  - Offsets are *logical*: `start`/`end` are mirrored for Arabic so an element
 *    always slides in from the reading edge.
 *
 * Extra props go through `motionProps` rather than being spread directly, which
 * keeps the public API of this component small and typed.
 */
export function Reveal<T extends RevealTag = 'div'>({
  children,
  className,
  offset = 'up',
  as = 'div' as T,
  delay = 0,
  duration = 0.7,
  amount = 0.2,
  motionProps,
}: RevealProps<T>) {
  const direction = useDirection();
  const base = OFFSET_MAP[offset];
  // `x` is a physical axis, so mirror it in RTL.
  const x = direction === 'rtl' ? -base.x : base.x;
  // The tag is chosen at runtime, so the union of motion components has to be
  // widened here. The *call site* stays type-safe: `motionProps` is checked
  // against the specific element requested by `as`.
  const Component = MOTION_TAGS[as] as React.ElementType;

  return (
    <Component
      className={cn(className)}
      initial={{ opacity: 0, x, y: base.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount, margin: '0px 0px -80px 0px' }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

export type StaggerProps<T extends RevealTag = 'div'> = Omit<
  RevealProps<T>,
  'offset' | 'duration'
> & {
  /** Seconds between each child's animation. */
  stagger?: number;
};

/**
 * Container that staggers its children on scroll.
 * Pair with `<StaggerItem>` for grids and lists.
 */
export function Stagger<T extends RevealTag = 'div'>({
  children,
  className,
  as = 'div' as T,
  stagger = 0.09,
  delay = 0,
  amount = 0.15,
  motionProps,
}: StaggerProps<T>) {
  const Component = MOTION_TAGS[as] as React.ElementType;

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: '0px 0px -60px 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

export type StaggerItemProps<T extends RevealTag = 'div'> = Omit<
  RevealProps<T>,
  'offset' | 'delay' | 'duration' | 'amount'
>;

/** Child of `<Stagger>` — inherits the container's timing automatically. */
export function StaggerItem<T extends RevealTag = 'div'>({
  children,
  className,
  as = 'div' as T,
  motionProps,
}: StaggerItemProps<T>) {
  const Component = MOTION_TAGS[as] as React.ElementType;

  return (
    <Component className={cn(className)} variants={fadeUp} {...motionProps}>
      {children}
    </Component>
  );
}
