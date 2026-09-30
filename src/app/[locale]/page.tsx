import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/public/hero';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // Title/OG/canonical live in the locale layout; the home page only overrides
  // the description, which is the one field worth specialising per route.
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.hero' });
  return { description: t('subtitle') };
}

/**
 * Home page.
 *
 * Phase 1 ships the hero alone: it is the section that exercises the entire
 * design system (display type scale, motion, theme, RTL). The remaining
 * sections — about, skills, featured projects, experience, education, services,
 * testimonials, CTA and contact — are added in Phase 5 on top of the database
 * and service layer so their content is editable from the dashboard.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Hero />;
}
