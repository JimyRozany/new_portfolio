import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteButton } from '@/components/admin/delete-button';
import { SkillForm } from '@/components/admin/skill-form';
import { getAdminSkill, listSkillCategories } from '@/server/queries/admin';
import { deleteSkill, updateSkill } from '../actions';

export const metadata: Metadata = { title: 'Edit skill' };

/** Route params arrive as strings; anything non-numeric cannot be an id. */
function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Edit form.
 *
 * `updateSkill` is bound to the id here rather than taking it from the form, so
 * the record a form can change is the record the page rendered --- a tampered
 * hidden field cannot redirect a save at a different skill.
 */
export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) notFound();

  const t = await getTranslations('admin.skills');

  const [skill, categories] = await Promise.all([getAdminSkill(id), listSkillCategories()]);

  if (!skill) notFound();

  const action = updateSkill.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('edit')}
        description={skill.name}
        backHref="/admin/skills"
        backLabel={t('title')}
      >
        <DeleteButton
          id={id}
          action={deleteSkill}
          entity={t('entity')}
          entityName={skill.name}
          redirectTo="/admin/skills"
        />
      </PageHeader>

      <SkillForm action={action} defaults={skill} categories={categories} />
    </div>
  );
}
