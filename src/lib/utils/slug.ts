/**
 * Slug helpers.
 *
 * Slugs are the public URL of every project, so they must be URL-safe, stable
 * and readable. Arabic titles are transliterated by stripping diacritics and
 * keeping the Arabic letters as-is (browsers handle UTF-8 path segments fine
 * and it keeps the slug human-meaningful in both languages).
 */

const ARABIC_DIACRITICS = /[\u0617-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_TATWEEL = /\u0640/g;

/** Turn a free-text title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(ARABIC_DIACRITICS, '')
    .replace(ARABIC_TATWEEL, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/**
 * Guarantee a slug is unique by appending `-2`, `-3`, … when needed.
 * `isTaken` receives the candidate and returns whether it already exists.
 */
export async function uniqueSlug(
  desired: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(desired) || 'item';
  if (!(await isTaken(base))) return base;

  // 20 attempts is far more than a single author will ever create.
  for (let suffix = 2; suffix <= 21; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  return `${base}-${Date.now()}`;
}
