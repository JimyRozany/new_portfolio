'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';

/**
 * URL-driven filter bar for the skill table.
 *
 * A GET form rather than a controlled component: submitting it navigates with the
 * filters in the query string, which keeps the list shareable and the back button
 * meaningful, and renders correctly on a JavaScript-free reload.
 *
 * Category is filtered by id rather than by name. Skill names are unique enough in
 * practice but not by constraint, so two categories that share an English name
 * would make the free-text filter ambiguous; an id cannot.
 */
export function SkillsFilters({
  search,
  categoryId,
  featured,
  categories,
  results,
  resultsLabel,
  allLabel,
  searchLabel,
  searchPlaceholder,
  clearLabel,
}: {
  search: string;
  categoryId: string;
  featured: string;
  categories: { id: number; nameEn: string }[];
  results: number;
  resultsLabel: string;
  allLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  clearLabel: string;
}) {
  const t = useTranslations('admin.filters');
  const isFiltered = search !== '' || categoryId !== '' || featured !== 'all';

  return (
    <form method="GET" action="/admin/skills" className="flex flex-col gap-3">
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

        <Select
          name="categoryId"
          defaultValue={categoryId}
          aria-label={t('category')}
          className="sm:w-48"
        >
          <option value="">{allLabel}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameEn}
            </option>
          ))}
        </Select>

        <Select
          name="featured"
          defaultValue={featured}
          aria-label={t('featured')}
          className="sm:w-36"
        >
          <option value="all">{allLabel}</option>
          <option value="yes">{t('featuredOnly')}</option>
          <option value="no">{t('notFeatured')}</option>
        </Select>

        <Button type="submit" variant="outline" size="sm">
          {t('apply')}
        </Button>

        {isFiltered ? (
          <Button asChild type="button" variant="ghost" size="sm">
            <Link href={'/admin/skills' as Route}>
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
