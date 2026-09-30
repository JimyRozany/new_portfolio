import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import type { DeepLocalized } from './localize';
import { localize, localizeAll } from './localize';

/**
 * Public read layer.
 *
 * Every function here is the *only* place that talks to Prisma for the public
 * site. Pages and components consume the result; they never import `prisma`
 * directly. That keeps the UI free of query code and means changing a query
 * (adding a join, adjusting an index) can never ripple into a component.
 *
 * Caching strategy:
 *  - `unstable_cache` revalidates on tags, so the admin can purge a section
 *    after an edit without waiting for a time-based expiry.
 *  - `cache()` dedupes within a single render pass, which matters because
 *    several sections of the home page read the same settings row.
 */

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

/** Setting keys the public site reads. Keeping them in one list makes typos loud. */
const SETTING_KEYS = {
  title: 'site.title',
  tagline: 'site.tagline',
  description: 'site.description',
  email: 'contact.email',
  phone: 'contact.phone',
  location: 'contact.location',
  available: 'contact.available',
  yearsOfExperience: 'profile.years_of_experience',
  resumePath: 'resume.path',
  socialDefaults: 'social.defaults',
  ogImage: 'seo.og_image',
  showTestimonials: 'features.show_testimonials',
  showServices: 'features.show_services',
} as const;

export type SiteSettings = {
  title: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  available: boolean;
  yearsOfExperience: number;
  resumePath: string;
  ogImage: string;
  showTestimonials: boolean;
  showServices: boolean;
  socials: Array<{ platform: string; url: string }>;
};

const FALLBACK_SETTINGS: SiteSettings = {
  title: 'Mohamed Gamal',
  tagline: 'Full Stack Developer',
  description: '',
  email: '',
  phone: '',
  location: '',
  available: false,
  yearsOfExperience: 0,
  resumePath: '/Mohamed_Gamal_CV.pdf',
  ogImage: '/opengraph-image.png',
  showTestimonials: false,
  showServices: true,
  socials: [],
};

/**
 * Settings are stored as raw strings and may hold JSON for localized values.
 * A malformed value must never take a page down, so every read is defensive
 * and falls back to the static default.
 */
function readString(value: string | undefined, fallback: string, locale: Locale): string {
  if (value === undefined) return fallback;

  const trimmed = value.trim();

  // A JSON object means the value is localized: pick the active locale.
  if (trimmed.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const record = parsed as Record<string, unknown>;
        const picked = record[locale] ?? record.en;
        return typeof picked === 'string' && picked.length > 0 ? picked : fallback;
      }
    } catch {
      // Not JSON after all --- treat the raw string as the value.
    }
  }

  return trimmed.length > 0 ? trimmed : fallback;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

function readNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readSocials(value: string | undefined): SiteSettings['socials'] {
  if (value === undefined) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is { platform: string; url: string } =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as { platform?: unknown }).platform === 'string' &&
          typeof (item as { url?: unknown }).url === 'string',
      );
    }
  } catch {
    // Fall through to the empty list.
  }

  return [];
}

/**
 * Read the site settings for a locale.
 *
 * Cached per locale and invalidated by the `settings` tag.
 */
export const getSiteSettings = cache(async (locale: Locale): Promise<SiteSettings> => {
  const rows = await unstable_cache(
    () =>
      prisma.siteSetting.findMany({
        where: { key: { in: Object.values(SETTING_KEYS) } },
      }),
    ['site-settings'],
    { tags: ['settings'] },
  )();

  const map = new Map(rows.map((row) => [row.key, row.value]));

  return {
    title: readString(map.get(SETTING_KEYS.title), FALLBACK_SETTINGS.title, locale),
    tagline: readString(map.get(SETTING_KEYS.tagline), FALLBACK_SETTINGS.tagline, locale),
    description: readString(
      map.get(SETTING_KEYS.description),
      FALLBACK_SETTINGS.description,
      locale,
    ),
    email: readString(map.get(SETTING_KEYS.email), FALLBACK_SETTINGS.email, locale),
    phone: readString(map.get(SETTING_KEYS.phone), FALLBACK_SETTINGS.phone, locale),
    location: readString(map.get(SETTING_KEYS.location), FALLBACK_SETTINGS.location, locale),
    available: readBoolean(map.get(SETTING_KEYS.available), FALLBACK_SETTINGS.available),
    yearsOfExperience: readNumber(
      map.get(SETTING_KEYS.yearsOfExperience),
      FALLBACK_SETTINGS.yearsOfExperience,
    ),
    resumePath: readString(map.get(SETTING_KEYS.resumePath), FALLBACK_SETTINGS.resumePath, locale),
    ogImage: readString(map.get(SETTING_KEYS.ogImage), FALLBACK_SETTINGS.ogImage, locale),
    showTestimonials: readBoolean(
      map.get(SETTING_KEYS.showTestimonials),
      FALLBACK_SETTINGS.showTestimonials,
    ),
    showServices: readBoolean(map.get(SETTING_KEYS.showServices), FALLBACK_SETTINGS.showServices),
    socials: readSocials(map.get(SETTING_KEYS.socialDefaults)),
  };
});

// ---------------------------------------------------------------------------
// Result shapes
//
// Derived from the Prisma payload types rather than written by hand, so a column
// added to the schema flows straight through to the components with no edit
// here. `DeepLocalized` then folds the `En` / `Ar` column pairs into one key.
// ---------------------------------------------------------------------------

type ProjectRow = Prisma.ProjectGetPayload<{ include: { images: true } }>;
type SkillRow = Prisma.SkillGetPayload<{ include: { category: true } }>;
type ServiceRow = Prisma.ServiceGetPayload<Record<string, never>>;

/** Row with the `Json` column replaced by its normalised, validated form. */
export type ProjectListItem = Omit<DeepLocalized<ProjectRow>, 'technologies'> & {
  technologies: string[] | null;
};
export type SkillWithCategory = DeepLocalized<SkillRow>;
export type ExperienceItem = Omit<
  DeepLocalized<Prisma.ExperienceGetPayload<Record<string, never>>>,
  'technologies'
> & {
  technologies: string[] | null;
};
export type EducationItem = DeepLocalized<Prisma.EducationGetPayload<Record<string, never>>>;
/** Row with the `Json` column replaced by its normalised, validated form. */
export type ServiceItem = Omit<DeepLocalized<ServiceRow>, 'features'> & {
  features: string[] | null;
};
export type TestimonialItem = DeepLocalized<Prisma.TestimonialGetPayload<Record<string, never>>>;

/**
 * Normalise a Prisma `Json` column that holds an array of strings.
 *
 * `Json` columns are `unknown` as far as TypeScript is concerned, and the admin
 * form writes whatever the browser sent, so the value is validated at the read
 * boundary rather than trusted. Returns `null` (not `[]`) for "absent" so
 * callers can distinguish "no data" from "empty list" and skip the section.
 */
function toStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const items = value.filter((item): item is string => typeof item === 'string');
  return items.length > 0 ? items : null;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export type ProjectSort = 'newest' | 'oldest' | 'title';

const PROJECT_ORDER_BY = {
  newest: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  oldest: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  title: [{ sortOrder: 'asc' }, { titleEn: 'asc' }],
} as const satisfies Record<ProjectSort, Prisma.ProjectOrderByWithRelationInput[]>;

export type ProjectFilters = {
  category?: string;
  featured?: boolean;
  sort?: ProjectSort;
  limit?: number;
};

/**
 * Slugs of every published project, for `generateStaticParams` and the sitemap.
 *
 * Slugs are locale-independent, so this is cached once and shared across
 * locales rather than re-queried per language.
 */
export const getProjectSlugs = cache(async (): Promise<string[]> => {
  const rows = await unstable_cache(
    () =>
      prisma.project.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    ['project-slugs-list'],
    { tags: ['projects'] },
  )();

  return rows.map((row) => row.slug);
});

/** All distinct project categories, for the filter UI. */
export const getProjectCategories = cache(async (): Promise<string[]> => {
  const rows = await unstable_cache(
    () =>
      prisma.project.findMany({
        where: { status: 'PUBLISHED' },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
    ['project-categories'],
    { tags: ['projects'] },
  )();

  return rows.map((row) => row.category).filter((value): value is string => Boolean(value));
});

export const getProjects = cache(
  async (locale: Locale, filters: ProjectFilters = {}): Promise<ProjectListItem[]> => {
    const { category, featured, sort = 'newest', limit } = filters;

    const rows = await unstable_cache(
      () =>
        prisma.project.findMany({
          where: {
            status: 'PUBLISHED',
            ...(category ? { category } : {}),
            ...(featured === undefined ? {} : { featured }),
          },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
          orderBy: [...PROJECT_ORDER_BY[sort]],
          ...(limit ? { take: limit } : {}),
        }),
      ['projects', locale, category ?? 'all', String(featured ?? 'any'), sort, String(limit ?? 0)],
      { tags: ['projects'] },
    )();

    return localizeAll(rows, locale).map((row) => ({
      ...row,
      technologies: toStringArray(row.technologies),
    }));
  },
);

/** One project by slug. Throws a 404 when it does not exist or is not published. */
export const getProjectBySlug = cache(
  async (slug: string, locale: Locale): Promise<ProjectListItem> => {
    const row = await unstable_cache(
      () =>
        prisma.project.findFirst({
          where: { slug, status: 'PUBLISHED' },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
        }),
      ['project', slug],
      { tags: ['projects'] },
    )();

    if (!row) notFound();

    return { ...localize(row, locale), technologies: toStringArray(row.technologies) };
  },
);

/** Adjacent published projects, used for the "next project" link. */
export const getAdjacentProjects = cache(
  async (
    currentSlug: string,
    locale: Locale,
  ): Promise<{ previous: string | null; next: string | null }> => {
    const slugs = await unstable_cache(
      () =>
        prisma.project.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
      ['project-slugs'],
      { tags: ['projects'] },
    )();

    const index = slugs.findIndex((row) => row.slug === currentSlug);

    if (index === -1) return { previous: null, next: null };

    void locale; // Slugs are locale-independent.

    return {
      previous: index > 0 ? (slugs[index - 1]?.slug ?? null) : null,
      next: index < slugs.length - 1 ? (slugs[index + 1]?.slug ?? null) : null,
    };
  },
);

/** Other published projects sharing a category, capped for the detail page. */
export const getRelatedProjects = cache(
  async (slug: string, locale: Locale, limit = 3): Promise<ProjectListItem[]> => {
    const current = await unstable_cache(
      () => prisma.project.findUnique({ where: { slug }, select: { category: true } }),
      ['project-category', slug],
      { tags: ['projects'] },
    )();

    const rows = await unstable_cache(
      () =>
        prisma.project.findMany({
          where: {
            status: 'PUBLISHED',
            slug: { not: slug },
            ...(current?.category ? { category: current.category } : {}),
          },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: limit,
        }),
      ['related-projects', slug, String(limit)],
      { tags: ['projects'] },
    )();

    return localizeAll(rows, locale).map((row) => ({
      ...row,
      technologies: toStringArray(row.technologies),
    }));
  },
);

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export const getSkillCategories = cache(
  async (locale: Locale): Promise<Array<{ id: number; name: string; sortOrder: number }>> => {
    const rows = await unstable_cache(
      () => prisma.skillCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
      ['skill-categories'],
      { tags: ['skills'] },
    )();

    return localizeAll(rows, locale);
  },
);

/** All skills, or only the featured ones for the compact home-page strip. */
export const getSkills = cache(
  async (
    locale: Locale,
    options: { featuredOnly?: boolean } = {},
  ): Promise<SkillWithCategory[]> => {
    const { featuredOnly = false } = options;

    const rows = await unstable_cache(
      () =>
        prisma.skill.findMany({
          where: featuredOnly ? { featured: true } : {},
          include: { category: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        }),
      ['skills', String(featuredOnly)],
      { tags: ['skills'] },
    )();

    return localizeAll(rows, locale);
  },
);

// ---------------------------------------------------------------------------
// Experience and education
// ---------------------------------------------------------------------------

export const getExperiences = cache(async (locale: Locale): Promise<ExperienceItem[]> => {
  const rows = await unstable_cache(
    () => prisma.experience.findMany({ orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }] }),
    ['experiences'],
    { tags: ['experience'] },
  )();

  return localizeAll(rows, locale).map((row) => ({
    ...row,
    technologies: toStringArray(row.technologies),
  }));
});

export const getEducations = cache(async (locale: Locale): Promise<EducationItem[]> => {
  const rows = await unstable_cache(
    () => prisma.education.findMany({ orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }] }),
    ['educations'],
    { tags: ['education'] },
  )();

  return localizeAll(rows, locale);
});

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export const getServices = cache(
  async (locale: Locale, options: { activeOnly?: boolean } = {}): Promise<ServiceItem[]> => {
    const { activeOnly = true } = options;

    const rows = await unstable_cache(
      () =>
        prisma.service.findMany({
          where: activeOnly ? { active: true } : {},
          orderBy: { sortOrder: 'asc' },
        }),
      ['services', String(activeOnly)],
      { tags: ['services'] },
    )();

    return localizeAll(rows, locale).map((row) => ({
      ...row,
      features: toStringArray(row.features),
    }));
  },
);

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export const getTestimonials = cache(
  async (locale: Locale, options: { featuredOnly?: boolean } = {}): Promise<TestimonialItem[]> => {
    const { featuredOnly = false } = options;

    const rows = await unstable_cache(
      () =>
        prisma.testimonial.findMany({
          where: featuredOnly ? { featured: true } : {},
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
      ['testimonials', String(featuredOnly)],
      { tags: ['testimonials'] },
    )();

    return localizeAll(rows, locale);
  },
);

// ---------------------------------------------------------------------------
// Social links
// ---------------------------------------------------------------------------

export const getSocialLinks = cache(
  async (): Promise<Array<{ id: number; platform: string; url: string }>> => {
    return unstable_cache(
      () =>
        prisma.socialLink.findMany({
          where: { active: true },
          select: { id: true, platform: true, url: true },
          orderBy: { sortOrder: 'asc' },
        }),
      ['social-links'],
      { tags: ['socials'] },
    )();
  },
);
