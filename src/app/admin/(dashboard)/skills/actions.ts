'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import {
  skillCategorySchema,
  skillSchema,
  type SkillCategoryInput,
  type SkillInput,
} from '@/server/validations/skill';

/**
 * Create / update / delete for skills and skill categories.
 *
 * Every action starts with `requireUser()`. The proxy guard is a convenience
 * that can be bypassed by posting straight at this endpoint, so the render-path
 * check is the one that actually enforces authorisation.
 */

export type SkillFormState = {
  status: 'idle' | 'error' | 'success';
  messageKey?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
} | null;

export type SkillCategoryFormState = SkillFormState;

/** All text fields, so a failed save can hand the form back what was typed. */
function collectValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value;
  }

  return values;
}

function parse(
  formData: FormData,
): { ok: true; input: SkillInput } | { ok: false; state: SkillFormState } {
  /**
   * The raw `FormData` is handed to the schema untouched, including `featured`.
   * Coercing it here with `get('featured') === 'true'` would make the schema's
   * boolean check unreachable: a tampered `'yes'` would be turned into `false`
   * and accepted, so the only thing that value ever did was flip a flag the
   * owner did not set.
   */
  const candidate: Record<string, unknown> = Object.fromEntries(formData.entries());

  const result = skillSchema.safeParse(candidate);

  if (!result.success) {
    return {
      ok: false,
      state: {
        status: 'error',
        messageKey: 'validationFailed',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
        values: collectValues(formData),
      },
    };
  }

  return { ok: true, input: result.data };
}

function toDb(input: SkillInput) {
  return {
    name: input.name,
    icon: input.icon ?? null,
    // `onDelete: SetNull` means an uncategorised skill keeps `null` here rather
    // than pointing at a placeholder category, so the public grid can label it
    // with `skills.uncategorised`.
    categoryId: input.categoryId ?? null,
    level: input.level ?? null,
    featured: input.featured,
    sortOrder: input.sortOrder,
  };
}

/**
 * Invalidate everything the public site caches about skills.
 *
 * Two mechanisms, not one: `updateTag` expires the `unstable_cache` entries so
 * the owner sees their own edit, and `revalidatePath` drops the rendered routes
 * because the public pages are static and would keep serving pre-edit markup.
 */
function revalidateSkills(): void {
  updateTag('skills');
  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');
}

export async function createSkill(
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  await requireUser();

  const parsed = parse(formData);
  if (!parsed.ok) return parsed.state;

  await prisma.skill.create({ data: toDb(parsed.input) });
  revalidateSkills();

  redirect('/admin/skills' as Route);
}

export async function updateSkill(
  id: number,
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  await requireUser();

  const existing = await prisma.skill.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return { status: 'error', messageKey: 'notFound', values: collectValues(formData) };
  }

  const parsed = parse(formData);
  if (!parsed.ok) return parsed.state;

  await prisma.skill.update({ where: { id }, data: toDb(parsed.input) });
  revalidateSkills();

  return { status: 'success' };
}

export async function deleteSkill(id: number): Promise<{ ok: boolean }> {
  await requireUser();

  // Skills carry no child rows, so this is a single delete. Deleting a category
  // below is the one that needs `SetNull` to do the tidying.
  await prisma.skill.delete({ where: { id } });
  revalidateSkills();

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function createSkillCategory(
  _prev: SkillCategoryFormState,
  formData: FormData,
): Promise<SkillCategoryFormState> {
  await requireUser();

  const result = skillCategorySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return {
      status: 'error',
      messageKey: 'validationFailed',
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      values: collectValues(formData),
    };
  }

  await prisma.skillCategory.create({ data: toDbCategory(result.data) });
  revalidateSkills();

  return { status: 'success' };
}

export async function updateSkillCategory(
  id: number,
  _prev: SkillCategoryFormState,
  formData: FormData,
): Promise<SkillCategoryFormState> {
  await requireUser();

  const result = skillCategorySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return {
      status: 'error',
      messageKey: 'validationFailed',
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      values: collectValues(formData),
    };
  }

  await prisma.skillCategory.update({ where: { id }, data: toDbCategory(result.data) });
  revalidateSkills();

  return { status: 'success' };
}

export async function deleteSkillCategory(id: number): Promise<{ ok: boolean }> {
  await requireUser();

  // `onDelete: SetNull` is declared on `Skill.category`, so the skills in this
  // category survive and become "uncategorised" instead of disappearing with it.
  await prisma.skillCategory.delete({ where: { id } });
  revalidateSkills();

  return { ok: true };
}

function toDbCategory(input: SkillCategoryInput) {
  return {
    nameEn: input.nameEn,
    nameAr: input.nameAr,
    sortOrder: input.sortOrder,
  };
}
