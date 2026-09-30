import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Download, Gauge, ShieldCheck, Users, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import type { SiteSettings } from '@/server/queries/portfolio';

/**
 * Home page "about" band: the longer biography beside a grid of four
 * differentiators, with the résumé and projects calls to action.
 */
export async function HomeAbout({ settings }: { settings: SiteSettings }) {
  const t = await getTranslations('home.about');
  const tStats = await getTranslations('home.hero.stats');

  // Icon per highlight, declared here rather than stored in the database: these
  // four are part of the page's composition, not editable content.
  const highlights = [
    { key: 'fullStack', icon: Workflow },
    { key: 'performance', icon: Gauge },
    { key: 'quality', icon: ShieldCheck },
    { key: 'collaboration', icon: Users },
  ] as const;

  return (
    <Section id="about" divided>
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal offset="up" className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-4">
              <Fact label={t('locationLabel')} value={settings.location} />
              <Fact label={tStats('yearsExperience')} value={`${settings.yearsOfExperience}+`} />
              <Fact label={t('focusLabel')} value={t('focusValue')} />
            </dl>

            <div className="flex flex-wrap gap-3">
              {settings.resumePath ? (
                <Button asChild variant="outline">
                  <a href={settings.resumePath} download>
                    <Download className="size-4" aria-hidden="true" />
                    {t('downloadResume')}
                  </a>
                </Button>
              ) : null}

              <Button asChild variant="ghost">
                <Link href="/projects">
                  {t('viewProjects')}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            <h3 className="text-h4 font-semibold">{t('highlights.title')}</h3>

            <Stagger as="ul" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <StaggerItem as="li" key={highlight.key}>
                  <Card className="h-full gap-3 p-5">
                    <span
                      aria-hidden="true"
                      className="bg-accent-soft text-accent-soft-foreground border-accent/20 grid size-10 place-items-center rounded-lg border"
                    >
                      <highlight.icon className="size-4.5" />
                    </span>
                    <p className="text-small font-medium">{t(`highlights.${highlight.key}`)}</p>
                    <p className="text-caption text-muted-foreground">
                      {t(`highlights.${highlight.key}Description`)}
                    </p>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** A single label/value pair. Renders nothing when the value is unknown. */
function Fact({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;

  return (
    <div className="border-border bg-surface flex flex-col gap-1 rounded-lg border p-4">
      <dt className="text-caption text-subtle-foreground">{label}</dt>
      {/* `dir="ltr"` keeps a place name or a "2+ years" figure in natural
          order when the page is in Arabic. */}
      <dd dir="ltr" className="text-small text-start font-medium">
        {value}
      </dd>
    </div>
  );
}
