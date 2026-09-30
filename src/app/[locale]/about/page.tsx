import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Download, MapPin, Sparkles, type LucideIcon } from 'lucide-react';
import { Container, Section } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getSiteSettings, getSkills } from '@/server/queries/portfolio';
import { SkillGrid } from '@/components/public/skill-grid';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.meta' });

  return { title: t('title'), description: t('description') };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const tHome = await getTranslations('home');
  const typedLocale = locale as Locale;

  // Both queries are cached per locale, so this page stays cheap to render.
  const [settings, skills] = await Promise.all([
    getSiteSettings(typedLocale),
    getSkills(typedLocale),
  ]);

  const philosophyKeys = ['understand', 'simple', 'measure', 'handover'] as const;

  return (
    <>
      <Section spacing="lg">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('summary')}
          />

          {/* Biography beside the "how I work" principles. */}
          <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
            <Reveal offset="up" className="flex flex-col gap-6">
              <p className="text-body-lg text-muted-foreground text-pretty">
                {tHome('about.description')}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {settings.location ? <Fact icon={MapPin}>{settings.location}</Fact> : null}
                <Fact icon={Sparkles}>
                  {tHome('about.experienceLabel')}: {settings.yearsOfExperience}+{' '}
                  {tHome('hero.stats.yearsExperience')}
                </Fact>
              </div>

              <div className="flex flex-wrap gap-3">
                {settings.resumePath ? (
                  <Button asChild variant="outline">
                    <a href={settings.resumePath} download>
                      <Download className="size-4" aria-hidden="true" />
                      {t('downloadResume')}
                    </a>
                  </Button>
                ) : null}

                <Button asChild>
                  <Link href="/contact">{t('contactMe')}</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal offset="up" delay={0.12}>
              <Card className="gap-5 p-6">
                <h2 className="text-h4 font-semibold">{t('philosophy.title')}</h2>
                <ul className="flex flex-col gap-4">
                  {philosophyKeys.map((key) => (
                    <li key={key} className="text-small text-muted-foreground flex gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-accent/60 mt-2 size-1.5 shrink-0 rounded-full"
                      />
                      {t(`philosophy.items.${key}`)}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Skills live here rather than behind their own route: the nav has six
          entries and a dedicated /skills page would be mostly whitespace. */}
      <Section divided aria-labelledby="skills-heading">
        <Container>
          <SectionHeading
            id="skills-heading"
            className="mb-12"
            eyebrow={tHome('skills.eyebrow')}
            title={tHome('skills.title')}
            description={tHome('skills.description')}
          />
          <SkillGrid skills={skills} />
        </Container>
      </Section>
    </>
  );
}

/** Small inline fact: an icon with a short piece of metadata. */
function Fact({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="border-border bg-surface text-muted-foreground text-caption inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}
