'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useState } from 'react';
import { mainNav } from '@/config/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils/cn';

/**
 * Sticky site header.
 *
 * Transparent over the hero, switching to a frosted surface once the page is
 * scrolled. Scroll position is read with `useScroll` (compositor-friendly)
 * instead of a scroll listener, and the bottom hairline is a scaled
 * `motion.div` rather than a class toggle so no layout is recalculated.
 *
 * All links go through the locale-aware `Link`, which keeps the active
 * language prefix in the URL.
 */
export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (value) => setIsScrolled(value > 12));

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300 ease-out',
        isScrolled ? 'glass' : 'bg-transparent',
      )}
    >
      <Container>
        <div className="flex h-18 items-center justify-between gap-6">
          <Link
            href="/#main-content"
            className="focus:bg-surface focus:text-small sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
          >
            {t('nav.skipToContent')}
          </Link>

          <Link href="/" aria-label={t('common.appName')} className="shrink-0">
            <Logo name={t('common.appName')} />
          </Link>

          <nav aria-label={t('nav.label')} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => {
                const isActive =
                  item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'text-small relative block rounded-full px-4 py-2 font-medium transition-colors duration-200',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {t(item.labelKey)}
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active-pill"
                          className="bg-surface-2 absolute inset-0 -z-10 rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <MobileNav />
          </div>
        </div>
      </Container>

      <motion.div
        aria-hidden="true"
        className="bg-border h-px origin-center"
        initial={false}
        animate={{ scaleX: isScrolled ? 1 : 0, opacity: isScrolled ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </header>
  );
}
