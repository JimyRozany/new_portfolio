import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Briefcase } from 'lucide-react';
import { Container, Section } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getServices } from '@/server/queries/portfolio';
import { ServiceCard } from '@/components/public/service-card';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services.meta' });

  return { title: t('title'), description: t('description') };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('services');
  const typedLocale = locale as Locale;

  // `activeOnly` defaults to true, so a service switched off in the dashboard
  // disappears from the site without any code change.
  const services = await getServices(typedLocale);

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

        {services.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={t('empty.title')}
            description={t('empty.description')}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            <Reveal offset="up" className="mt-12">
              <Button asChild size="lg">
                <Link href="/contact">{t('discuss')}</Link>
              </Button>
            </Reveal>
          </>
        )}
      </Container>
    </Section>
  );
}
