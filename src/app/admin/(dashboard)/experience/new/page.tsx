import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/page-header';
import { TimelineForm } from '@/components/admin/timeline-form';
import { createExperience } from '@/server/actions/timeline';

export const metadata: Metadata = { title: 'New experience' };

/**
 * Create form.
 *
 * No `requireUser()` call here: every screen under `(dashboard)` renders through
 * the dashboard layout, which already guards it. Repeating the check in every page
 * would be noise, not defence.
 */
export default async function NewExperiencePage() {
  const t = await getTranslations('admin.experience');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('new')}
        description={t('description')}
        backHref="/admin/experience"
        backLabel={t('title')}
      />

      <TimelineForm kind="experience" action={createExperience} defaults={null} />
    </div>
  );
}
