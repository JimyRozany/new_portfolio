'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Code2, Layers, Server, Workflow } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { EASE_OUT_EXPO } from '@/components/motion/motion-presets';
import { SpotlightCard } from '@/components/motion/spotlight-card';

/** The stack is hardcoded in this milestone; it becomes CMS content in Phase 5. */
const LAYERS = [
  { icon: Server, label: 'Laravel', sub: 'REST API · MySQL', tone: 'from-amber-400/20' },
  { icon: Workflow, label: 'Architecture', sub: 'MVC · Modules', tone: 'from-sky-400/20' },
  { icon: Code2, label: 'React', sub: 'Hooks · Redux', tone: 'from-cyan-400/20' },
  { icon: Layers, label: 'Next.js', sub: 'App Router', tone: 'from-emerald-400/20' },
] as const;

const SUPPORTING = ['Tailwind CSS', 'MySQL', 'Prisma', 'Git'] as const;

/**
 * Animated "stack" card used on the end side of the hero.
 *
 * It is intentionally a diagram rather than a photo: it communicates the actual
 * architecture in the first second, which says more to a hiring developer than a
 * headshot. Layers spring in on a short stagger and the whole card carries the
 * cursor spotlight used across the rest of the design.
 */
export function StackCard() {
  const t = useTranslations('home.hero.stats');

  return (
    <SpotlightCard
      radius={420}
      className="border-border bg-surface/70 relative rounded-2xl border p-6 shadow-lg backdrop-blur-xl sm:p-7"
    >
      {/* Header row mimics a code editor so the card reads as "engineering". */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="bg-border-strong size-2.5 rounded-full" />
          <span className="bg-border-strong size-2.5 rounded-full" />
          <span className="bg-accent size-2.5 rounded-full" />
        </div>
        <span className="text-caption text-subtle-foreground font-mono" dir="ltr">
          stack.config.ts
        </span>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {LAYERS.map((layer, index) => {
          const Icon = layer.icon;
          return (
            <motion.li
              key={layer.label}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 + index * 0.12, ease: EASE_OUT_EXPO }}
            >
              <div
                className={`border-border flex items-center gap-4 rounded-xl border bg-gradient-to-r ${layer.tone} hover:border-border-strong to-transparent p-4 transition-colors duration-300`}
              >
                <span className="border-border bg-surface text-foreground grid size-10 shrink-0 place-items-center rounded-lg border">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="font-display text-body font-semibold">{layer.label}</span>
                  <span className="text-caption text-muted-foreground font-mono">{layer.sub}</span>
                </span>
              </div>
            </motion.li>
          );
        })}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.05, ease: EASE_OUT_EXPO }}
        className="border-border mt-6 flex flex-wrap items-center gap-2 border-t pt-5"
      >
        <Chip size="sm" variant="accent">
          {t('stack')}
        </Chip>
        {SUPPORTING.map((tech) => (
          <Chip key={tech} size="sm" variant="soft">
            {tech}
          </Chip>
        ))}
      </motion.div>
    </SpotlightCard>
  );
}
