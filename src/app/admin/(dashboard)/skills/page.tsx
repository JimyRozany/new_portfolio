import Link from 'next/link';
import type { Route } from 'next';
import { getTranslations } from 'next-intl/server';
import { Pencil, Plus } from 'lucide-react';
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
import { SkillCategoryManager } from '@/components/admin/skill-category-manager';
import { adminHref } from '@/config/admin-navigation';
import { listAdminSkills } from '@/server/queries/admin';
import { SkillsFilters } from './filters';

/**
 * Skill list.
 *
 * Filters live in the URL rather than in component state: an admin who filtered to
 * one category, bookmarked the URL or shared it with a colleague should get the
 * same rows back, and the back button has to work. Each control is a plain link
 * or GET form, so the whole page works before hydration.
 *
 * `featured` and `categoryId` are validated against the allowed values before
 * they reach the query. The project list casts its status filter with `as never`
 * because the query itself is typed; here both are parsed explicitly, so a
 * hand-edited URL like `?categoryId=abc` degrades to "no filter" instead of
 * reaching Prisma as a number it cannot compare.
 */
export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.skills');
  const tFields = await getTranslations('admin.skills.fields');
  const tTable = await getTranslations('admin.table');
  const tFilters = await getTranslations('admin.filters');
  const tCommon = await getTranslations('common');

  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const search = first(params.q) ?? '';
  const featured = first(params.featured) ?? 'all';
  const page = Math.max(1, Number(first(params.page) ?? '1') || 1);

  // `Number.isInteger` plus a positive check: `parseInt('3abc')` is 3, and a
  // zero or negative id cannot match a row, so both would silently filter
  // everything away instead of showing an unfiltered list.
  const categoryParam = Number(first(params.categoryId) ?? '');
  const categoryId =
    Number.isInteger(categoryParam) && categoryParam > 0 ? categoryParam : undefined;

  const featuredFilter = featured === 'yes' ? true : featured === 'no' ? false : undefined;

  const result = await listAdminSkills({ search, categoryId, featured: featuredFilter, page });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} description={t('description')}>
        <Button asChild>
          <Link href={adminHref('skills/new')}>
            <Plus className="size-4" aria-hidden="true" />
            {t('new')}
          </Link>
        </Button>
      </PageHeader>

      <SkillsFilters
        search={search}
        categoryId={categoryId ? String(categoryId) : ''}
        featured={featured}
        categories={result.categories.map((category) => ({
          id: category.id,
          nameEn: category.nameEn,
        }))}
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
                  <TableHead>{tTable('name')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead className="text-end">{tFields('level')}</TableHead>
                  <TableHead className="text-end">{tTable('featured')}</TableHead>
                  <TableHead className="text-end">{tTable('sortOrder')}</TableHead>
                  <TableHead className="text-end">{tTable('actions')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <span className="text-small font-medium">{row.name}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-small text-muted-foreground">
                        {row.category?.nameEn ?? tFields('noCategory')}
                      </span>
                    </TableCell>

                    {/* A nullable level is the reason the column exists, so a dash is
                        printed rather than 0% --- which would read as "no skill". */}
                    <TableCell className="text-small text-muted-foreground text-end tabular-nums">
                      {row.level === null ? '—' : `${row.level}%`}
                    </TableCell>

                    <TableCell className="text-end">
                      {row.featured ? (
                        <span className="text-accent-foreground" aria-label={tTable('featured')}>
                          ★
                        </span>
                      ) : (
                        <span className="text-subtle-foreground" aria-hidden="true">
                          —
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-subtle-foreground text-caption text-end font-mono">
                      {row.sortOrder}
                    </TableCell>

                    <TableCell className="text-end">
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link
                          href={adminHref(`skills/${row.id}`)}
                          aria-label={`${tCommon('edit')} ${row.name}`}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Link>
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
              href={pageHref({ search, categoryId, featured, page: result.page - 1 })}
              disabled={result.page <= 1}
              label={tTable('previous')}
            />
            <PageLink
              href={pageHref({ search, categoryId, featured, page: result.page + 1 })}
              disabled={result.page >= result.pageCount}
              label={tTable('next')}
            />
          </div>
        </nav>
      ) : null}

      <SkillCategoryManager categories={result.categories} />
    </div>
  );
}

/**
 * Rebuild a list URL with the filters intact.
 *
 * Every filter is carried through rather than only the page number, so paging
 * does not silently drop the search or the category the owner had set.
 */
function pageHref({
  search,
  categoryId,
  featured,
  page,
}: {
  search: string;
  categoryId?: number;
  featured: string;
  page: number;
}): Route {
  const query = new URLSearchParams();

  if (search) query.set('q', search);
  if (categoryId) query.set('categoryId', String(categoryId));
  if (featured !== 'all') query.set('featured', featured);
  if (page > 1) query.set('page', String(page));

  const suffix = query.toString();
  return `/admin/skills${suffix ? `?${suffix}` : ''}` as Route;
}

function PageLink({ href, disabled, label }: { href: Route; disabled: boolean; label: string }) {
  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        {label}
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
