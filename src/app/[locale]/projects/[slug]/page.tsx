import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Globe } from 'lucide-react';
import { Container, Section } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Prose } from '@/components/ui/prose';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import type { ProjectStatus } from '@/generated/prisma/enums';
import {
  getAdjacentProjects,
  getProjectBySlug,
  getProjectSlugs,
  getRelatedProjects,
} from '@/server/queries/portfolio';

/**
 * Database status → message key.
 *
 * The schema uses workflow names (`DRAFT`, `PUBLISHED`, `ARCHIVED`) while the
 * message catalogue describes what a visitor sees (`completed`,
 * `in_progress`, `archived`). Mapping them here keeps the workflow vocabulary
 * out of the translations, and means a future rename of either side breaks in
 * one place instead of rendering a raw enum to a visitor.
 *
 * `DRAFT` is deliberately absent: only published projects are queried for the
 * public site, so it can never reach this map.
 */
const STATUS_MESSAGE_KEY = {
  PUBLISHED: 'completed',
  ARCHIVED: 'archived',
} as const satisfies Partial<Record<ProjectStatus, string>>;

type StatusMessageKey = (typeof STATUS_MESSAGE_KEY)[keyof typeof STATUS_MESSAGE_KEY];
import { ProjectCard } from '@/components/public/project-card';
import { ProjectThumb } from '@/components/public/project-thumb';
import { GitHubIcon } from '@/components/shared/brand-icons';

/**
 * Pre-render every project page at build time.
 *
 * Slugs come from the database rather than a hard-coded list, so publishing a
 * project from the dashboard and redeploying is enough to make its page exist.
 * `dynamicParams` is left at its default, so a slug that is not in the list
 * falls through to `notFound()` instead of being rendered on demand.
 */
/** Resolve a status to its message key, defaulting to the shipped/live state. */
function statusKey(status: ProjectStatus): StatusMessageKey {
  return STATUS_MESSAGE_KEY[status as keyof typeof STATUS_MESSAGE_KEY] ?? 'completed';
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();

  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });

  try {
    const project = await getProjectBySlug(slug, locale as Locale);

    return { title: project.title, description: project.description };
  } catch {
    // A missing project must not fail the build; the page component calls
    // `notFound()` immediately after this returns.
    return { title: t('detail.projectNotFound') };
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const typedLocale = locale as Locale;
  const t = await getTranslations('projects');
  const tCommon = await getTranslations('common');

  // Calls `notFound()` for an unknown slug or an unpublished project.
  const project = await getProjectBySlug(slug, typedLocale);

  const [adjacent, related] = await Promise.all([
    getAdjacentProjects(slug, typedLocale),
    getRelatedProjects(slug, typedLocale),
  ]);

  const technologies = project.technologies ?? [];

  return (
    <>
      <Section spacing="lg">
        <Container>
          <Reveal offset="none">
            <Button asChild variant="ghost" size="sm" className="-ms-3 mb-8">
              <Link href="/projects">
                <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                {t('detail.backToProjects')}
              </Link>
            </Button>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal offset="up" className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {project.category ? <Badge variant="outline">{project.category}</Badge> : null}
                <Badge variant="accent">{t(`status.${statusKey(project.status)}`)}</Badge>
              </div>

              <h1 className="text-h1 text-balance">{project.title}</h1>

              <p className="text-body-lg text-muted-foreground max-w-3xl text-pretty">
                {project.description}
              </p>
            </Reveal>

            {project.liveUrl || project.githubUrl ? (
              <Reveal offset="up" delay={0.08} className="flex flex-wrap gap-3">
                {project.liveUrl ? (
                  <Button asChild>
                    <a href={project.liveUrl} target="_blank" rel="noreferrer noopener">
                      <Globe className="size-4" aria-hidden="true" />
                      {t('card.liveDemo')}
                    </a>
                  </Button>
                ) : null}

                {project.githubUrl ? (
                  <Button asChild variant="outline">
                    <a href={project.githubUrl} target="_blank" rel="noreferrer noopener">
                      {/* Bundled brand glyph: lucide dropped its brand icons. */}
                      <GitHubIcon className="size-4" aria-hidden="true" />
                      {t('card.sourceCode')}
                    </a>
                  </Button>
                ) : null}
              </Reveal>
            ) : null}
          </div>
        </Container>
      </Section>

      {/* Cover art. `priority` matters here: this is the page's LCP element. */}
      <Section spacing="sm" className="pt-0">
        <Container>
          <Reveal offset="up">
            <div className="border-border bg-surface-2 relative aspect-[16/9] overflow-hidden rounded-2xl border">
              <ProjectThumb
                src={project.thumbnail}
                alt={project.title}
                slug={project.slug}
                sizes="(min-width: 1152px) 1152px, 100vw"
                priority
              />
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          {/*
            Single column on purpose. The message catalogue defines sections for
            features, challenges, solution and results, but the schema has no
            columns to back them yet; a sidebar of placeholders would be worse
            than an honest, readable column. Those sections slot in here when
            the fields are added.
          */}
          <div className="max-w-3xl">
            {project.longDescription ? (
              <Reveal offset="up">
                <section aria-labelledby="overview-heading" className="flex flex-col gap-4">
                  <h2 id="overview-heading" className="text-h3 font-semibold">
                    {t('detail.overview')}
                  </h2>
                  {/* The long description is authored as plain text with
                      paragraph breaks, so newlines are preserved. */}
                  <Prose className="whitespace-pre-line">{project.longDescription}</Prose>
                </section>
              </Reveal>
            ) : null}

            {technologies.length > 0 ? (
              <Reveal offset="up" className="mt-12">
                <section aria-labelledby="technologies-heading" className="flex flex-col gap-4">
                  <h2 id="technologies-heading" className="text-h3 font-semibold">
                    {t('detail.technologies')}
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {technologies.map((technology) => (
                      <li key={technology}>
                        <Chip size="sm">{technology}</Chip>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            ) : null}
          </div>
        </Container>
      </Section>

      {/* Previous / next, in the same order as the projects index so a visitor
          paging through has a consistent sense of place. */}
      {adjacent.previous || adjacent.next ? (
        <Section spacing="sm" divided>
          <Container>
            <nav
              aria-label={t('detail.nextProject')}
              className="flex items-center justify-between gap-4"
            >
              {adjacent.previous ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/projects/${adjacent.previous}`}>
                    <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                    {tCommon('previous')}
                  </Link>
                </Button>
              ) : (
                // Keeps "next" pinned to the inline-end edge when there is no
                // previous project.
                <span />
              )}

              {adjacent.next ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/projects/${adjacent.next}`}>
                    {tCommon('next')}
                    <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </nav>
          </Container>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section>
          <Container>
            <h2 className="text-h2 mb-10 font-semibold">{t('detail.relatedProjects')}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
