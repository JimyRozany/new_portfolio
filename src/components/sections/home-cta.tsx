import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container, Section } from '@/components/layout/container';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import type { SiteSettings } from '@/server/queries/portfolio';

/**
 * Closing call to action.
 *
 * The last thing a visitor reads, so it repeats the two actions that matter ---
 * get in touch, or download the résumé --- without inventing new copy.
 */
export async function HomeCta({ settings }: { settings: SiteSettings }) {
  const t = await getTranslations('home.cta');

  return (
    <Section id="contact" spacing="md">
      <Container>
        <Reveal offset="up">
          <div className="border-border bg-surface relative overflow-hidden rounded-2xl border p-8 sm:p-12">
            {/* Ambient wash behind the panel, anchored to the start edge so it
                mirrors in Arabic. */}
            <div
              aria-hidden="true"
              className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_100%_at_50%_0%,black,transparent)] opacity-60"
            />

            <div className="relative flex flex-col items-center gap-6 text-center">
              <h2 className="text-h2 max-w-2xl text-balance">{t('title')}</h2>
              <p className="text-body-lg text-muted-foreground max-w-xl text-pretty">
                {t('description')}
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/contact">
                    {t('primary')}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>

                {settings.resumePath ? (
                  <Button asChild variant="outline" size="lg">
                    <a href={settings.resumePath} download>
                      <Download className="size-4" aria-hidden="true" />
                      {t('secondary')}
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
