import { Briefcase, MapPin } from 'lucide-react';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/motion/reveal';
import { EmptyState } from '@/components/ui/empty-state';
import { Prose } from '@/components/ui/prose';
import type { ExperienceItem } from '@/server/queries/portfolio';

/**
 * Vertical career timeline.
 *
 * The connector line is a single pseudo-element on the list rather than a
 * border per item, so a gap between entries never shows a stray vertical rule.
 * Entries are a real ordered list because the chronology is meaningful
 * information, not decorative layout.
 */
export async function ExperienceTimeline({ items }: { items: ExperienceItem[] }) {
  const t = await getTranslations('experience');
  // `getFormatter` / `getTranslations` are the async server counterparts of
  // the `useFormatter` / `useTranslations` hooks. Hooks cannot run in a server
  // component, which is why both lists are `async`.
  const format = await getFormatter();

  if (items.length === 0) {
    return <EmptyState title={t('empty.title')} description={t('empty.description')} />;
  }

  return (
    <ol className="relative flex flex-col gap-8 ps-8">
      {/* The rail sits on the inline-start edge and stops at the last dot. */}
      <span aria-hidden="true" className="bg-border absolute inset-y-2 start-[0.6875rem] w-px" />

      {items.map((item, index) => {
        const start = format.dateTime(item.startDate, {
          year: 'numeric',
          month: 'short',
        });
        // A null `endDate` means the role is current, so render "Present"
        // rather than an empty gap or a raw `Invalid Date`.
        const end =
          item.endDate === null
            ? t('present')
            : format.dateTime(item.endDate, { year: 'numeric', month: 'short' });

        return (
          <Reveal as="li" key={item.id} offset="up" className="relative">
            <span
              aria-hidden="true"
              className="border-surface bg-accent absolute -start-8 top-1.5 size-3.5 rounded-full border-2"
            />

            <Card className="gap-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="text-h4 font-semibold">{item.position}</h3>
                  <p className="text-body text-muted-foreground flex items-center gap-2">
                    <Briefcase className="size-4 shrink-0" aria-hidden="true" />
                    {item.company}
                  </p>
                </div>

                <p className="text-small text-subtle-foreground shrink-0 tabular-nums">
                  <span dir="ltr">
                    {start} — {end}
                  </span>
                </p>
              </div>

              {item.location ? (
                <p className="text-small text-subtle-foreground flex items-center gap-2">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  {item.location}
                </p>
              ) : null}

              {item.description ? <Prose className="text-small">{item.description}</Prose> : null}

              {item.technologies && item.technologies.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-caption text-subtle-foreground">{t('technologies')}</span>
                  {item.technologies.map((technology) => (
                    <Chip key={technology} size="sm" variant="soft">
                      {technology}
                    </Chip>
                  ))}
                </div>
              ) : null}

              {index === 0 && item.current ? (
                <span className="text-caption text-accent-foreground bg-accent-soft border-accent/30 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1">
                  <span className="bg-accent size-1.5 animate-pulse rounded-full" />
                  {t('present')}
                </span>
              ) : null}
            </Card>
          </Reveal>
        );
      })}
    </ol>
  );
}
