import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteButton } from '@/components/admin/delete-button';
import { ProjectForm } from '@/components/admin/project-form';
import { StatusBadge } from '@/components/admin/status-badge';
import { getAdminProject } from '@/server/queries/admin';
import { deleteProject, updateProject } from '../actions';

export const metadata: Metadata = { title: 'Edit project' };

/** Route params arrive as strings; anything non-numeric cannot be an id. */
function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Edit form.
 *
 * `updateProject` is bound to the id here rather than taking it from the form,
 * so the record a form can change is the record the page rendered --- a
 * tampered hidden field cannot redirect a save at a different project.
 */
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) notFound();

  const t = await getTranslations('admin.projects');
  const project = await getAdminProject(id);

  if (!project) notFound();

  // Read the JSON column defensively rather than trusting the database: the same
  // normalisation the public query layer performs.
  const technologies = Array.isArray(project.technologies)
    ? project.technologies.filter((entry): entry is string => typeof entry === 'string')
    : [];

  const action = updateProject.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('edit')}
        description={project.titleEn}
        backHref="/admin/projects"
        backLabel={t('title')}
      >
        <StatusBadge status={project.status} />

        {project.status === 'PUBLISHED' ? (
          <Button asChild variant="outline" size="sm">
            {/* The dashboard is English-only, so it links to the English
                rendering explicitly rather than resolving a visitor locale. */}
            <Link href={`/en/projects/${project.slug}`} target="_blank" rel="noreferrer noopener">
              <ExternalLink className="size-4" aria-hidden="true" />
              {t('viewOnSite')}
            </Link>
          </Button>
        ) : null}

        <DeleteButton
          id={id}
          action={deleteProject}
          entity={t('entity')}
          entityName={project.titleEn}
          redirectTo="/admin/projects"
        />
      </PageHeader>

      <ProjectForm mode="edit" action={action} technologies={technologies} defaults={project} />
    </div>
  );
}
