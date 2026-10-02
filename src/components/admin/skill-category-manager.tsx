'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createSkillCategory,
  deleteSkillCategory,
  updateSkillCategory,
} from '@/app/admin/(dashboard)/skills/actions';
import { DeleteButton } from '@/components/admin/delete-button';
import { SkillCategoryForm } from '@/components/admin/skill-category-form';

/** Next free order value, so a new category lands below the existing ones. */
function nextSortOrder(categories: { sortOrder: number }[]): number {
  const last = categories[categories.length - 1];
  return last ? last.sortOrder + 1 : 0;
}

/**
 * Skill-category management, collapsible at the foot of the skill list.
 *
 * Categories are managed here rather than on their own pages: there are three or
 * four of them, each two words long, and a full page per category would cost more
 * navigation than it saves. Collapsed by default so it never competes with the
 * list the owner came here to change.
 *
 * Deleting a category does not delete its skills. `onDelete: SetNull` leaves them
 * in place and they become "uncategorised", which is stated in the confirmation
 * copy --- otherwise it reads as if the skills go too.
 */
export function SkillCategoryManager({
  categories,
}: {
  categories: { id: number; nameEn: string; nameAr: string; sortOrder: number }[];
}) {
  const t = useTranslations('admin.skills');
  const tCommon = useTranslations('common');

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>{t('categoriesTitle')}</CardTitle>
            <CardDescription>{t('categoriesDescription')}</CardDescription>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            {open ? <ChevronUp className="size-4" aria-hidden="true" /> : null}
            {!open ? <ChevronDown className="size-4" aria-hidden="true" /> : null}
            {open ? t('collapse') : t('expand')}
          </Button>
        </div>
      </CardHeader>

      {open ? (
        <CardContent className="flex flex-col gap-4">
          {categories.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="border-border bg-surface flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="text-small font-medium">{category.nameEn}</span>
                    <span dir="rtl" className="text-caption text-subtle-foreground">
                      {category.nameAr}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-subtle-foreground text-caption me-2 font-mono">
                      #{category.sortOrder}
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditingId(category.id)}
                      aria-label={`${tCommon('edit')} ${category.nameEn}`}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>

                    <DeleteButton
                      id={category.id}
                      action={deleteSkillCategory}
                      entity={t('category')}
                      entityName={`${category.nameEn} / ${category.nameAr}`}
                    />
                  </div>

                  {editingId === category.id ? (
                    <SkillCategoryForm
                      mode="edit"
                      action={updateSkillCategory.bind(null, category.id)}
                      defaultNameEn={category.nameEn}
                      defaultNameAr={category.nameAr}
                      defaultSortOrder={category.sortOrder}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-small text-muted-foreground">{t('categoriesEmpty')}</p>
          )}

          {creating ? (
            <SkillCategoryForm
              mode="create"
              action={createSkillCategory}
              defaultSortOrder={nextSortOrder(categories)}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" aria-hidden="true" />
              {t('newCategory')}
            </Button>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}
