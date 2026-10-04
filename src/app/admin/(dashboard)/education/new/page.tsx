import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/page-header';
import { TimelineForm } from '@/components/admin/timeline-form';
import { createEducation } from '@/server/actions/timeline';

export const metadata: Metadata = { title: 'New education' };

export default async function NewEducationPage() {
  const t = await getTranslations('admin.education');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('new')}
        description={t('description')}
        backHref="/admin/education"
        backLabel={t('title')}
      />

      <TimelineForm kind="education" action={createEducation} defaults={null} />
    </div>
  );
}
