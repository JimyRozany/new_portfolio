'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import {
  educationSchema,
  experienceSchema,
  type EducationInput,
  type ExperienceInput,
} from '@/server/validations/experience';

/**
 * Create / update / delete for the career timeline: experience and education.
 *
 * Both entities live in one module because they are edited by one form component
 * and share a date range, but they stay separate functions and separate schemas
 * --- nothing here is generic over the two, because the only thing they have in
 * common is this file.
 *
 * Every action starts with `requireUser()`. The proxy guard is a convenience that
 * can be bypassed by posting straight at the endpoint, so the render-path check is
 * the one that actually enforces authorisation.
 */

export type TimelineFormState = {
  status: 'idle' | 'error' | 'success';
  messageKey?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
} | null;

/**
 * Every text field, so a failed save can hand the form back what was typed.
 *
 * The switch's hidden `current` field is included like any other: the owner had
 * it ticked, the save failed on a date, and the form should come back ticked.
 */
function collectValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value;
  }

  return values;
}

function parse<T>(
  formData: FormData,
  schema: { safeParse: (input: unknown) => SafeParseResult<T> },
) {
  /**
   * The raw `FormData` reaches the schema untouched, including `current`.
   * Coercing it here with `get('current') === 'true'` would make the schema's
   * boolean check unreachable: a tampered `'yes'` would become `false` and be
   * accepted, so the only thing that value ever did was flip a flag the owner did
   * not set.
   */
  const candidate: Record<string, unknown> = Object.fromEntries(formData.entries());

  const result = schema.safeParse(candidate);

  if (!result.success) {
    return {
      ok: false as const,
      state: {
        status: 'error' as const,
        messageKey: 'validationFailed',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
        values: collectValues(formData),
      },
    };
  }

  return { ok: true as const, input: result.data };
}

/** Structural type for the two schemas, so `parse` can be shared without generics gymnastics. */
type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { flatten(): { fieldErrors: Record<string, string[] | undefined> } } };

/**
 * Invalidate everything the public site caches about the timeline.
 *
 * Both tags, not just the one being edited: the home page renders a summary of
 * both lists from the same data, so editing a role can change the education
 * section's surrounding layout. `revalidatePath` then drops the rendered routes,
 * because those pages are static and would keep serving pre-edit markup.
 */
function revalidateTimeline(): void {
  updateTag('experience');
  updateTag('education');
  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');
}

function toExperienceDb(input: ExperienceInput) {
  return {
    company: input.company,
    positionEn: input.positionEn,
    positionAr: input.positionAr,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    startDate: input.startDate,
    // The schema resolves `current` into a null `endDate`, so this is null for
    // an open-ended role without the action having to second-guess the flag.
    endDate: input.endDate,
    current: input.current,
    location: input.location,
    // An empty list is stored as SQL NULL rather than `[]` so "no stack" has one
    // representation in the database, matching the query layer. Prisma needs the
    // explicit `DbNull` sentinel for that: a bare `null` is not a valid write to
    // a nullable `Json` column.
    technologies: input.technologies !== null ? input.technologies : Prisma.DbNull,
    sortOrder: input.sortOrder,
  };
}

function toEducationDb(input: EducationInput) {
  return {
    institution: input.institution,
    degreeEn: input.degreeEn,
    degreeAr: input.degreeAr,
    fieldEn: input.fieldEn,
    fieldAr: input.fieldAr,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    startDate: input.startDate,
    endDate: input.endDate,
    current: input.current,
    sortOrder: input.sortOrder,
  };
}

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export async function createExperience(
  _prev: TimelineFormState,
  formData: FormData,
): Promise<TimelineFormState> {
  await requireUser();

  const parsed = parse(formData, experienceSchema);
  if (!parsed.ok) return parsed.state;

  await prisma.experience.create({ data: toExperienceDb(parsed.input) });
  revalidateTimeline();

  redirect('/admin/experience' as Route);
}

export async function updateExperience(
  id: number,
  _prev: TimelineFormState,
  formData: FormData,
): Promise<TimelineFormState> {
  await requireUser();

  const existing = await prisma.experience.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return { status: 'error', messageKey: 'notFound', values: collectValues(formData) };
  }

  const parsed = parse(formData, experienceSchema);
  if (!parsed.ok) return parsed.state;

  await prisma.experience.update({ where: { id }, data: toExperienceDb(parsed.input) });
  revalidateTimeline();

  return { status: 'success' };
}

export async function deleteExperience(id: number): Promise<{ ok: boolean }> {
  await requireUser();

  // Nothing references an experience, so a single delete; `Experience` is a leaf
  // in the schema and has no child rows of its own.
  await prisma.experience.delete({ where: { id } });
  revalidateTimeline();

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export async function createEducation(
  _prev: TimelineFormState,
  formData: FormData,
): Promise<TimelineFormState> {
  await requireUser();

  const parsed = parse(formData, educationSchema);
  if (!parsed.ok) return parsed.state;

  await prisma.education.create({ data: toEducationDb(parsed.input) });
  revalidateTimeline();

  redirect('/admin/education' as Route);
}

export async function updateEducation(
  id: number,
  _prev: TimelineFormState,
  formData: FormData,
): Promise<TimelineFormState> {
  await requireUser();

  const existing = await prisma.education.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return { status: 'error', messageKey: 'notFound', values: collectValues(formData) };
  }

  const parsed = parse(formData, educationSchema);
  if (!parsed.ok) return parsed.state;

  await prisma.education.update({ where: { id }, data: toEducationDb(parsed.input) });
  revalidateTimeline();

  return { status: 'success' };
}

export async function deleteEducation(id: number): Promise<{ ok: boolean }> {
  await requireUser();

  await prisma.education.delete({ where: { id } });
  revalidateTimeline();

  return { ok: true };
}
