import { ArrowUpRight, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Chip, ChipDot } from '@/components/ui/chip';
import { Reveal } from '@/components/motion/reveal';
import { SpotlightCard } from '@/components/motion/spotlight-card';
import { getSocialIcon } from '@/components/shared/social-icon';
import { socialLabels } from '@/config/navigation';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { ProjectListItem } from '@/server/queries/portfolio';
import { ProjectThumb } from './project-thumb';

/**
 * Project card used on the home grid, the projects index and the "related
 * projects" rail.
 *
 * The whole card is a single link. Nested links would be invalid HTML, so the
 * live-demo and source-code links are rendered as sibling overlays positioned
 * over the card rather than as children of it. That keeps one large hit target
 * plus two precise ones, all keyboard reachable.
 */
export function ProjectCard({
  project,
  className,
  priority = false,
}: {
  project: ProjectListItem;
  className?: string;
  /** Set on the first row so the LCP image is not lazy-loaded. */
  priority?: boolean;
}) {
  const t = useTranslations('projects');
  const locale = useLocale() as Locale;

  return (
    <Reveal offset="up" className={className}>
      <SpotlightCard className="group h-full rounded-xl">
        <Card className="h-full overflow-hidden">
          {/* Whole-card link. Stretched over the card so the entire surface is
              clickable while remaining a single, correctly-labelled link. */}
          <Link
            href={`/projects/${project.slug}`}
            className="focus-visible:outline-ring absolute inset-0 z-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="sr-only">{t('card.viewDetails')}</span>
          </Link>

          <div className="border-border bg-surface-2 relative aspect-[16/10] overflow-hidden border-b">
            <ProjectThumb
              src={project.thumbnail}
              alt={project.title}
              slug={project.slug}
              priority={priority}
            />
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-h4 leading-tight font-semibold">{project.title}</h3>
              <ArrowUpRight
                className="text-subtle-foreground group-hover:text-foreground size-5 shrink-0 transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </div>

            <p className="text-small text-muted-foreground line-clamp-3 flex-1">
              {project.description}
            </p>

            {/* `pointer-events-none` because the stretched card link sits above
                this row; the two real links re-enable pointer events. */}
            <div className="pointer-events-none relative flex flex-wrap items-center gap-1.5">
              {(project.technologies ?? []).slice(0, 4).map((technology) => (
                <Chip key={technology} size="sm">
                  <ChipDot />
                  {technology}
                </Chip>
              ))}
              {(project.technologies?.length ?? 0) > 4 ? (
                <Chip size="sm" variant="soft">
                  +{project.technologies!.length - 4}
                </Chip>
              ) : null}
            </div>

            {project.liveUrl || project.githubUrl ? (
              <div className="pointer-events-none relative z-10 flex flex-wrap items-center gap-4">
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-caption text-muted-foreground hover:text-foreground focus-visible:outline-ring pointer-events-auto inline-flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Globe className="size-3.5" aria-hidden="true" />
                    {t('card.liveDemo')}
                    <span className="sr-only">— {project.title}</span>
                  </a>
                ) : null}

                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-caption text-muted-foreground hover:text-foreground focus-visible:outline-ring pointer-events-auto inline-flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {(() => {
                      // Reuse the shared brand-icon map; lucide dropped its
                      // brand glyphs, so the project cannot hardcode one.
                      const GitHubIcon = getSocialIcon('github');
                      return GitHubIcon ? (
                        <GitHubIcon className="size-3.5" aria-hidden="true" />
                      ) : null;
                    })()}
                    {t('card.sourceCode')}
                    <span className="sr-only">
                      — {socialLabels.github?.[locale] ?? 'GitHub'}: {project.title}
                    </span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </Card>
      </SpotlightCard>
    </Reveal>
  );
}
