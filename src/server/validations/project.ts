import { z } from 'zod';

/**
 * Validation for the admin project form.
 *
 * Follows the same convention as the contact schema: terse codes rather than
 * English sentences, so the form resolves them against `admin.errors.*` and the
 * copy stays translatable. The numeric limits mirror the Prisma column widths,
 * so an over-long value fails as a form error rather than as a MySQL truncation
 * error the owner cannot act on.
 *
 * Lives outside the `'use server'` module for the same reason as the contact
 * schema: a server action file may only export async functions.
 */

/** `String @db.VarChar(191)` etc. Kept here so the two cannot drift. */
export const PROJECT_LIMITS = {
  title: 191,
  description: 500,
  longDescription: 8_000,
  slug: 191,
  category: 120,
  technology: 60,
  technologyCount: 30,
  url: 255,
  thumbnail: 255,
} as const;

export const PROJECT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

/**
 * A URL field that is allowed to be absent or blank.
 *
 * `.optional()` matters as much as the transform: a form field the visitor never
 * touched is submitted as `''`, but a field with no input at all is simply not in
 * the `FormData`. Without `.optional()` the second case fails with "expected
 * string, received undefined" instead of being treated as "not set".
 */
const optionalUrl = z
  .string()
  .trim()
  .max(PROJECT_LIMITS.url, 'urlMax')
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => value === undefined || isHttpUrl(value), 'url');

/** Same idea for the remaining optional text columns. */
const optionalText = (max: number, code: string) =>
  z
    .string()
    .trim()
    .max(max, code)
    .optional()
    .transform((value) => (value ? value : undefined));

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const projectSchema = z.object({
  titleEn: z.string().trim().min(1, 'titleRequired').max(PROJECT_LIMITS.title, 'titleMax'),
  titleAr: z.string().trim().min(1, 'titleRequired').max(PROJECT_LIMITS.title, 'titleMax'),

  /**
   * Optional in the form: leaving it blank means "derive it from the English
   * title", which is what `generateSlug` does before the value reaches here.
   * The uniqueness check against an existing row is a database concern and is
   * handled in the action, because it needs a query.
   */
  slug: optionalText(PROJECT_LIMITS.slug, 'slugMax'),

  descriptionEn: z
    .string()
    .trim()
    .min(1, 'descriptionRequired')
    .max(PROJECT_LIMITS.description, 'descriptionMax'),
  descriptionAr: z
    .string()
    .trim()
    .min(1, 'descriptionRequired')
    .max(PROJECT_LIMITS.description, 'descriptionMax'),

  longDescriptionEn: optionalText(PROJECT_LIMITS.longDescription, 'longDescriptionMax'),
  longDescriptionAr: optionalText(PROJECT_LIMITS.longDescription, 'longDescriptionMax'),

  category: optionalText(PROJECT_LIMITS.category, 'categoryMax'),

  /**
   * The technologies repeater posts one hidden input per entry, so the form
   * flattens them into a comma-separated string before submitting and this
   * splits it back. Empty entries are dropped rather than rejected, so a
   * half-filled row does not block a save.
   */
  technologies: z
    .string()
    /**
     * An empty repeater renders no inputs at all, so this field is *absent* from
     * the submitted form, not present-and-blank. `.optional()` is what makes "no
     * technologies" a valid state instead of a validation error.
     */
    .optional()
    .transform((value) =>
      (value ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
        .slice(0, PROJECT_LIMITS.technologyCount),
    )
    .refine(
      (entries) => entries.every((entry) => entry.length <= PROJECT_LIMITS.technology),
      'technologyMax',
    ),

  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  thumbnail: optionalText(PROJECT_LIMITS.thumbnail, 'thumbnailMax'),

  // A hidden checkbox posts nothing when unticked, so `z.coerce.boolean` alone
  // would turn "absent" into `false` and a plain "true" string into `true` only
  // by accident. The form always submits an explicit value instead.
  featured: z.boolean(),
  status: z.enum(PROJECT_STATUSES),
  sortOrder: z.coerce
    .number()
    .int('sortOrderInt')
    .min(0, 'sortOrderMin')
    .max(9_999, 'sortOrderMax'),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number];

/**
 * Turn a title into a URL segment.
 *
 * Deliberately ASCII-only: a slug ends up in a URL and in a filename, and
 * percent-encoded Arabic is unreadable in a link preview or a log line. The
 * Arabic title still has its own display name, so nothing is lost for visitors.
 * Falls back to `project` when the title is entirely non-Latin, so the slug is
 * never empty.
 */
export function generateSlug(title: string): string {
  const slug = title
    .normalize('NFKD')
    // Strip combining marks so an accented Latin title degrades to plain ASCII.
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, PROJECT_LIMITS.slug);

  return slug || 'project';
}
