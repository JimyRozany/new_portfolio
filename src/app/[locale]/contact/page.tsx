import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Container, Section } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { routing, type Locale } from '@/i18n/routing';
import { getSiteSettings, getSocialLinks } from '@/server/queries/portfolio';
import { ContactForm } from '@/components/public/contact-form';
import { SocialLinks } from '@/components/public/social-links';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact.meta' });

  return { title: t('title'), description: t('description') };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('contact');
  const typedLocale = locale as Locale;

  const [settings, socials] = await Promise.all([getSiteSettings(typedLocale), getSocialLinks()]);

  // Only render a detail row when the setting actually has a value; an empty
  // "Phone:" row looks like a bug.
  const details = [
    settings.email
      ? {
          icon: Mail,
          label: t('emailLabel'),
          value: settings.email,
          href: `mailto:${settings.email}`,
        }
      : null,
    settings.phone
      ? {
          icon: Phone,
          label: t('phoneLabel'),
          value: settings.phone,
          href: `tel:${settings.phone.replace(/\s+/g, '')}`,
        }
      : null,
    settings.location
      ? { icon: MapPin, label: t('locationLabel'), value: settings.location }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

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

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <Reveal offset="up" className="flex flex-col gap-8">
            {details.length > 0 ? (
              <Card className="gap-5 p-6">
                <h2 className="text-h4 font-semibold">{t('detailsTitle')}</h2>

                <dl className="flex flex-col gap-4">
                  {details.map((detail) => (
                    <div key={detail.label} className="flex flex-col gap-1">
                      <dt className="text-caption text-subtle-foreground flex items-center gap-2">
                        <detail.icon className="size-3.5 shrink-0" aria-hidden="true" />
                        {detail.label}
                      </dt>
                      <dd className="text-body ps-5.5">
                        {detail.href ? (
                          <a
                            href={detail.href}
                            className="hover:text-foreground text-muted-foreground focus-visible:outline-ring transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                          >
                            {/* `dir="ltr"` keeps an address or phone number in
                                its natural order inside the Arabic layout. */}
                            <span dir="ltr">{detail.value}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">{detail.value}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ) : null}

            {socials.length > 0 ? (
              <SocialLinks socials={socials} locale={typedLocale} title={t('socialTitle')} />
            ) : null}
          </Reveal>

          <Reveal offset="up" delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
