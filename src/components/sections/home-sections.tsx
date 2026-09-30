import { getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container, Section } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Link } from '@/i18n/navigation';
import { ProjectCard } from '@/components/public/project-card';
import { SkillGrid } from '@/components/public/skill-grid';
import { ExperienceTimeline } from '@/components/public/experience-timeline';
import { EducationList } from '@/components/public/education-list';
import { ServiceCard } from '@/components/public/service-card';
import { TestimonialCard } from '@/components/public/testimonial-card';
import type {
  EducationItem,
  ExperienceItem,
  ProjectListItem,
  ServiceItem,
  SkillWithCategory,
  TestimonialItem,
} from '@/server/queries/portfolio';

/**
 * The data-driven bands of the home page.
 *
 * Grouped in one module because they share a single purpose --- surfacing the
 * same collections that have their own dedicated pages --- and because the home
 * page should read as one composition rather than a pile of imports. Each
 * section is a separate export so `page.tsx` controls the order and the
 * queries, and each one hides itself when its collection is empty: a "no
 * testimonials" heading above nothing is worse than no heading.
 *
 * Every list is capped so the home page stays a summary. The full collection is
 * always one click away on its own route.
 */

export async function HomeSkills({ skills }: { skills: SkillWithCategory[] }) {
  const t = await getTranslations('home.skills');
  if (skills.length === 0) return null;

  return (
    <Section id="skills" divided>
      <Container>
        <SectionHeading
          className="mb-12"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
        <SkillGrid skills={skills} />
      </Container>
    </Section>
  );
}

export async function HomeProjects({ projects }: { projects: ProjectListItem[] }) {
  const t = await getTranslations('home.projects');
  if (projects.length === 0) return null;

  return (
    <Section id="projects" divided>
      <Container>
        <SectionHeading
          className="mb-12"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/projects">
                {t('viewAll')}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} priority={index < 3} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export async function HomeExperience({ experiences }: { experiences: ExperienceItem[] }) {
  const t = await getTranslations('home.experience');
  if (experiences.length === 0) return null;

  return (
    <Section id="experience" divided>
      <Container>
        <SectionHeading
          className="mb-12"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/experience">
                {t('viewAll')}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />

        {/* Three entries is enough to show the shape of a career without
            turning the home page into the timeline page. */}
        <div className="max-w-3xl">
          <ExperienceTimeline items={experiences.slice(0, 3)} />
        </div>
      </Container>
    </Section>
  );
}

export async function HomeEducation({ educations }: { educations: EducationItem[] }) {
  const t = await getTranslations('home.education');
  if (educations.length === 0) return null;

  return (
    <Section id="education" divided>
      <Container>
        <SectionHeading className="mb-10" eyebrow={t('eyebrow')} title={t('title')} />
        <EducationList items={educations.slice(0, 2)} />
      </Container>
    </Section>
  );
}

export async function HomeServices({ services }: { services: ServiceItem[] }) {
  const t = await getTranslations('home.services');
  if (services.length === 0) return null;

  return (
    <Section id="services" divided>
      <Container>
        <SectionHeading
          className="mb-12"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {services.slice(0, 4).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export async function HomeTestimonials({ testimonials }: { testimonials: TestimonialItem[] }) {
  const t = await getTranslations('home.testimonials');
  if (testimonials.length === 0) return null;

  return (
    <Section id="testimonials" divided>
      <Container>
        <SectionHeading
          className="mb-12"
          align="center"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
