import 'server-only';

import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

/**
 * Admin read layer.
 *
 * Separate from `src/server/queries/portfolio.ts` on purpose. The public layer
 * only ever selects published rows and projects them onto one locale; the admin
 * layer needs drafts, both locales at once, counting, searching and pagination.
 * Mixing them would mean the public site could accidentally read a draft.
 *
 * Nothing here is cached: the dashboard must always show what is in the
 * database right now, and `unstable_cache` would only add a way to serve stale
 * content to the person editing it.
 */

// ---------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------

export type DashboardCounts = {
  projects: { total: number; published: number; drafts: number; featured: number };
  experience: number;
  educations: number;
  skills: number;
  services: { total: number; active: number };
  testimonials: { total: number; featured: number };
  messages: { total: number; unread: number };
  media: number;
};

/** Every number on the overview screen, in one round trip batch. */
export const getDashboardCounts = cache(async (): Promise<DashboardCounts> => {
  const [
    projects,
    projectPublished,
    projectDrafts,
    projectFeatured,
    experience,
    educations,
    skills,
    services,
    servicesActive,
    testimonials,
    testimonialsFeatured,
    messages,
    messagesUnread,
    media,
  ] = await prisma.$transaction([
    prisma.project.count(),
    prisma.project.count({ where: { status: 'PUBLISHED' } }),
    prisma.project.count({ where: { status: 'DRAFT' } }),
    prisma.project.count({ where: { featured: true } }),
    prisma.experience.count(),
    prisma.education.count(),
    prisma.skill.count(),
    prisma.service.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.testimonial.count(),
    prisma.testimonial.count({ where: { featured: true } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: 'NEW' } }),
    prisma.media.count(),
  ]);

  return {
    projects: {
      total: projects,
      published: projectPublished,
      drafts: projectDrafts,
      featured: projectFeatured,
    },
    experience,
    educations,
    skills,
    services: { total: services, active: servicesActive },
    testimonials: { total: testimonials, featured: testimonialsFeatured },
    messages: { total: messages, unread: messagesUnread },
    media,
  };
});

/** Sidebar badge. Separately cached so the shell does not refetch everything. */
export const getUnreadMessageCount = cache(async (): Promise<number> =>
  prisma.contactMessage.count({ where: { status: 'NEW' } }),
);

// ---------------------------------------------------------------------------
// Shared list plumbing
// ---------------------------------------------------------------------------

export type SortDirection = 'asc' | 'desc';

/** Search term, normalised so an empty box matches everything. */
export const normalizeSearch = (value: string | undefined | null): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export type ProjectListParams = {
  search?: string;
  status?: 'all' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category?: string;
  page?: number;
  perPage?: number;
};

const DEFAULT_PER_PAGE = 10;

/**
 * A page of projects for the admin table.
 *
 * `where` is built from typed fragments rather than a raw string so the filter
 * names are checked at compile time and the query stays parameterised.
 */
export const listAdminProjects = cache(async (params: ProjectListParams = {}) => {
  const {
    search = normalizeSearch(params.search),
    status = 'all',
    category,
    page = 1,
    perPage = DEFAULT_PER_PAGE,
  } = params;

  const where: Prisma.ProjectWhereInput = {
    ...(status !== 'all' ? { status } : {}),
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { titleEn: { contains: search } },
            { titleAr: { contains: search } },
            { descriptionEn: { contains: search } },
            { category: { contains: search } },
            { slug: { contains: search } },
          ],
        }
      : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        slug: true,
        category: true,
        thumbnail: true,
        status: true,
        featured: true,
        sortOrder: true,
        updatedAt: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    rows,
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
});

/** Distinct project categories, for the filter dropdown. */
export const listProjectCategories = cache(async (): Promise<string[]> => {
  const rows = await prisma.project.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  return rows.map((row) => row.category).filter((value): value is string => Boolean(value));
});

/** Full project row for the edit form. */
export const getAdminProject = cache(async (id: number) =>
  prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  }),
);

// ---------------------------------------------------------------------------
// Generic table lists
//
// Every remaining entity is a flat list with the same shape, so they share one
// paginated helper instead of eleven near-identical functions.

export type Paginated<T> = {
  rows: T[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export type PageParams = { page?: number; perPage?: number };

/** Clamp user-supplied paging input so a hand-edited URL cannot skip rows. */
function resolvePage({ page, perPage }: PageParams): {
  page: number;
  perPage: number;
  skip: number;
} {
  const safePerPage = Math.min(Math.max(perPage ?? DEFAULT_PER_PAGE, 1), 100);
  const safePage = Math.max(page ?? 1, 1);

  return { page: safePage, perPage: safePerPage, skip: (safePage - 1) * safePerPage };
}

function toPage<T>(
  rows: T[],
  total: number,
  { page, perPage }: { page: number; perPage: number },
): Paginated<T> {
  return { rows, total, page, perPage, pageCount: Math.max(1, Math.ceil(total / perPage)) };
}

export const listAdminExperiences = cache(async (params: { search?: string } & PageParams = {}) => {
  const search = normalizeSearch(params.search);
  const where: Prisma.ExperienceWhereInput = search
    ? { OR: [{ company: { contains: search } }, { positionEn: { contains: search } }] }
    : {};
  const paging = resolvePage(params);

  const [rows, total] = await prisma.$transaction([
    prisma.experience.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
      skip: paging.skip,
      take: paging.perPage,
    }),
    prisma.experience.count({ where }),
  ]);

  return toPage(rows, total, paging);
});

export const listAdminEducations = cache(async (params: { search?: string } & PageParams = {}) => {
  const search = normalizeSearch(params.search);
  const where: Prisma.EducationWhereInput = search
    ? { OR: [{ institution: { contains: search } }, { degreeEn: { contains: search } }] }
    : {};
  const paging = resolvePage(params);

  const [rows, total] = await prisma.$transaction([
    prisma.education.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
      skip: paging.skip,
      take: paging.perPage,
    }),
    prisma.education.count({ where }),
  ]);

  return toPage(rows, total, paging);
});

export const listAdminServices = cache(async (params: PageParams = {}) => {
  const paging = resolvePage(params);

  const [rows, total] = await prisma.$transaction([
    prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
      skip: paging.skip,
      take: paging.perPage,
    }),
    prisma.service.count(),
  ]);

  return toPage(rows, total, paging);
});

export const listAdminTestimonials = cache(async (params: PageParams = {}) => {
  const paging = resolvePage(params);

  const [rows, total] = await prisma.$transaction([
    prisma.testimonial.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip: paging.skip,
      take: paging.perPage,
    }),
    prisma.testimonial.count(),
  ]);

  return toPage(rows, total, paging);
});

export const listAdminSocialLinks = cache(async () => {
  const rows = await prisma.socialLink.findMany({ orderBy: { sortOrder: 'asc' } });
  return { rows, total: rows.length, page: 1, perPage: rows.length || 1, pageCount: 1 };
});

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export type SkillListParams = {
  search?: string;
  categoryId?: number;
  /** `undefined` for "any", which is distinct from `false`. */
  featured?: boolean;
  page?: number;
  perPage?: number;
};

export const listAdminSkills = cache(async (params: SkillListParams = {}) => {
  const {
    search = normalizeSearch(params.search),
    categoryId,
    featured,
    page = 1,
    perPage = 20,
  } = params;

  const where: Prisma.SkillWhereInput = {
    ...(categoryId ? { categoryId } : {}),
    // Tri-state: `undefined` means "any", which is not the same as filtering on
    // the column --- without this the `false` case could never be expressed.
    ...(featured === undefined ? {} : { featured }),
    ...(search ? { name: { contains: search } } : {}),
  };

  const [rows, total, categories] = await prisma.$transaction([
    prisma.skill.findMany({
      where,
      include: { category: { select: { id: true, nameEn: true, nameAr: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.skill.count({ where }),
    prisma.skillCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  return {
    rows,
    total,
    categories,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
});

export const listSkillCategories = cache(async () =>
  prisma.skillCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
);

export const getAdminSkill = cache(async (id: number) =>
  prisma.skill.findUnique({ where: { id } }),
);

/**
 * Single rows for the timeline edit forms.
 *
 * Returned raw rather than localised: the form edits the `_en` / `_ar` columns
 * side by side, so folding them into one `title` here would hide half of what the
 * form has to show. `localize` belongs to the public query layer.
 */
export const getAdminExperience = cache(async (id: number) =>
  prisma.experience.findUnique({ where: { id } }),
);

export const getAdminEducation = cache(async (id: number) =>
  prisma.education.findUnique({ where: { id } }),
);

// ---------------------------------------------------------------------------
// Contact messages
// ---------------------------------------------------------------------------

export type MessageListParams = {
  search?: string;
  status?: 'all' | 'NEW' | 'READ' | 'REPLIED' | 'SPAM';
  page?: number;
  perPage?: number;
};

export const listAdminMessages = cache(async (params: MessageListParams = {}) => {
  const {
    search = normalizeSearch(params.search),
    status = 'all',
    page = 1,
    perPage = 15,
  } = params;

  const where: Prisma.ContactMessageWhereInput = {
    ...(status !== 'all' ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { subject: { contains: search } },
            { message: { contains: search } },
          ],
        }
      : {}),
  };

  const paging = resolvePage({ page, perPage });

  // Explicit counts rather than `groupBy`: four extra indexed counts on a tiny
  // table are cheaper than fighting the aggregate result typing, and the
  // numbers are used for the tab labels only.
  const [rows, total, all, unread, read, replied, spam] = await prisma.$transaction([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: paging.skip,
      take: paging.perPage,
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: 'NEW' } }),
    prisma.contactMessage.count({ where: { status: 'READ' } }),
    prisma.contactMessage.count({ where: { status: 'REPLIED' } }),
    prisma.contactMessage.count({ where: { status: 'SPAM' } }),
  ]);

  return {
    ...toPage(rows, total, paging),
    counts: { all, NEW: unread, READ: read, REPLIED: replied, SPAM: spam },
  };
});

export const getAdminMessage = cache(async (id: number) =>
  prisma.contactMessage.findUnique({ where: { id } }),
);

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export const listMedia = cache(async (params: { search?: string } & PageParams = {}) => {
  const search = normalizeSearch(params.search);
  const where: Prisma.MediaWhereInput = search
    ? { OR: [{ filename: { contains: search } }, { altEn: { contains: search } }] }
    : {};
  const paging = resolvePage({ perPage: 24, ...params });

  const [rows, total] = await prisma.$transaction([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: paging.skip,
      take: paging.perPage,
    }),
    prisma.media.count({ where }),
  ]);

  return toPage(rows, total, paging);
});

/**
 * How many records reference a media path.
 *
 * The library refuses to delete a file that is still in use, because a dangling
 * `<Image src>` is a broken image on a live page. Rather than a database-level
 * constraint across six tables, usage is computed on demand and the result is
 * shown in the confirmation dialog.
 */
export const countMediaUsage = cache(async (path: string) => {
  const [projects, images, testimonials, users] = await prisma.$transaction([
    prisma.project.count({ where: { thumbnail: path } }),
    prisma.projectImage.count({ where: { image: path } }),
    prisma.testimonial.count({ where: { avatar: path } }),
    prisma.user.count({ where: { avatar: path } }),
  ]);

  return { projects, images, testimonials, users, total: projects + images + testimonials + users };
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const listSettings = cache(async () =>
  prisma.siteSetting.findMany({ orderBy: { key: 'asc' } }),
);

export const getSetting = cache(async (key: string) =>
  prisma.siteSetting.findUnique({ where: { key } }),
);

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

/** Most recently touched rows, for the overview screen. */
export const getRecentActivity = cache(async () => {
  const [projects, messages] = await prisma.$transaction([
    prisma.project.findMany({
      select: { id: true, titleEn: true, titleAr: true, slug: true, status: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.contactMessage.findMany({
      select: { id: true, name: true, subject: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return { projects, messages };
});
