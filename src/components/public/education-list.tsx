import { GraduationCap } from 'lucide-react';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { EmptyState } from '@/components/ui/empty-state';
import { Prose } from '@/components/ui/prose';
import type { EducationItem } from '@/server/queries/portfolio';

/**
 * Education entries as a compact card grid.
 *
 * Separate from the experience timeline: study is a small, parallel list rather
 * than a chronology, so a grid of cards reads better than a second rail and
 * avoids implying that a degree has a "current" status the way a job does.
 */
export async function EducationList({ items }: { items: EducationItem[] }) {
  const t = await getTranslations('education');
  const format = await getFormatter();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title={t('empty.title')}
        description={t('empty.description')}
      />
    );
  }

  return (
    <Stagger as="ul" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const start = format.dateTime(item.startDate, { year: 'numeric', month: 'short' });
        const end =
          item.endDate === null
            ? t('present')
            : format.dateTime(item.endDate, { year: 'numeric', month: 'short' });

        return (
          <StaggerItem as="li" key={item.id} className="h-full">
            <Card className="h-full gap-3 p-6">
              <span
                aria-hidden="true"
                className="bg-accent-soft text-accent-soft-foreground border-accent/20 grid size-11 place-items-center rounded-xl border"
              >
                <GraduationCap className="size-5" />
              </span>

              <div className="flex flex-col gap-1">
                <h3 className="text-h4 font-semibold">{item.degree}</h3>
                {item.field ? (
                  <p className="text-small text-muted-foreground">{item.field}</p>
                ) : null}
              </div>

              <p className="text-small text-subtle-foreground">
                {item.institution}
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                <span dir="ltr" className="tabular-nums">
                  {start} — {end}
                </span>
              </p>

              {item.description ? <Prose className="text-small">{item.description}</Prose> : null}
            </Card>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
