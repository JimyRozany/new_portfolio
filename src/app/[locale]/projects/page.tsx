import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container, Section } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { routing, type Locale } from '@/i18n/routing';
import { getProjectCategories, getProjects } from '@/server/queries/portfolio';
import { ProjectBrowser } from '@/components/public/project-browser';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects.meta' });

  return { title: t('title'), description: t('description') };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('projects');
  const typedLocale = locale as Locale;

  // Both queries are cached; categories are locale-independent, projects are not.
  const [projects, categories] = await Promise.all([
    getProjects(typedLocale),
    getProjectCategories(),
  ]);

  return (
    <Section spacing="lg">
      <Container>
        <SectionHeading
          as="h1"
          className="mb-12"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        {/*
          The browser is a client component so filtering stays instant. The whole
          published set is passed to it rather than filtered per-request: at this
          scale the payload is smaller than the round trip it would replace.
        */}
        <ProjectBrowser projects={projects} categories={categories} />
      </Container>
    </Section>
  );
}
