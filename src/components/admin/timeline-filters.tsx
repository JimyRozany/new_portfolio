'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * URL-driven search bar for the timeline tables.
 *
 * A GET form rather than a controlled component: submitting navigates with the
 * search in the query string, which keeps the list shareable and the back button
 * meaningful, and renders correctly on a JavaScript-free reload.
 *
 * `kind` only picks the form's own action and the clear link, so the two lists
 * cannot drift apart --- a filter that resets one list while leaving the other
 * filtered is the kind of bug that only shows up after someone uses both.
 */
export function TimelineFilters({
  kind,
  search,
  results,
  resultsLabel,
  searchLabel,
  searchPlaceholder,
  clearLabel,
}: {
  kind: 'experience' | 'education';
  search: string;
  results: number;
  resultsLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  clearLabel: string;
}) {
  const t = useTranslations('admin.filters');
  const listHref = `/admin/${kind}` as Route;

  return (
    <form method="GET" action={listHref} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Filter
            className="text-subtle-foreground pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            defaultValue={search}
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            className="ps-10"
          />
        </div>

        <Button type="submit" variant="outline" size="sm">
          {t('apply')}
        </Button>

        {search !== '' ? (
          <Button asChild type="button" variant="ghost" size="sm">
            <Link href={listHref}>
              <X className="size-4" aria-hidden="true" />
              {clearLabel}
            </Link>
          </Button>
        ) : null}
      </div>

      <p aria-live="polite" className="text-small text-subtle-foreground">
        {results} {resultsLabel}
      </p>
    </form>
  );
}
