import { z } from 'zod';

/**
 * Validation for the admin skill form and the skill-category form.
 *
 * Skills are the one collection whose `name` is a single column rather than an
 * `En`/`Ar` pair. A technology name is a proper noun --- "Laravel", "Git",
 * "React" --- and translating it produces something wrong rather than something
 * bilingual, so the column is deliberately not localised. The *category* is
 * editorial prose that a reader does need in both languages, so that one keeps
 * the pair.
 *
 * Terse codes rather than English sentences, matching the project and contact
 * schemas, so the form resolves them against `admin.errors.*`.
 */

/** Mirrors the Prisma column widths, so an over-long value fails as a form error. */
export const SKILL_LIMITS = {
  name: 120,
  icon: 120,
  categoryName: 120,
} as const;

export const SKILL_LEVEL_MIN = 0;
export const SKILL_LEVEL_MAX = 100;

/**
 * A field that may be missing entirely, blank, or a number.
 *
 * `z.preprocess` collapses all three into one string before validation, because
 * Zod's default messages for a wrong *type* ("expected boolean, received
 * undefined") are English sentences with no code to translate. Feeding it a
 * string unconditionally means the `.refine` below always produces a code the
 * form can look up, whichever way the value arrived.
 */
const nullableNumber = z.preprocess(
  (value) => (value === undefined || value === null || value === '' ? '' : String(value)),
  /**
   * Accepts a signed decimal rather than digits only, so a negative or
   * fractional value is rejected by the `.refine` range checks *below* --- and
   * gets the specific message ("order cannot be negative") instead of a generic
   * "not a whole number" that would also appear for a genuine `1.5`.
   */
  z.union([z.literal(''), z.string().regex(/^-?\d*\.?\d+$/, 'notANumber')]),
);

/**
 * Level is optional: a skill can be listed without a self-assessed proficiency.
 * A blank input posts `''`, which the transform turns into "not set" rather than
 * a misleading zero on the public progress bar.
 */
const optionalLevel = nullableNumber
  .transform((value) => (value === '' ? undefined : Number(value)))
  /**
   * The column is an `Int`, so a fractional value is rejected rather than left to
   * the driver. MariaDB would otherwise round `77.6` to `77` silently, and the
   * owner would never learn that the number they typed was not the number saved.
   * A slider cannot produce one; only a hand-edited field can.
   */
  .refine((value) => value === undefined || Number.isInteger(value), 'notAWholeNumber')
  .refine(
    (value) => value === undefined || (value >= SKILL_LEVEL_MIN && value <= SKILL_LEVEL_MAX),
    'levelRange',
  );

/**
 * `featured` arrives as the string `'true'` or `'false'` from a hidden field
 * written by a Radix switch. Accepting only those two literals means a tampered
 * value is rejected with a code rather than silently coerced to `true` by
 * `Boolean('false')`.
 */
const booleanField = z.preprocess(
  // `undefined` becomes `''` rather than being passed through, so a field that is
  // missing outright is rejected by the same `.refine` below instead of tripping
  // Zod's type check first --- which would report English prose with no code.
  (value) => (value === undefined || value === null ? '' : String(value)),
  /**
   * `refine` rather than `enum`, because `enum` reports "Invalid option: expected
   * one of \"true\"|\"false\"" --- an English sentence with no code to translate.
   */
  z
    .string()
    .refine((value) => value === 'true' || value === 'false', 'notABoolean')
    .transform((value) => value === 'true'),
);

/**
 * `sortOrder` is required in practice --- every form always submits it --- so an
 * absent value is reported rather than quietly defaulting to 0, which would move
 * the record to the top of the list.
 */
const sortableNumber = nullableNumber
  .refine((value) => value !== '', 'sortOrderRequired')
  .transform((value) => (value === '' ? 0 : Number(value)))
  .refine((value) => Number.isInteger(value), 'sortOrderInt')
  .refine((value) => value >= 0, 'sortOrderMin')
  .refine((value) => value <= 9_999, 'sortOrderMax');

const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, 'nameRequired')
    .max(max, 'nameMax')
    /**
     * A field that is missing outright is a required field left blank, so it gets
     * the same code as an empty string instead of Zod's type error.
     */
    .or(z.undefined().transform(() => ''))
    .pipe(z.string().trim().min(1, 'nameRequired').max(max, 'nameMax'));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, 'iconMax')
    .optional()
    .transform((value) => (value ? value : undefined));

export const skillSchema = z.object({
  name: requiredText(SKILL_LIMITS.name),
  icon: optionalText(SKILL_LIMITS.icon),
  /**
   * `''` is what an untouched `<select>` posts, and a missing field is what a
   * category-less skill looks like, so both have to mean "uncategorised".
   */
  categoryId: nullableNumber
    .transform((value) => (value === '' ? undefined : Number(value)))
    // A category id comes from a `<select>` of real primary keys, so a negative or
    // fractional value can only come from a hand-edited URL or a tampered field.
    .refine((value) => value === undefined || (Number.isInteger(value) && value > 0), 'idInvalid'),
  level: optionalLevel,
  featured: booleanField,
  sortOrder: sortableNumber
    .refine((value) => value >= 0, 'sortOrderMin')
    .refine((value) => value <= 9_999, 'sortOrderMax'),
});

export type SkillInput = z.infer<typeof skillSchema>;

export const skillCategorySchema = z.object({
  nameEn: requiredText(SKILL_LIMITS.categoryName),
  nameAr: requiredText(SKILL_LIMITS.categoryName),
  sortOrder: sortableNumber
    .refine((value) => value >= 0, 'sortOrderMin')
    .refine((value) => value <= 9_999, 'sortOrderMax'),
});

export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;
