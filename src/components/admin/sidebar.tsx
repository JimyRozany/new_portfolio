'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { adminHref, adminNavigation } from '@/config/admin-navigation';
import { cn } from '@/lib/utils/cn';

/**
 * Dashboard sidebar.
 *
 * Active state is computed from the pathname with a prefix match, so
 * `/admin/projects/new` still highlights "Projects". `exactMatch` handles the
 * dashboard index itself, where a prefix match would light up on every route.
 *
 * Every item renders a real `<a>` via `next/link` so the browser still gets
 * real navigation semantics (middle-click, open in new tab) rather than a div
 * with an onClick.
 */
export function AdminSidebar({
  collapsed,
  unreadMessages,
  onNavigate,
}: {
  collapsed: boolean;
  unreadMessages: number;
  /** Called after a link is followed; used to dismiss the mobile drawer. */
  onNavigate?: () => void;
}) {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={200}>
      <nav aria-label={t('label')} className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-4">
          {adminNavigation.groups.map((group, groupIndex) => (
            <li key={group.labelKey ?? `group-${groupIndex}`}>
              {group.labelKey && !collapsed ? (
                <p className="text-subtle-foreground px-3 pb-1.5 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                  {t(group.labelKey)}
                </p>
              ) : null}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const href = adminHref(item.href);
                  const isActive =
                    item.href === ''
                      ? pathname === '/admin'
                      : pathname === href || pathname.startsWith(`${href}/`);

                  const badge =
                    item.badge === 'unreadMessages' && unreadMessages > 0 ? unreadMessages : null;

                  const content = (
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
                        collapsed && 'justify-center px-0',
                        isActive
                          ? 'bg-accent-soft text-accent-soft-foreground font-medium'
                          : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
                      )}
                    >
                      <item.icon
                        className="size-4 shrink-0"
                        strokeWidth={isActive ? 2.2 : 1.8}
                        aria-hidden="true"
                      />

                      {!collapsed ? (
                        <>
                          <span className="truncate">{t(item.labelKey)}</span>
                          {badge ? <Badge count={badge} /> : null}
                        </>
                      ) : null}
                    </Link>
                  );

                  return (
                    <li key={item.href}>
                      {/* When collapsed there is no text label, so the tooltip
                          is the only accessible name. */}
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{content}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            {t(item.labelKey)}
                            {badge ? <Badge count={badge} className="ms-2" /> : null}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </TooltipProvider>
  );
}

function Badge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        'bg-accent ms-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5',
        'text-accent-foreground font-mono text-[0.625rem] font-semibold',
        className,
      )}
    >
      {/* The count is repeated for screen readers so it is not just a coloured
          dot, and capped visually so a large number cannot stretch the rail. */}
      <span aria-hidden={count > 99}>{count > 99 ? '99+' : count}</span>
      <span className="sr-only">{count}</span>
    </span>
  );
}
