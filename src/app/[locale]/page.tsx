import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/public/hero';
import { HomeAbout } from '@/components/sections/home-about';
import { HomeCta } from '@/components/sections/home-cta';
import {
  HomeEducation,
  HomeExperience,
  HomeProjects,
  HomeServices,
  HomeSkills,
  HomeTestimonials,
} from '@/components/sections/home-sections';
import { routing, type Locale } from '@/i18n/routing';
import {
  getEducations,
  getExperiences,
  getProjects,
  getServices,
  getSiteSettings,
  getSkills,
  getTestimonials,
} from '@/server/queries/portfolio';

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
 * The hero is followed by one band per collection, all fed from the database so
 * the page is editable from the dashboard. Each band is fetched with a limit and
 * returns `null` when its collection is empty, so a brand new install renders a
 * clean, shorter page instead of a row of empty headings.
 *
 * The queries are issued together rather than awaited one at a time: they are
 * independent, cached per locale, and the database can serve them concurrently.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const typedLocale = locale as Locale;

  const [settings, skills, projects, experiences, educations, services, testimonials] =
    await Promise.all([
      getSiteSettings(typedLocale),
      getSkills(typedLocale),
      // Six featured-or-recent projects: enough to fill a three-column grid twice.
      getProjects(typedLocale, { limit: 6 }),
      getExperiences(typedLocale),
      getEducations(typedLocale),
      getServices(typedLocale),
      getTestimonials(typedLocale, { featuredOnly: true }),
    ]);

  return (
    <>
      <Hero />

      <HomeAbout settings={settings} />
      <HomeSkills skills={skills} />
      <HomeProjects projects={projects} />
      <HomeExperience experiences={experiences} />
      <HomeEducation educations={educations} />
      <HomeServices services={services} />
      <HomeTestimonials testimonials={testimonials} />
      <HomeCta settings={settings} />
    </>
  );
}
