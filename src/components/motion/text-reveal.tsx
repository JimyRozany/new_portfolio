'use client';

import { useDirection } from '@/hooks/use-direction';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { EASE_OUT_EXPO } from './motion-presets';

export type TextRevealProps = {
  /** The sentence to animate. Split on word boundaries. */
  text: string;
  className?: string;
  /** Word to emphasise (matched case-insensitively, e.g. a headline keyword). */
  highlightWord?: string;
  /** Seconds before the animation begins. */
  delay?: number;
  /** Seconds between each word. */
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
};

/**
 * Word-by-word headline reveal.
 *
 * The hero title is the first thing a visitor sees, so it animates in as a
 * short cascade of words rather than a generic fade — it reads as intentional
 * craft instead of a template effect. Words are wrapped in a mask so they rise
 * from behind the baseline, which is what makes it feel smooth rather than
 * "wobbly".
 */
export function TextReveal({
  text,
  className,
  highlightWord,
  delay = 0,
  stagger = 0.055,
  as = 'h1',
}: TextRevealProps) {
  const direction = useDirection();
  const words = text.split(/\s+/).filter(Boolean);

  const TAGS = {
    h1: motion.h1,
    h2: motion.h2,
    h3: motion.h3,
    p: motion.p,
    span: motion.span,
  } as const;
  const Component = TAGS[as];

  return (
    <Component className={cn('flex flex-wrap', className)} aria-label={text}>
      {words.map((word, index) => {
        const isHighlight = highlightWord?.toLowerCase() === word.toLowerCase();
        // Arabic is read right-to-left, so the cascade should start at the end.
        const order = direction === 'rtl' ? words.length - 1 - index : index;

        return (
          <span
            key={`${word}-${index}`}
            className="overflow-hidden pb-[0.12em] align-bottom"
            // The visual text is split across spans; this keeps the accessible
            // name intact for screen readers and search engines.
            aria-hidden="true"
          >
            <motion.span
              className={cn('inline-block', isHighlight && 'relative')}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{
                duration: 0.85,
                delay: delay + order * stagger,
                ease: EASE_OUT_EXPO,
              }}
            >
              {word}
              {index < words.length - 1 ? ' ' : ''}
              {isHighlight ? (
                <span
                  aria-hidden="true"
                  className="bg-accent/45 absolute inset-x-0 bottom-1 -z-10 h-[0.3em] rounded-sm"
                />
              ) : null}
            </motion.span>
          </span>
        );
      })}
    </Component>
  );
}
