'use client';

import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { localeNativeNames } from '@/config/site';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils/cn';

/**
 * Language switcher.
 *
 * Switching keeps the visitor on the *same page* — the pathname and its dynamic
 * params (`/projects/[slug]`) are preserved — and re-renders through
 * `router.refresh()`. The pending state dims the trigger so the swap gives
 * immediate feedback.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('language');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSelect(nextLocale: Locale) {
    if (nextLocale === locale) return;

    startTransition(() => {
      // `usePathname()` already returns the resolved path (e.g. `/projects/my-slug`
      // with no locale prefix), so a plain string keeps dynamic segments intact.
      router.replace(pathname, { locale: nextLocale });
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('label')}
        className={cn(
          'border-border bg-surface-2 inline-flex h-10 items-center gap-2 rounded-full border px-3.5',
          'text-small text-muted-foreground font-medium transition-colors duration-200',
          'hover:bg-surface hover:text-foreground',
          'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
          'data-[state=open]:bg-surface data-[state=open]:text-foreground',
          isPending && 'opacity-60',
          className,
        )}
      >
        <Languages className="size-4" aria-hidden="true" />
        <span className="uppercase">{locale}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40">
        {locales.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => handleSelect(option)}
            className={cn('justify-between', option === locale && 'bg-surface-2 text-foreground')}
          >
            <span>{localeNativeNames[option]}</span>
            {option === locale ? (
              <span aria-hidden="true" className="bg-accent size-1.5 rounded-full" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
