import type { MetadataRoute } from 'next';
import { footerNav } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { routing, type Locale } from '@/i18n/routing';
import { getProjectSlugs } from '@/server/queries/portfolio';

/**
 * Paths that get a sitemap entry, expressed without a locale prefix.
 *
 * Sourced from the footer navigation so the sitemap cannot drift away from the
 * site's own idea of which pages exist; project detail pages are appended from
 * the database.
 */
const STATIC_PATHS = Array.from(
  new Set(
    footerNav
      .map((item) => item.href)
      // Anchors point inside a page; the page itself is already listed.
      .filter((href) => !href.includes('#'))
      .map((href) => (href === '/' ? '' : href)),
  ),
);

/**
 * Per-path crawl hints.
 *
 * `changeFrequency` and `priority` are hints, not instructions, but they are the
 * only signal this file can send about which pages matter. The home page is the
 * one page that should be crawled most often; deep project pages are stable, so
 * they ask for less frequent visits.
 */
const CRAWL_HINTS: Record<
  string,
  { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }
> = {
  '': { changeFrequency: 'weekly', priority: 1 },
  '/about': { changeFrequency: 'monthly', priority: 0.8 },
  '/projects': { changeFrequency: 'weekly', priority: 0.9 },
  '/experience': { changeFrequency: 'monthly', priority: 0.7 },
  '/services': { changeFrequency: 'monthly', priority: 0.8 },
  '/contact': { changeFrequency: 'yearly', priority: 0.6 },
};

const PROJECT_HINT = { changeFrequency: 'monthly', priority: 0.7 } as const;

/** Build a locale-aware absolute URL. `path` is locale-less (`''`, `/about`). */
function absoluteUrl(locale: Locale, path: string): string {
  return `${siteConfig.url}/${locale}${path}`;
}

/**
 * Alternate-language links for a single logical page.
 *
 * Every locale gets the full path, and `x-default` points at the default locale
 * so search engines have one authoritative fallback for the English page.
 */
function alternates(path: string): MetadataRoute.Sitemap[number]['alternates'] {
  return {
    languages: {
      ...Object.fromEntries(routing.locales.map((locale) => [locale, absoluteUrl(locale, path)])),
      'x-default': absoluteUrl(routing.defaultLocale, path),
    },
  };
}

/**
 * `sitemap.xml`
 *
 * Lists every public page in both languages, cross-linked with `hreflang`
 * alternates so the English and Arabic versions of a page are indexed as one
 * document with two variants instead of competing with each other.
 *
 * Reads published project slugs from the database, so publishing a project
 * revalidates the `projects` tag and the entry appears without a code change.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs().catch(() => [] as string[]);
  const now = new Date();

  return routing.locales.flatMap((locale) => [
    ...STATIC_PATHS.map((path) => ({
      url: absoluteUrl(locale, path),
      lastModified: now,
      changeFrequency: CRAWL_HINTS[path]?.changeFrequency ?? 'monthly',
      priority: CRAWL_HINTS[path]?.priority ?? 0.5,
      alternates: alternates(path),
    })),
    ...slugs.map((slug) => {
      const path = `/projects/${slug}`;
      return {
        url: absoluteUrl(locale, path),
        lastModified: now,
        ...PROJECT_HINT,
        alternates: alternates(path),
      };
    }),
  ]);
}
