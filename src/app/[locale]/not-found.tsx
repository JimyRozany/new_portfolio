import { useTranslations } from 'next-intl';
import { Compass } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';

/**
 * 404 page.
 *
 * Presented as a first-class part of the design system instead of a browser
 * default: it keeps the navigation, theme switcher and footer, and offers both
 * "back home" and "browse projects" so a visitor is never stranded.
 */
export default function NotFound() {
  const t = useTranslations('errors.notFound');
  const tNav = useTranslations('nav');
  const tErrors = useTranslations('errors');

  return (
    <Container className="flex min-h-[70dvh] flex-col items-center justify-center py-24 text-center">
      <Logo className="mb-10 opacity-70" />

      <p className="text-caption text-accent-foreground font-mono tracking-[0.3em] uppercase">
        {t('code')}
      </p>
      <h1 className="text-display-sm mt-4">{t('title')}</h1>
      <p className="text-body-lg text-muted-foreground mt-5 max-w-md">{t('description')}</p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">{tErrors('backHome')}</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/projects">
            <Compass className="size-4" aria-hidden="true" />
            {tNav('projects')}
          </Link>
        </Button>
      </div>
    </Container>
  );
}
