'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';

/**
 * URL-driven filter bar for the project table.
 *
 * A GET form rather than a controlled component: submitting it navigates with the
 * filters in the query string, which is what keeps the list shareable and the
 * back button meaningful. That also means the bar renders correctly on a
 * JavaScript-free page reload, at the cost of a full navigation per change ---
 * an acceptable trade for a list the owner changes a few times a day, and the
 * one alternative (debounced `router.replace`) makes the address bar flicker
 * while typing.
 */
export function ProjectsFilters({
  search,
  status,
  category,
  categories,
  results,
  resultsLabel,
  allLabel,
  searchLabel,
  searchPlaceholder,
  clearLabel,
}: {
  search: string;
  status: string;
  category: string;
  categories: string[];
  results: number;
  resultsLabel: string;
  allLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  clearLabel: string;
}) {
  const t = useTranslations('admin.filters');
  const isFiltered = search !== '' || status !== 'all' || category !== '';

  return (
    <form method="GET" action="/admin/projects" className="flex flex-col gap-3">
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

        {/* Changing one filter must not discard the other two, so each control
            carries the current values in hidden fields. */}
        {search ? <input type="hidden" name="q" value={search} /> : null}

        <Select name="status" defaultValue={status} aria-label={t('label')} className="sm:w-40">
          <option value="all">{allLabel}</option>
          <option value="PUBLISHED">{t('published')}</option>
          <option value="DRAFT">{t('draft')}</option>
          <option value="ARCHIVED">{t('archived')}</option>
        </Select>

        <Select
          name="category"
          defaultValue={category}
          aria-label={t('category')}
          className="sm:w-48"
        >
          <option value="">{allLabel}</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>

        <Button type="submit" variant="outline" size="sm">
          {t('apply')}
        </Button>

        {isFiltered ? (
          <Button asChild type="button" variant="ghost" size="sm">
            <Link href={'/admin/projects' as Route}>
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
