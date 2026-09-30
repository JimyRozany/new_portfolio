'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import { generateSlug, projectSchema, type ProjectInput } from '@/server/validations/project';

/**
 * Create / update / delete for projects.
 *
 * A `'use server'` module may only export async functions, so the Zod schema
 * and the state type live in `src/server/validations/project.ts` and are
 * re-exported as types only.
 *
 * Every action starts with `requireUser()`. The proxy guard is a convenience
 * that can be bypassed by posting straight at this endpoint, so the render-path
 * check is the one that actually enforces authorisation.
 */

/**
 * Result handed back to the form.
 *
 * `values` echoes what was submitted so a rejected save does not clear the
 * form: losing a long description because one required field was missed is the
 * fastest way to make someone hate the dashboard.
 */
export type ProjectFormState = {
  status: 'idle' | 'error' | 'success';
  messageKey?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
} | null;

/** All text fields, so a failed save can hand the form back what was typed. */
function collectValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value;
  }

  return values;
}

/** Technologies arrive as repeated fields; collapse them for the schema. */
function readTechnologies(formData: FormData): string[] {
  return formData
    .getAll('technologies')
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '');
}

/** Run the schema, returning either the parsed input or a ready-to-render error. */
function parse(
  formData: FormData,
): { ok: true; input: ProjectInput } | { ok: false; state: ProjectFormState } {
  // The technologies repeater posts one entry per technology, so the repeated
  // fields are collapsed back into the single comma-separated string the schema
  // splits. `featured` is an explicit hidden field rather than a checkbox, whose
  // absence when unticked would be indistinguishable from a missing field.
  const candidate: Record<string, unknown> = {
    ...Object.fromEntries(formData.entries()),
    technologies: readTechnologies(formData).join(','),
    featured: formData.get('featured') === 'true',
  };

  const result = projectSchema.safeParse(candidate);

  if (!result.success) {
    return {
      ok: false,
      state: {
        status: 'error',
        // A single generic key: the form shows per-field messages from
        // `fieldErrors` and this one only for failures that are not tied to a field.
        messageKey: 'validationFailed',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
        values: collectValues(formData),
      },
    };
  }

  return { ok: true, input: result.data };
}

/**
 * Reject a slug that another project already owns.
 *
 * The column is `unique`, so without this the owner would get an opaque
 * `P2002` from Prisma instead of a field error next to the input. The id being
 * edited is excluded so saving without changing the slug is not a collision
 * with itself.
 */
async function assertSlugAvailable(slug: string, selfId?: number): Promise<boolean> {
  const existing = await prisma.project.findUnique({
    where: { slug },
    select: { id: true },
  });

  return !existing || existing.id === selfId;
}

function toDb(input: ProjectInput) {
  return {
    titleEn: input.titleEn,
    titleAr: input.titleAr,
    slug: input.slug ?? generateSlug(input.titleEn),
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    longDescriptionEn: input.longDescriptionEn ?? null,
    longDescriptionAr: input.longDescriptionAr ?? null,
    category: input.category ?? null,
    // An empty list is stored as SQL NULL rather than `[]` so "no technologies"
    // has one representation in the database, matching the query layer. Prisma
    // needs the explicit `DbNull` sentinel for that: a bare `null` is not a
    // valid write to a nullable `Json` column.
    technologies: input.technologies.length > 0 ? input.technologies : Prisma.DbNull,
    liveUrl: input.liveUrl ?? null,
    githubUrl: input.githubUrl ?? null,
    thumbnail: input.thumbnail ?? null,
    featured: input.featured,
    status: input.status,
    sortOrder: input.sortOrder,
  };
}

/**
 * Invalidate everything the public site caches about projects.
 *
 * Two mechanisms are needed, not one. `updateTag` expires the data cached by
 * `unstable_cache` immediately, so the owner sees their own edit rather than a
 * stale list. `revalidatePath` then drops the rendered route tree, because the
 * public pages are static and would otherwise keep serving markup built before
 * the edit; `sitemap.xml` sits outside the locale layout, so it is named
 * explicitly.
 */
function revalidateProjects(): void {
  updateTag('projects');
  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');
}

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireUser();

  const parsed = parse(formData);
  if (!parsed.ok) return parsed.state;

  const slug = parsed.input.slug ?? generateSlug(parsed.input.titleEn);

  if (!(await assertSlugAvailable(slug))) {
    return {
      status: 'error',
      fieldErrors: { slug: ['slugTaken'] },
      values: collectValues(formData),
    };
  }

  await prisma.project.create({ data: toDb({ ...parsed.input, slug }) });
  revalidateProjects();

  // Straight to the list: a create flow that lands on the edit form for a record
  // the owner has not seen yet invites a second, pointless save.
  redirect('/admin/projects' as Route);
}

export async function updateProject(
  id: number,
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireUser();

  const existing = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return { status: 'error', messageKey: 'notFound', values: collectValues(formData) };
  }

  const parsed = parse(formData);
  if (!parsed.ok) return parsed.state;

  const slug = parsed.input.slug ?? generateSlug(parsed.input.titleEn);

  if (!(await assertSlugAvailable(slug, id))) {
    return {
      status: 'error',
      fieldErrors: { slug: ['slugTaken'] },
      values: collectValues(formData),
    };
  }

  await prisma.project.update({ where: { id }, data: toDb({ ...parsed.input, slug }) });
  revalidateProjects();

  return { status: 'success' };
}

export async function deleteProject(id: number): Promise<{ ok: boolean }> {
  await requireUser();

  // `ProjectImage` cascades at the schema level, so the gallery rows go with it.
  await prisma.project.delete({ where: { id } });
  revalidateProjects();

  return { ok: true };
}
