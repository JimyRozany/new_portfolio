import { z } from 'zod';

/**
 * Validation for the admin experience and education forms.
 *
 * The two are validated together because they are the same *shape* of record ---
 * a bilingual title, an optional description pair, a date range that may still be
 * open, and a sort order --- differing only in what they call those fields
 * ("position" vs "degree", with education adding an optional field of study).
 * Sharing the helpers keeps the date rules in one place, which is the part worth
 * getting right; the two schemas themselves stay separate objects so they can
 * diverge without a shared edit.
 *
 * Lives outside the `'use server'` module because a server action file may only
 * export async functions.
 */

/** Mirrors the Prisma column widths, so an over-long value fails as a form error. */
export const TIMELINE_LIMITS = {
  institution: 191,
  position: 191,
  degree: 191,
  field: 191,
  description: 4_000,
  location: 120,
  technology: 60,
  technologyCount: 20,
} as const;

/** The only date shape a `<input type="date">` produces. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Bounds a career timeline can plausibly describe, as inclusive UTC years. */
const MIN_YEAR = 1970;
const MAX_YEAR = 2100;

/**
 * Parse `YYYY-MM-DD` into a `Date` at UTC midnight, or `null` when the input is
 * blank, absent, or not a real calendar date.
 *
 * Hand-rolled rather than `new Date(value)` because that constructor is lenient in
 * two ways that matter here: `new Date('2024-13-45')` rolls over to a different
 * year instead of failing, and a bare `'2024-06'` is read as the first of the
 * month. Either would store a date the owner never typed. The round-trip check is
 * what rejects the rollover --- the string going in has to be exactly the string
 * that comes back out.
 *
 * UTC midnight specifically: the column is a `@db.Date`, so a local-time `Date`
 * would land on the previous or next day either side of the UTC boundary and a
 * role could start on the 1st in one region and the 2nd in another.
 */
export function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  if (!ISO_DATE.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) return null;
  // The rollover guard: a rolled-over date is a real `Date`, just not this one.
  if (date.toISOString().slice(0, 10) !== value) return null;
  if (date.getUTCFullYear() < MIN_YEAR || date.getUTCFullYear() > MAX_YEAR) return null;

  return date;
}

/** Earliest and latest year accepted, so the form can label the bounds. */
export const TIMELINE_DATE_BOUNDS = { min: MIN_YEAR, max: MAX_YEAR } as const;

/**
 * A date field, validated as a string before anything parses it.
 *
 * Blank and absent both mean "not set", which is why `.optional()` comes first:
 * without it a field the owner never touched fails with Zod's type error, which is
 * an English sentence with no code to translate. The refine then reports
 * `dateInvalid` for anything that is present but unparseable, including the
 * rollover cases `parseIsoDate` rejects.
 */
const dateField = z
  .string()
  .optional()
  .refine((value) => value === undefined || value === '' || parseIsoDate(value) !== null, {
    message: 'dateInvalid',
  });

/** Same as {@link dateField}, but a blank is not allowed. */
const requiredDateField = dateField.refine((value) => value !== undefined && value !== '', {
  message: 'dateRequired',
});

/**
 * `current` and a null `endDate` mean the same thing, and the two can disagree.
 *
 * The column comment says a null `endDate` means "still here", while `current` is
 * the separate flag the public timeline uses to badge the newest role. Rather than
 * let the owner store a contradiction, `current` is authoritative and the action
 * derives the date from it: ticked forces a null `endDate`.
 */
const currentFlag = z.preprocess(
  // `undefined` becomes `''` so a missing field is rejected by the same `.refine`
  // below instead of tripping Zod's type check first.
  (value) => (value === undefined || value === null ? '' : String(value)),
  /**
   * `.refine` rather than `.enum`, because `enum` reports an English sentence
   * listing the expected values --- no code for the form to translate.
   */
  z
    .string()
    .refine((value) => value === 'true' || value === 'false', 'notABoolean')
    .transform((value) => value === 'true'),
);

/** Optional single-column text: absent, blank, and whitespace all mean "not set". */
const optionalText = (max: number, code: string) =>
  z
    .string()
    .trim()
    .max(max, code)
    .optional()
    .transform((value) => (value ? value : undefined));

/** Required single-column text, for a proper noun like a company name. */
const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, 'nameRequired')
    .max(max, 'nameMax')
    // A field with no input at all is a required field left blank, so it gets the
    // same code as an empty string rather than Zod's type error.
    .or(z.undefined().transform(() => ''))
    .pipe(z.string().trim().min(1, 'nameRequired').max(max, 'nameMax'));

/** Required bilingual text: both languages are rendered, so both are required. */
const requiredBilingual = (max: number, code: string) =>
  z
    .string()
    .trim()
    .min(1, 'titleRequired')
    .max(max, code)
    .or(z.undefined().transform(() => ''))
    .pipe(z.string().trim().min(1, 'titleRequired').max(max, code));

const sortableNumber = z
  .preprocess(
    (value) => (value === undefined || value === null || value === '' ? '' : String(value)),
    /**
     * A signed decimal rather than digits-only, so a negative or fractional value is
     * rejected by the range checks below and gets the specific message instead of a
     * generic "not a number" that would also appear for a genuine `1.5`.
     */
    z.union([z.literal(''), z.string().regex(/^-?\d*\.?\d+$/, 'notANumber')]),
  )
  .refine((value) => value !== '', 'sortOrderRequired')
  .transform((value) => (value === '' ? 0 : Number(value)))
  .refine((value) => Number.isInteger(value), 'sortOrderInt')
  .refine((value) => value >= 0, 'sortOrderMin')
  .refine((value) => value <= 9_999, 'sortOrderMax');

/**
 * The stack repeater posts one hidden input per entry, collapsed to a
 * comma-separated string by the form. An empty repeater submits *no* field at
 * all, which `.optional()` turns into "none" rather than a validation error.
 */
const technologies = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .slice(0, TIMELINE_LIMITS.technologyCount),
  )
  .refine(
    (entries) => entries.every((entry) => entry.length <= TIMELINE_LIMITS.technology),
    'technologyMax',
  );

/**
 * Resolve the submitted date strings, applying `current` as the authority on
 * `endDate`.
 *
 * Shared by both schemas so "ticking Current clears the end date" cannot drift
 * between them. Assumes the strings already passed {@link dateField}.
 */
function resolveDates(input: { startDate?: string; endDate?: string; current: boolean }): {
  startDate: Date;
  endDate: Date | null;
} {
  // Non-null: `requiredDateField` already rejected a blank start date, so by the
  // time anything reads this the parse cannot fail.
  const startDate = parseIsoDate(input.startDate) ?? new Date(Date.UTC(MIN_YEAR, 0, 1));

  return { startDate, endDate: input.current ? null : parseIsoDate(input.endDate) };
}

/** An end before the start is nonsense, and the columns cannot catch it. */
function endsBeforeStart(value: { startDate: Date; endDate: Date | null }): boolean {
  return value.endDate !== null && value.endDate < value.startDate;
}

export const experienceSchema = z
  .object({
    company: requiredText(TIMELINE_LIMITS.institution),
    positionEn: requiredBilingual(TIMELINE_LIMITS.position, 'positionMax'),
    positionAr: requiredBilingual(TIMELINE_LIMITS.position, 'positionMax'),
    descriptionEn: optionalText(TIMELINE_LIMITS.description, 'descriptionMax'),
    descriptionAr: optionalText(TIMELINE_LIMITS.description, 'descriptionMax'),
    startDate: requiredDateField,
    endDate: dateField,
    current: currentFlag,
    location: optionalText(TIMELINE_LIMITS.location, 'locationMax'),
    technologies,
    sortOrder: sortableNumber,
  })
  .transform((input) => ({
    company: input.company,
    positionEn: input.positionEn,
    positionAr: input.positionAr,
    descriptionEn: input.descriptionEn ?? null,
    descriptionAr: input.descriptionAr ?? null,
    ...resolveDates(input),
    current: input.current,
    location: input.location ?? null,
    // `null` rather than `[]` so the query layer can tell "no stack" from "an
    // empty stack", matching how `Experience.technologies` is read.
    technologies: input.technologies.length > 0 ? input.technologies : null,
    sortOrder: input.sortOrder,
  }))
  .refine((value) => !endsBeforeStart(value), { message: 'endBeforeStart', path: ['endDate'] });

export type ExperienceInput = z.infer<typeof experienceSchema>;

export const educationSchema = z
  .object({
    institution: requiredText(TIMELINE_LIMITS.institution),
    degreeEn: requiredBilingual(TIMELINE_LIMITS.degree, 'degreeMax'),
    degreeAr: requiredBilingual(TIMELINE_LIMITS.degree, 'degreeMax'),
    fieldEn: optionalText(TIMELINE_LIMITS.field, 'fieldMax'),
    fieldAr: optionalText(TIMELINE_LIMITS.field, 'fieldMax'),
    descriptionEn: optionalText(TIMELINE_LIMITS.description, 'descriptionMax'),
    descriptionAr: optionalText(TIMELINE_LIMITS.description, 'descriptionMax'),
    startDate: requiredDateField,
    endDate: dateField,
    current: currentFlag,
    sortOrder: sortableNumber,
  })
  .transform((input) => ({
    institution: input.institution,
    degreeEn: input.degreeEn,
    degreeAr: input.degreeAr,
    fieldEn: input.fieldEn ?? null,
    fieldAr: input.fieldAr ?? null,
    descriptionEn: input.descriptionEn ?? null,
    descriptionAr: input.descriptionAr ?? null,
    ...resolveDates(input),
    current: input.current,
    sortOrder: input.sortOrder,
  }))
  .refine((value) => !endsBeforeStart(value), { message: 'endBeforeStart', path: ['endDate'] });

export type EducationInput = z.infer<typeof educationSchema>;

/**
 * `Date` to the string a `<input type="date">` needs for its value.
 *
 * `toISOString().slice(0, 10)` rather than manual padding, so there is one
 * definition of "a date as `YYYY-MM-DD`" in the codebase. Null becomes `''`,
 * which is what an empty date input needs in order to submit a blank.
 */
export function toDateInputValue(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : '';
}
