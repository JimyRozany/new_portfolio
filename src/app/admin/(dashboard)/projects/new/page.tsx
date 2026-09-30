import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/page-header';
import { ProjectForm } from '@/components/admin/project-form';
import { createProject } from '../actions';

export const metadata: Metadata = { title: 'New project' };

/**
 * Create form.
 *
 * No `requireUser()` call here: every screen under `(dashboard)` renders through
 * the dashboard layout, which already guards it. Repeating the check in every
 * page would be noise, not defence.
 */
export default async function NewProjectPage() {
  const t = await getTranslations('admin.projects');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('new')}
        description={t('description')}
        backHref="/admin/projects"
        backLabel={t('title')}
      />

      <ProjectForm mode="create" action={createProject} defaults={null} />
    </div>
  );
}
