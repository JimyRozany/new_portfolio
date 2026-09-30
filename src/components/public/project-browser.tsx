'use client';

import { FolderOpen, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ProjectCard } from '@/components/public/project-card';
import type { ProjectListItem } from '@/server/queries/portfolio';

/**
 * The projects index: search box, category chips and the grid, as one unit.
 *
 * Filtering is client-side because the whole published set is small enough to
 * send in a single payload, and doing it here means switching a category never
 * refetches or reloads --- the spec asks for smooth filtering without
 * unnecessary reloads. The controls and the grid are deliberately one component
 * rather than two: the result count, the empty state and the cards all have to
 * agree with the controls, and keeping the state in one place is what guarantees
 * that instead of syncing it across a boundary.
 *
 * The search box keeps the text the visitor is typing immediately and applies
 * the *debounced* value, so a fast typist does not re-filter the list on every
 * keystroke while the field still feels responsive.
 */
export function ProjectBrowser({
  projects,
  categories,
}: {
  projects: ProjectListItem[];
  /** Distinct categories, extracted and sorted by the server. */
  categories: string[];
}) {
  const t = useTranslations('projects');

  const [draft, setDraft] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const query = useDebouncedValue(draft, 200);

  const filtered = useMemo(() => {
    const needle = normalise(query);

    return projects.filter((project) => {
      if (category !== null && project.category !== category) return false;
      if (needle === '') return true;

      // Spec: search matches title, technology and category.
      const haystack = [project.title, project.description, project.category ?? '']
        .concat(project.technologies ?? [])
        .map(normalise);

      return haystack.some((value) => value.includes(needle));
    });
  }, [category, projects, query]);

  // Nothing published at all is a different situation from "your filter matched
  // nothing", and each deserves its own explanation.
  if (projects.length === 0) {
    return (
      <EmptyState icon={FolderOpen} title={t('empty.title')} description={t('empty.description')} />
    );
  }

  const isFiltered = query.trim() !== '' || category !== null;

  const clear = () => {
    setDraft('');
    setCategory(null);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div role="search" className="relative flex-1">
            <Search
              className="text-subtle-foreground pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              className="ps-10"
            />
          </div>

          {isFiltered ? (
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              <X className="size-4" aria-hidden="true" />
              {t('filters.clear')}
            </Button>
          ) : null}
        </div>

        {categories.length > 0 ? (
          <div
            role="group"
            aria-label={t('filters.label')}
            className="flex flex-wrap items-center gap-2"
          >
            {/* Plain buttons with `aria-pressed` rather than a radiogroup: a
                radiogroup implies arrow-key roving focus these chips do not
                implement, which would mislead keyboard and screen-reader users. */}
            <FilterChip active={category === null} onClick={() => setCategory(null)}>
              {t('filters.all')}
            </FilterChip>

            {categories.map((name) => (
              <FilterChip key={name} active={category === name} onClick={() => setCategory(name)}>
                {name}
              </FilterChip>
            ))}
          </div>
        ) : null}

        {/* `aria-live` announces the count as the visitor types. Without it a
            screen-reader user gets no confirmation that filtering did anything. */}
        <p aria-live="polite" className="text-small text-subtle-foreground">
          {t('resultsCount', { count: filtered.length })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={t('noResults.title')}
          description={t('noResults.description')}
          action={
            <Button type="button" variant="outline" size="sm" onClick={clear}>
              {t('filters.all')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              // Only the first row loads its artwork eagerly; the rest are
              // almost certainly below the fold.
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="focus-visible:outline-ring rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {/* `pointer-events-none` so the click lands on the button, not the span. */}
      <Chip size="sm" variant={active ? 'accent' : 'outline'} className="pointer-events-none">
        {children}
      </Chip>
    </button>
  );
}

/**
 * Lowercase and strip diacritics so "Laravel", "laravel" and "LARAVEL" all match,
 * and so a visitor typing on an Arabic keyboard still finds a Latin-script name.
 */
function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}
