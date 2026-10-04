import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteButton } from '@/components/admin/delete-button';
import { TimelineForm } from '@/components/admin/timeline-form';
import { getAdminEducation } from '@/server/queries/admin';
import { deleteEducation, updateEducation } from '@/server/actions/timeline';

export const metadata: Metadata = { title: 'Edit education' };

/** Route params arrive as strings; anything non-numeric cannot be an id. */
function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default async function EditEducationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) notFound();

  const t = await getTranslations('admin.education');

  const education = await getAdminEducation(id);
  if (!education) notFound();

  const action = updateEducation.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('edit')}
        description={`${education.degreeEn} — ${education.institution}`}
        backHref="/admin/education"
        backLabel={t('title')}
      >
        <DeleteButton
          id={id}
          action={deleteEducation}
          entity={t('entity')}
          entityName={education.institution}
          redirectTo="/admin/education"
        />
      </PageHeader>

      <TimelineForm kind="education" action={action} defaults={education} />
    </div>
  );
}
