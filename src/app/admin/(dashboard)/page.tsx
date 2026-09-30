import type { Route } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { adminHref } from '@/config/admin-navigation';
import { getDashboardCounts, getRecentActivity } from '@/server/queries/admin';
import { CountCard } from './count-card';
import { RelativeTime } from './relative-time';

/**
 * Dashboard overview.
 *
 * Reads through the admin query layer rather than Prisma directly, so the same
 * counts and filters stay reusable by the list pages that come next.
 */
export default async function DashboardPage() {
  const t = await getTranslations('admin.dashboard');
  const [counts, activity] = await Promise.all([getDashboardCounts(), getRecentActivity()]);

  // Each card's sub-line is a short "x published · y drafts" summary, assembled
  // from counts in the component rather than baked into the catalogue: the
  // numbers change constantly and only the fragments need translating.
  const cards = [
    {
      labelKey: 'projects',
      href: adminHref('projects'),
      value: counts.projects.total,
      detail: `${counts.projects.published} ${t('published')} · ${counts.projects.drafts} ${t('drafts')}`,
    },
    {
      labelKey: 'skills',
      href: adminHref('skills'),
      value: counts.skills,
      detail: `${counts.projects.featured} ${t('featured')}`,
    },
    {
      labelKey: 'experience',
      href: adminHref('experience'),
      value: counts.experience,
      detail: `${counts.educations} ${t('cards.education')}`,
    },
    {
      labelKey: 'services',
      href: adminHref('services'),
      value: counts.services.total,
      detail: `${counts.services.active} ${t('active')}`,
    },
    {
      labelKey: 'testimonials',
      href: adminHref('testimonials'),
      value: counts.testimonials.total,
      detail: `${counts.testimonials.featured} ${t('featured')}`,
    },
    {
      labelKey: 'media',
      href: adminHref('media'),
      value: counts.media,
      detail: null,
    },
    {
      // Messages gets the last cell and is the one card that can demand
      // attention, so it is emphasised when something is unread.
      labelKey: 'messages',
      href: adminHref('messages'),
      value: counts.messages.total,
      detail:
        counts.messages.unread > 0 ? `${counts.messages.unread} ${t('unread')}` : t('allRead'),
      emphasis: counts.messages.unread > 0,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>

      <section aria-label={t('title')} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <CountCard
            key={card.labelKey}
            label={t(`cards.${card.labelKey}`)}
            href={card.href}
            value={card.value}
            detail={card.detail}
            emphasis={'emphasis' in card ? card.emphasis : false}
          />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---- Recently updated projects ---- */}
        <Card className="lg:col-span-2">
          <div className="border-border flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-medium">{t('recentProjects')}</h2>
            <Link
              href={adminHref('projects')}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {t('viewAll')}
            </Link>
          </div>

          {activity.projects.length === 0 ? (
            <EmptyState
              title={t('noProjects')}
              description={t('noProjectsDescription')}
              className="m-5"
              action={
                <Link href={adminHref('projects/new') as Route} className="text-sm underline">
                  {t('addProject')}
                </Link>
              }
            />
          ) : (
            <ul>
              {activity.projects.map((project) => (
                <li key={project.id} className="admin-row last:border-b-0">
                  <Link
                    href={adminHref(`projects/${project.id}`)}
                    className="focus-visible:outline-ring flex items-center gap-3 px-5 py-3 focus-visible:outline-2 focus-visible:-outline-offset-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{project.titleEn}</span>
                      <span className="text-subtle-foreground block truncate font-mono text-xs">
                        /{project.slug}
                      </span>
                    </span>

                    <StatusBadge status={project.status} />
                    <RelativeTime date={project.updatedAt} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ---- Latest messages ---- */}
        <Card>
          <div className="border-border flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-medium">{t('recentMessages')}</h2>
            <Link
              href={adminHref('messages')}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {t('viewAll')}
            </Link>
          </div>

          {activity.messages.length === 0 ? (
            <EmptyState
              title={t('noMessages')}
              description={t('noMessagesDescription')}
              className="m-5"
            />
          ) : (
            <ul>
              {activity.messages.map((message) => (
                <li key={message.id} className="admin-row last:border-b-0">
                  <Link
                    href={adminHref(`messages/${message.id}`)}
                    className="focus-visible:outline-ring flex items-start gap-3 px-5 py-3 focus-visible:outline-2 focus-visible:-outline-offset-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{message.name}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {message.subject}
                      </span>
                    </span>

                    <StatusBadge status={message.status} />
                    <RelativeTime date={message.createdAt} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
