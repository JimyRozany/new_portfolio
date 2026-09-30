import type { Locale } from '@/i18n/routing';

/**
 * Locale-aware result shaping.
 *
 * The database stores bilingual content in sibling columns (`title_en`,
 * `title_ar`). Rather than leaking that convention into every page, the query
 * layer accepts plain `title` / `description` and resolves them to the right
 * column set. Two consequences:
 *
 *  1. A page never has to know the column naming convention.
 *  2. Switching locale needs no query changes --- the raw row is projected per
 *     request.
 *
 * The types are derived rather than hand-written, so a column rename shows up
 * as a type error at the query that selected it instead of silently becoming
 * `unknown` three layers up.
 */

/** The suffix a bilingual column uses for a locale (`title` + `En`). */
export const localeSuffix = (locale: Locale): 'En' | 'Ar' => (locale === 'ar' ? 'Ar' : 'En');

/**
 * True for keys that look like a bilingual column.
 *
 * Prisma maps the `title_en` / `title_ar` columns to `titleEn` / `titleAr`, so
 * the suffix here is camelCase. A `*En` / `*Ar` suffix is only produced by the
 * bilingual column pair --- no other column in the schema ends that way --- and
 * the type additionally requires *both* halves to be present, so a future
 * column such as `token` is unaffected.
 */
type BilingualKey<K> = K extends `${string}En` | `${string}Ar` ? K : never;

/** Base names that genuinely have *both* halves present, e.g. `title`. */
type BilingualBase<T> =
  Extract<keyof T, `${string}En`> extends infer K
    ? K extends `${infer Base}En`
      ? `${Base}Ar` extends keyof T
        ? Base
        : never
      : never
    : never;

/**
 * Fold `<field>_en` / `<field>_ar` into a single `<field>` key.
 *
 * The value type comes from the `_en` column because the schema declares both
 * halves with identical types.
 */
export type Localized<T> = {
  [K in keyof T as BilingualKey<K> extends never ? K : never]: DeepLocalized<T[K]>;
} & {
  [Base in BilingualBase<T>]: DeepLocalized<T[Extract<`${Base}En`, keyof T>]>;
};

/** Recursively apply {@link Localized} to nested rows and lists. */
export type DeepLocalized<T> = T extends Date
  ? T
  : T extends readonly (infer Item)[]
    ? DeepLocalized<Item>[]
    : T extends object
      ? Localized<T>
      : T;

function isRow(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !(value instanceof Date);
}

/**
 * Project a raw Prisma row onto the active locale, recursing into relations.
 *
 * ```ts
 * localize({ titleEn: 'Desar', titleAr: 'ديزار' }, 'ar')
 * // → { title: 'ديزار' }
 * ```
 *
 * The sibling columns are *removed* rather than kept alongside, so nothing
 * downstream can accidentally read the wrong language.
 *
 * @param row    A Prisma result containing bilingual column pairs.
 * @param locale The active locale.
 */
export function localize<T>(row: T, locale: Locale): DeepLocalized<T> {
  // `reviveDates` runs on the way out because the data cache serialises the
  // result, turning every `Date` into a string. See {@link reviveDates}.
  return reviveDates(project(row, locale)) as DeepLocalized<T>;
}

/**
 * Exact string shape produced by `Date.prototype.toJSON`.
 *
 * Deliberately strict: the reviver has to tell a serialised date apart from an
 * ordinary text column, and a loose pattern such as `^\d{4}-\d{2}-\d{2}$` would
 * happily convert a description that merely *mentions* a date. Requiring the
 * full `T…:…:….…Z` form means only a value that really was a `Date` matches.
 */
const SERIALISED_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Turn serialised dates back into `Date` objects.
 *
 * Next.js' data cache stores query results as JSON, so a `DateTime` column comes
 * back as `"2025-04-01T00:00:00.000Z"`. That is harmless until it reaches
 * `Intl.DateTimeFormat.prototype.format`, which accepts a `Date` or a numeric
 * timestamp but throws `RangeError: Invalid time value` for a *string* --- it
 * does not coerce. The symptom is a page that renders but logs a formatting
 * error, which is easy to miss and easy to misattribute to the data.
 *
 * Running the reviver here fixes it at the boundary, so every caller can keep
 * treating a `DateTime` column as a `Date` and the declared types stay honest.
 * Values that are already `Date` objects pass straight through.
 */
function reviveDates(value: unknown): unknown {
  if (typeof value === 'string') {
    return SERIALISED_DATE.test(value) ? new Date(value) : value;
  }

  if (Array.isArray(value)) return value.map(reviveDates);

  if (isRow(value)) {
    for (const key of Object.keys(value)) {
      value[key] = reviveDates(value[key]);
    }
  }

  return value;
}

function project(value: unknown, locale: Locale): unknown {
  if (Array.isArray(value)) return value.map((item) => project(item, locale));
  if (!isRow(value)) return value;

  const suffix = localeSuffix(locale);
  const out: Record<string, unknown> = {};

  // Pass 1 --- copy every non-bilingual key, recursing into relations.
  for (const [key, item] of Object.entries(value)) {
    if (BILINGUAL_SUFFIX.test(key)) continue;
    out[key] = project(item, locale);
  }

  // Pass 2 --- collapse each complete `En` / `Ar` pair into one key.
  for (const key of Object.keys(value)) {
    if (!key.endsWith('En')) continue;

    const base = key.slice(0, -2);
    if (`${base}Ar` in value) {
      out[base] = value[`${base}${suffix}`] ?? null;
    }
  }

  return out;
}

/** Matches a trailing `En` / `Ar` on a key (see {@link BilingualKey}). */
const BILINGUAL_SUFFIX = /(En|Ar)$/;

/** Apply {@link localize} to a list of rows. */
export function localizeAll<T>(rows: readonly T[], locale: Locale): DeepLocalized<T>[] {
  return rows.map((row) => localize(row, locale));
}
