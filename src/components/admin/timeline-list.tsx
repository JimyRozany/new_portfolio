import Link from 'next/link';
import type { Route } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Briefcase, GraduationCap, Pencil, Plus } from 'lucide-react';
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
import { adminHref } from '@/config/admin-navigation';
import { listAdminEducations, listAdminExperiences } from '@/server/queries/admin';
import { TimelineFilters } from './timeline-filters';

/**
 * Experience and education lists.
 *
 * One component for both, dispatched on `kind`. They are the same table over the
 * same shape of record --- organisation, title, date range, order --- and the
 * public site already renders them as two bands of one timeline, so presenting
 * them as two admin screens sharing code matches how the data is actually used.
 * The one real difference, the icon and the name of the first column, is named by
 * `kind` rather than inferred.
 *
 * Search lives in the URL for the reason it does on the skills list: a bookmarked
 * or shared filtered URL has to return the same rows, and the back button has to
 * work. Each control is a plain link or GET form, so the page works before
 * hydration.
 */
export async function TimelineListPage({
  kind,
  searchParams,
}: {
  kind: 'experience' | 'education';
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const isExperience = kind === 'experience';

  const t = await getTranslations(`admin.${kind}`);
  const tTable = await getTranslations('admin.table');
  const tFilters = await getTranslations('admin.filters');
  const tCommon = await getTranslations('common');

  /**
   * Server-side `next-intl` formatter rather than a hand-rolled
   * `toLocaleDateString`, so the admin table and the public timeline format a date
   * the same way and a locale change moves both together.
   *
   * `timeZone: 'UTC'` is not optional here. The columns are `@db.Date` and the
   * schema parses them to UTC midnight precisely so a date cannot drift by a day;
   * formatting those in the server's local zone would reintroduce exactly that
   * drift, showing a 1 March start as 28 February on a machine behind UTC.
   */
  const format = await getFormatter();
  const formatDate = (date: Date) =>
    format.dateTime(date, { year: 'numeric', month: 'short', timeZone: 'UTC' });

  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const search = first(params.q) ?? '';
  // `Number.isInteger` plus a positive check: `Number('3abc')` is NaN but
  // `Number('')` is 0, and page 0 or a negative one cannot show rows.
  const page = Math.max(1, Number(first(params.page) ?? '1') || 1);

  const result = isExperience
    ? await listAdminExperiences({ search, page })
    : await listAdminEducations({ search, page });

  const Icon = isExperience ? Briefcase : GraduationCap;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} description={t('description')}>
        <Button asChild>
          <Link href={adminHref(`${kind}/new`)}>
            <Plus className="size-4" aria-hidden="true" />
            {t('new')}
          </Link>
        </Button>
      </PageHeader>

      <TimelineFilters
        kind={kind}
        search={search}
        results={result.total}
        resultsLabel={tTable('results')}
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
                  <TableHead>{isExperience ? tTable('company') : tTable('institution')}</TableHead>
                  <TableHead>{t('fields.title')}</TableHead>
                  <TableHead>{tTable('date')}</TableHead>
                  <TableHead className="text-end">{tTable('sortOrder')}</TableHead>
                  <TableHead className="text-end">{tTable('actions')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <span className="text-small flex items-center gap-2 font-medium">
                        <Icon
                          className="text-subtle-foreground size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {organisationOf(row, isExperience)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-small text-muted-foreground">
                        {titleOf(row, isExperience)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <DateRange
                        start={row.startDate}
                        end={row.endDate}
                        current={row.current}
                        format={formatDate}
                        presentLabel={t('fields.present')}
                      />
                    </TableCell>

                    <TableCell className="text-subtle-foreground text-caption text-end font-mono">
                      {row.sortOrder}
                    </TableCell>

                    <TableCell className="text-end">
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link
                          href={adminHref(`${kind}/${row.id}`)}
                          aria-label={`${tCommon('edit')} ${organisationOf(row, isExperience)}`}
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
              href={pageHref(kind, { search, page: result.page - 1 })}
              disabled={result.page <= 1}
              label={tTable('previous')}
            />
            <PageLink
              href={pageHref(kind, { search, page: result.page + 1 })}
              disabled={result.page >= result.pageCount}
              label={tTable('next')}
            />
          </div>
        </nav>
      ) : null}
    </div>
  );
}

/**
 * Raw `_en` columns rather than a localised title.
 *
 * The admin is English-only and edits both languages itself, so showing the Arabic
 * one here would be noise. This is also why the list query does not localise:
 * folding the pair into one `title` would hide half of what the form has to show.
 */
function titleOf(row: { positionEn?: string; degreeEn?: string }, isExperience: boolean): string {
  return isExperience ? (row.positionEn ?? '') : (row.degreeEn ?? '');
}

function organisationOf(
  row: { company?: string; institution?: string },
  isExperience: boolean,
): string {
  return isExperience ? (row.company ?? '') : (row.institution ?? '');
}

/**
 * A date range as the reader will see it.
 *
 * "Present" rather than a blank cell for an open range, matching the public
 * timeline: an empty cell reads as missing data, which is not what an ongoing
 * role means.
 */
function DateRange({
  start,
  end,
  current,
  format,
  presentLabel,
}: {
  start: Date;
  end: Date | null;
  current: boolean;
  format: (date: Date) => string;
  presentLabel: string;
}) {
  const to = end === null || current ? presentLabel : format(end);

  return (
    <span dir="ltr" className="text-small text-muted-foreground whitespace-nowrap tabular-nums">
      {format(start)} — {to}
    </span>
  );
}

/**
 * Rebuild a list URL with the filters intact.
 *
 * Every filter is carried through rather than only the page number, so paging does
 * not silently drop the search the owner had set.
 */
function pageHref(
  kind: 'experience' | 'education',
  { search, page }: { search: string; page: number },
): Route {
  const query = new URLSearchParams();

  if (search) query.set('q', search);
  if (page > 1) query.set('page', String(page));

  const suffix = query.toString();
  return `/admin/${kind}${suffix ? `?${suffix}` : ''}` as Route;
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
