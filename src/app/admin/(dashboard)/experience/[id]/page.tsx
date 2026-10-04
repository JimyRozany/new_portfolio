import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteButton } from '@/components/admin/delete-button';
import { TimelineForm } from '@/components/admin/timeline-form';
import { getAdminExperience } from '@/server/queries/admin';
import { deleteExperience, updateExperience } from '@/server/actions/timeline';

export const metadata: Metadata = { title: 'Edit experience' };

/** Route params arrive as strings; anything non-numeric cannot be an id. */
function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Edit form.
 *
 * `updateExperience` is bound to the id here rather than taking it from the form,
 * so the record a form can change is the record the page rendered --- a tampered
 * hidden field cannot redirect a save at a different row.
 */
export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) notFound();

  const t = await getTranslations('admin.experience');

  const experience = await getAdminExperience(id);
  if (!experience) notFound();

  const action = updateExperience.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('edit')}
        description={`${experience.positionEn} — ${experience.company}`}
        backHref="/admin/experience"
        backLabel={t('title')}
      >
        <DeleteButton
          id={id}
          action={deleteExperience}
          entity={t('entity')}
          entityName={experience.company}
          redirectTo="/admin/experience"
        />
      </PageHeader>

      <TimelineForm kind="experience" action={action} defaults={experience} />
    </div>
  );
}
