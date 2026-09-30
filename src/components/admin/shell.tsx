'use client';

import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { adminHref } from '@/config/admin-navigation';
import { useStoredBoolean } from '@/hooks/use-stored-boolean';
import { AdminSidebar } from './sidebar';
import { LogoutButton } from './logout-button';
import type { UserRole } from '@/generated/prisma/client';

export type ShellUser = { name: string | null; email: string; role: UserRole };

const COLLAPSED_KEY = 'admin:sidebar-collapsed';

/**
 * Dashboard chrome: sidebar, top bar and the content area.
 *
 * The sidebar collapses to icons on desktop and becomes an overlay drawer on
 * mobile. The collapsed state lives in `localStorage` so the choice survives a
 * reload; the drawer is plain component state and is closed explicitly when a
 * link is followed, which is more direct than watching the pathname in an
 * effect.
 */
export function AdminShell({
  user,
  unreadMessages,
  children,
}: {
  user: ShellUser;
  unreadMessages: number;
  children: React.ReactNode;
}) {
  const t = useTranslations('admin.nav');
  const [collapsed, setCollapsed] = useStoredBoolean(COLLAPSED_KEY);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  // Lock body scroll while the overlay drawer is open. This is a genuine
  // external-system sync (the `document`), not derived render state, so an
  // effect is the right tool.
  useEffect(() => {
    if (!drawerOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh">
      {/* ---- Desktop sidebar ---- */}
      <aside
        className={[
          'border-border bg-surface fixed inset-y-0 start-0 z-40 hidden shrink-0 flex-col border-e',
          'transition-[width] duration-300 ease-out lg:flex',
          collapsed ? 'w-16' : 'w-64',
        ].join(' ')}
      >
        <div
          className={[
            'border-border flex h-16 items-center border-b',
            collapsed ? 'justify-center px-2' : 'justify-between px-4',
          ].join(' ')}
        >
          <Logo href={adminHref('')} label={t('label')} className={collapsed ? 'p-1' : undefined} />
        </div>

        <AdminSidebar collapsed={collapsed} unreadMessages={unreadMessages} />

        <div className={['border-border mt-auto border-t', collapsed ? 'p-2' : 'p-3'].join(' ')}>
          <LogoutButton collapsed={collapsed} />
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? t('expand') : t('collapse')}
          aria-pressed={collapsed}
          className="border-border bg-surface text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute -end-3 top-[3.25rem] grid size-6 place-items-center rounded-full border shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-3.5" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </aside>

      {/* ---- Mobile drawer ---- */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t('label')}
            onClick={closeDrawer}
            className="bg-foreground/20 absolute inset-0 backdrop-blur-[2px]"
          />

          <div className="border-border bg-surface absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col border-e shadow-xl">
            <div className="border-border flex h-16 items-center justify-between border-b px-4">
              <Logo href={adminHref('')} label={t('label')} />
              <Button variant="ghost" size="icon" onClick={closeDrawer} aria-label={t('collapse')}>
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <AdminSidebar
              collapsed={false}
              unreadMessages={unreadMessages}
              onNavigate={closeDrawer}
            />

            <div className="border-border mt-auto border-t p-3">
              <LogoutButton collapsed={false} />
            </div>
          </div>
        </div>
      ) : null}

      {/* ---- Content column ---- */}
      <div
        className={[
          'transition-[padding] duration-300 ease-out',
          collapsed ? 'lg:ps-16' : 'lg:ps-64',
        ].join(' ')}
      >
        <header className="border-border bg-background/85 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label={t('label')}
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>

          <Breadcrumbs />

          <div className="ms-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/en" target="_blank" rel="noreferrer">
                {t('viewSite')}
              </Link>
            </Button>
            <ThemeSwitcher />
            <div className="hidden text-end sm:block">
              <p className="text-sm leading-tight font-medium">{user.name ?? user.email}</p>
              <p className="text-subtle-foreground font-mono text-[0.6875rem] tracking-wide uppercase">
                {user.role}
              </p>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

/**
 * Breadcrumb trail derived from the current pathname.
 *
 * Derived rather than passed down, so it can never drift out of sync with the
 * URL. Segments are humanised (`social-links` → `Social Links`) because the
 * admin has no per-route message keys for chrome this small.
 *
 * The `admin` segment is dropped and rendered as a separate, non-humanised
 * "Dashboard" link.
 */
function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean).slice(1); // drop `admin`
  const crumbs = segments.map((segment, index) => ({
    label: segment
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    href: adminHref(segments.slice(0, index + 1).join('/')),
    isLast: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        <li className="text-muted-foreground shrink-0">
          <Link href={adminHref('')} className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </li>

        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
            <span aria-hidden="true" className="text-subtle-foreground">
              /
            </span>
            {crumb.isLast ? (
              <span aria-current="page" className="truncate font-medium">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground truncate transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
