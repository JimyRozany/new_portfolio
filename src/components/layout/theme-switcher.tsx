'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useRef } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils/cn';

const OPTIONS = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
] as const;

/**
 * Theme switcher.
 *
 * A segmented control rather than a single toggle because the spec requires
 * three explicit states (light / dark / system). The active option is marked
 * with an inset shadow *and* `aria-checked`, so the state is never communicated
 * by colour alone.
 *
 * The control renders a neutral placeholder on the server because the stored
 * preference only exists in the browser — that avoids a hydration mismatch
 * while keeping the layout stable.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const t = useTranslations('theme');
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const previous = useRef(theme);

  const activeTheme = theme ?? 'system';

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={cn('border-border bg-surface-2 h-10 w-[6.75rem] rounded-full border', className)}
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('label')}
      className={cn(
        'border-border bg-surface-2 flex items-center gap-0.5 rounded-full border p-1',
        className,
      )}
    >
      {OPTIONS.map(({ value, icon: Icon }) => {
        const isActive = activeTheme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={t(value)}
            onClick={() => {
              setTheme(value);
              previous.current = value;
            }}
            className={cn(
              'grid size-8 place-items-center rounded-full transition-colors duration-200',
              'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
              isActive
                ? 'bg-surface text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

/** Compact icon-only variant for tight spaces such as the mobile drawer header. */
export function ThemeToggleIcon({ className }: { className?: string }) {
  const t = useTranslations('theme');
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggle')}
      className={cn(
        'border-border text-muted-foreground grid size-10 place-items-center rounded-full border',
        'hover:bg-surface-2 hover:text-foreground transition-colors duration-200',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
    >
      {isDark ? (
        <Moon className="size-4" aria-hidden="true" />
      ) : (
        <Sun className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
