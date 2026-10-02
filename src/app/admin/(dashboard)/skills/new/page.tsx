import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/page-header';
import { SkillForm } from '@/components/admin/skill-form';
import { listSkillCategories } from '@/server/queries/admin';
import { createSkill } from '../actions';

export const metadata: Metadata = { title: 'New skill' };

/**
 * Create form.
 *
 * No `requireUser()` call here: every screen under `(dashboard)` renders through
 * the dashboard layout, which already guards it. Repeating the check in every
 * page would be noise, not defence.
 */
export default async function NewSkillPage() {
  const t = await getTranslations('admin.skills');
  const categories = await listSkillCategories();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('new')}
        description={t('description')}
        backHref="/admin/skills"
        backLabel={t('title')}
      />

      <SkillForm action={createSkill} defaults={null} categories={categories} />
    </div>
  );
}
