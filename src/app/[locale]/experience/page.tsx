import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container, Section } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { routing, type Locale } from '@/i18n/routing';
import { getEducations, getExperiences } from '@/server/queries/portfolio';
import { ExperienceTimeline } from '@/components/public/experience-timeline';
import { EducationList } from '@/components/public/education-list';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'experience.meta' });

  return { title: t('title'), description: t('description') };
}

export default async function ExperiencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('experience');
  const tEducation = await getTranslations('education');
  const typedLocale = locale as Locale;

  const [experiences, educations] = await Promise.all([
    getExperiences(typedLocale),
    getEducations(typedLocale),
  ]);

  return (
    <>
      <Section spacing="lg">
        <Container>
          <SectionHeading
            as="h1"
            className="mb-12"
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />

          <div className="max-w-3xl">
            <ExperienceTimeline items={experiences} />
          </div>
        </Container>
      </Section>

      {/* Education is a parallel list rather than part of the career rail, so
          it gets its own band instead of extending the timeline. */}
      <Section divided>
        <Container>
          <SectionHeading
            className="mb-10"
            eyebrow={tEducation('eyebrow')}
            title={tEducation('title')}
            description={tEducation('description')}
          />

          <EducationList items={educations} />
        </Container>
      </Section>
    </>
  );
}
