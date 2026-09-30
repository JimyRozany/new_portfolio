import Link from 'next/link';
import type { Route } from 'next';
import { getTranslations } from 'next-intl/server';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { ProjectThumb } from '@/components/public/project-thumb';
import { adminHref } from '@/config/admin-navigation';
import { listAdminProjects, listProjectCategories } from '@/server/queries/admin';
import { ProjectsFilters } from './filters';

/**
 * Project list.
 *
 * Reads the whole published *and* unpublished set through the admin query layer,
 * so drafts are visible here even though the public site can never see them.
 *
 * Filters live in the URL rather than in component state: an admin who filtered
 * to drafts, bookmarked the URL or shared it with a colleague should get the same
 * rows back, and the back button has to work. Each control is a plain link or
 * GET form, so the whole page works before hydration.
 */
export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.projects');
  const tTable = await getTranslations('admin.table');
  const tFilters = await getTranslations('admin.filters');
  const tCommon = await getTranslations('common');

  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const search = first(params.q) ?? '';
  const status = first(params.status) ?? 'all';
  const category = first(params.category) ?? '';
  const page = Math.max(1, Number(first(params.page) ?? '1') || 1);

  const [result, categories] = await Promise.all([
    listAdminProjects({ search, status: status as never, category, page }),
    listProjectCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} description={t('description')}>
        <Button asChild>
          <Link href={adminHref('projects/new')}>
            <Plus className="size-4" aria-hidden="true" />
            {t('new')}
          </Link>
        </Button>
      </PageHeader>

      <ProjectsFilters
        search={search}
        status={status}
        category={category}
        categories={categories}
        results={result.total}
        resultsLabel={tTable('results')}
        allLabel={tFilters('all')}
        searchLabel={tFilters('search')}
        searchPlaceholder={t('searchPlaceholder')}
        clearLabel={tCommon('clearFilters')}
      />

      <Card>
        <CardContent className="px-0">
          {result.rows.length === 0 ? (
            <EmptyState
              title={tCommon('nothingHere')}
              description={tCommon('nothingHereDescription')}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tTable('title')}</TableHead>
                  <TableHead>{tTable('category')}</TableHead>
                  <TableHead>{tTable('featured')}</TableHead>
                  <TableHead>{tTable('status')}</TableHead>
                  <TableHead className="text-end">{tTable('sortOrder')}</TableHead>
                  <TableHead className="text-end">{tTable('actions')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ProjectThumb
                          slug={row.slug}
                          alt={row.titleEn}
                          src={row.thumbnail}
                          className="size-10 shrink-0 rounded-md text-[0.5rem]"
                        />
                        <div className="flex min-w-0 flex-col">
                          <span className="text-small truncate font-medium">{row.titleEn}</span>
                          <span dir="ltr" className="text-caption text-subtle-foreground truncate">
                            /{row.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-small text-muted-foreground">
                        {row.category ?? '—'}
                      </span>
                    </TableCell>

                    <TableCell>
                      {row.featured ? (
                        <span className="text-accent-foreground text-caption">★</span>
                      ) : (
                        <span className="text-subtle-foreground text-caption">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>

                    <TableCell className="text-subtle-foreground text-caption text-end font-mono">
                      {row.sortOrder}
                    </TableCell>

                    <TableCell className="text-end">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={adminHref(`projects/${row.id}`)}>{tCommon('edit')}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {result.pageCount > 1 ? (
        <nav aria-label={tTable('page')} className="flex items-center justify-between gap-4">
          <p className="text-small text-subtle-foreground">
            {tTable('showing')} {(result.page - 1) * result.perPage + 1}–
            {Math.min(result.page * result.perPage, result.total)} {tTable('of')} {result.total}
          </p>

          <div className="flex items-center gap-2">
            <PageLink
              href={pageHref({ search, status, category, page: result.page - 1 })}
              disabled={result.page <= 1}
              label={tTable('previous')}
            />
            <PageLink
              href={pageHref({ search, status, category, page: result.page + 1 })}
              disabled={result.page >= result.pageCount}
              label={tTable('next')}
            />
          </div>
        </nav>
      ) : null}
    </div>
  );
}

/** A previous/next link that degrades to a disabled element, not a dead anchor. */
function PageLink({ href, disabled, label }: { href: string; disabled: boolean; label: string }) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="text-subtle-foreground border-border text-small rounded-lg border px-3 py-1.5 opacity-50"
      >
        {label}
      </span>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href as Route}>{label}</Link>
    </Button>
  );
}

/** Build a filter-preserving href for a given page. */
function pageHref(state: {
  search: string;
  status: string;
  category: string;
  page: number;
}): string {
  const query = new URLSearchParams();

  if (state.search) query.set('q', state.search);
  if (state.status !== 'all') query.set('status', state.status);
  if (state.category) query.set('category', state.category);
  if (state.page > 1) query.set('page', String(state.page));

  const suffix = query.toString();
  return `/admin/projects${suffix ? `?${suffix}` : ''}`;
}
