import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import type { SkillWithCategory } from '@/server/queries/portfolio';

/**
 * Skills grid, grouped by category.
 *
 * Levels are rendered with the shared `Progress` component, which already
 * carries the `role="progressbar"` semantics, and the percentage is also
 * printed in text. A bar alone is a visual-only channel; a screen reader needs
 * the number spelled out, so both are present. Category names come from the
 * database, so the grid follows the CMS rather than a hard-coded list.
 */
export function SkillGrid({ skills }: { skills: SkillWithCategory[] }) {
  const t = useTranslations('skills');

  if (skills.length === 0) {
    return <p className="text-body text-muted-foreground">{t('empty')}</p>;
  }

  // `Map` keeps insertion order, so categories render in the curated order the
  // query returned rather than an arbitrary one.
  const groups = skills.reduce<Map<string, SkillWithCategory[]>>((accumulator, skill) => {
    // `categoryId` is nullable, so an uncategorised skill needs a label too.
    const name = skill.category?.name ?? t('uncategorised');
    const list = accumulator.get(name) ?? [];
    list.push(skill);
    accumulator.set(name, list);
    return accumulator;
  }, new Map());

  return (
    <div className="flex flex-col gap-10">
      {[...groups].map(([category, items], categoryIndex) => (
        <section key={category} className="flex flex-col gap-5">
          <h3 className="text-h4 flex items-center gap-3 font-semibold">
            <span aria-hidden="true" className="bg-accent/60 h-px w-6" />
            {category}
            <span className="text-caption text-subtle-foreground font-normal">{items.length}</span>
          </h3>

          <Stagger
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            delay={categoryIndex * 0.04}
          >
            {items.map((skill) => (
              <StaggerItem key={skill.id}>
                <Card className="h-full gap-3 p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-body font-medium">{skill.name}</span>
                    {/* `dir="ltr"` + tabular figures: a percentage must not be
                        reordered or jitter when the page is in Arabic. */}
                    {skill.level !== null ? (
                      <span dir="ltr" className="text-caption text-subtle-foreground tabular-nums">
                        {skill.level}%
                      </span>
                    ) : null}
                  </div>

                  {/* A skill with no self-assessed level shows the name only,
                      rather than a bar that implies a false zero. */}
                  {skill.level !== null ? (
                    <Progress value={skill.level} label={`${skill.name} — ${t('levelLabel')}`} />
                  ) : null}
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ))}
    </div>
  );
}

/** Small helper so the "no category" case is a component, not an inline string. */
export function CategoryHeading({ children }: { children: React.ReactNode }) {
  return (
    <Reveal offset="up" className="text-h3 flex items-center gap-3 font-semibold">
      <span aria-hidden="true" className="bg-accent/60 h-px w-6" />
      {children}
    </Reveal>
  );
}
