'use client';

import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { mainNav } from '@/config/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from '@/components/shared/logo';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { cn } from '@/lib/utils/cn';

/**
 * Mobile navigation.
 *
 * A Radix dialog used as an off-canvas drawer: it inherits focus trapping,
 * scroll locking, `Escape` to close and focus restoration, all of which a
 * hand-rolled menu would get wrong on at least one device.
 * The language and theme controls live inside the drawer as the spec requires.
 */
export function MobileNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
        className={cn(
          'border-border bg-surface-2 grid size-10 place-items-center rounded-full border lg:hidden',
          'text-foreground hover:bg-surface transition-colors duration-200',
          'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
          'data-[state=open]:bg-surface',
        )}
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent side="start" className="w-[min(20rem,88vw)] p-0">
        <div className="border-border flex items-center justify-between border-b px-6 py-5">
          <SheetTitle className="sr-only">{t('nav.label')}</SheetTitle>
          <Link href="/" onClick={() => setOpen(false)}>
            <Logo name={t('common.appName')} />
          </Link>
        </div>

        <nav aria-label={t('nav.label')} className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="flex flex-col gap-1">
            {mainNav.map((item, index) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'text-body-lg flex items-center justify-between rounded-lg px-4 py-3 font-medium',
                      'transition-colors duration-200',
                      isActive
                        ? 'bg-surface-2 text-foreground'
                        : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
                    )}
                  >
                    {t(item.labelKey)}
                    <span
                      aria-hidden="true"
                      className="text-caption text-subtle-foreground font-mono"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-border flex items-center justify-between gap-3 border-t px-6 py-5">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        {/* Radix requires a description for screen readers when a title exists. */}
        <SheetDescription className="sr-only">{t('nav.openMenu')}</SheetDescription>
      </SheetContent>
    </Sheet>
  );
}
