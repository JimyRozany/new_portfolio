'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { ArrowUpRight, Download, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { socialLabels, socialProfiles } from '@/config/navigation';
import { Link } from '@/i18n/navigation';
import { Counter } from '@/components/motion/counter';
import { Reveal } from '@/components/motion/reveal';
import { TextReveal } from '@/components/motion/text-reveal';
import { StatusDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { getSocialIcon } from '@/components/shared/social-icon';
import { EASE_OUT_EXPO } from '@/components/motion/motion-presets';
import { StackCard } from '@/components/public/stack-card';

const HERO_STATS = [
  { key: 'yearsExperience', value: 2, suffix: '+' },
  { key: 'projectsShipped', value: 12, suffix: '+' },
] as const;

/**
 * Home page hero.
 *
 * The only section allowed to use the full-bleed display type size. It layers
 * four things, in order of importance:
 *   1. Who this is and what they do  → word-by-word headline reveal
 *   2. Proof                         → animated stat counters
 *   3. Two clear actions             → primary + secondary CTA
 *   4. A human signal                → availability badge and social profiles
 *
 * A slow parallax drift is applied to the background layers (not the copy) so
 * the text stays perfectly readable at every scroll position. It is driven by
 * `useScroll`/`useTransform` and respects `prefers-reduced-motion` through the
 * global `MotionConfig`.
 */
export function Hero() {
  const t = useTranslations('home.hero');
  const tNav = useTranslations('nav');
  const tAppName = useTranslations('common');
  const locale = useLocale() as 'en' | 'ar';
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Background layers drift; the copy stays put for legibility.
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32"
    >
      {/* --- Decorative layers ------------------------------------------- */}
      <motion.div
        aria-hidden="true"
        style={{ y: glowY, scale: glowScale }}
        className="pointer-events-none absolute end-[-10%] -top-40 -z-20 size-[42rem] rounded-full bg-[radial-gradient(closest-side,var(--glow-b),transparent)] blur-2xl"
      />
      <motion.div
        aria-hidden="true"
        style={{ y: gridY }}
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-20 h-[38rem] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
      />
      {/* Fades the hero into the next section instead of cutting it. */}
      <div
        aria-hidden="true"
        className="to-background pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent"
      />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* --- Copy --------------------------------------------------- */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.05 }}
            >
              <span className="border-border bg-surface/70 text-caption inline-flex items-center gap-2.5 rounded-full border py-1.5 ps-3 pe-4 backdrop-blur">
                <StatusDot />
                {t('eyebrow')}
              </span>
            </motion.div>

            <p className="text-body-lg text-muted-foreground mt-8">
              <span className="font-display">{t('greeting')}</span>{' '}
              <span className="font-display text-foreground font-semibold">
                {tAppName('appName')}
              </span>
            </p>

            <TextReveal
              text={t('title')}
              highlightWord={t('highlightedWord')}
              as="h1"
              delay={0.15}
              className="text-display mt-4 max-w-3xl"
            />

            <Reveal offset="up" delay={0.45}>
              <p className="text-body-lg text-muted-foreground mt-7 max-w-xl leading-relaxed">
                {t('subtitle')}
              </p>
            </Reveal>

            {/* Actions */}
            <Reveal offset="up" delay={0.55} className="mt-10">
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" variant="accent">
                  <Link href="/projects">
                    {t('primaryCta')}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/contact">{t('secondaryCta')}</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <a href="/Mohamed_Gamal_CV.pdf" download>
                    <Download className="size-4" aria-hidden="true" />
                    {tNav('viewResume')}
                  </a>
                </Button>
              </div>
            </Reveal>

            {/* Proof */}
            <Reveal offset="up" delay={0.65} className="mt-12">
              <dl className="flex flex-wrap items-center gap-x-10 gap-y-6">
                {HERO_STATS.map((stat) => (
                  <div key={stat.key} className="flex flex-col gap-1">
                    <dt className="text-caption text-subtle-foreground tracking-wider uppercase">
                      {t(`stats.${stat.key}`)}
                    </dt>
                    <dd className="font-display text-h2 leading-none font-semibold">
                      <Counter value={stat.value} locale={locale} suffix={stat.suffix} />
                    </dd>
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <dt className="text-caption text-subtle-foreground tracking-wider uppercase">
                    {t('stats.stack')}
                  </dt>
                  <dd className="text-small text-foreground font-mono">
                    Laravel · React · Next.js
                  </dd>
                </div>
              </dl>
            </Reveal>

            {/* Social */}
            <Reveal offset="up" delay={0.75} className="mt-10">
              <ul className="flex items-center gap-2.5">
                {socialProfiles.map((profile) => {
                  const Icon = getSocialIcon(profile.platform);
                  const label = socialLabels[profile.platform]?.[locale] ?? profile.platform;
                  return (
                    <li key={profile.platform}>
                      <a
                        href={profile.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`${label} — ${new URL(profile.url).hostname}`}
                        className="border-border bg-surface text-muted-foreground hover:border-foreground hover:text-foreground grid size-11 place-items-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        {Icon ? <Icon className="size-4.5" aria-hidden="true" /> : null}
                      </a>
                    </li>
                  );
                })}
                <li>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    aria-label={socialLabels.email?.[locale] ?? 'Email'}
                    className="border-border bg-surface text-muted-foreground hover:border-foreground hover:text-foreground grid size-11 place-items-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <Sparkles className="size-4.5" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </Reveal>
          </div>

          {/* --- Visual ------------------------------------------------- */}
          <div className="lg:col-span-5">
            <Reveal offset="end" delay={0.25} duration={0.9}>
              <StackCard />
            </Reveal>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-caption text-subtle-foreground mt-20 hidden items-center gap-3 tracking-[0.2em] uppercase lg:flex"
        >
          <span className="bg-border h-px w-12" />
          {t('scrollHint')}
        </motion.div>
      </Container>
    </section>
  );
}
