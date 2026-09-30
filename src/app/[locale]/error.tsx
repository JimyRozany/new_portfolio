'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';

/**
 * Route-level error boundary.
 *
 * Only ever shows a friendly message — the raw error (and therefore any
 * database detail or stack trace) stays in the server log, never in the DOM.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.generic');
  const tCommon = useTranslations('common');

  useEffect(() => {
    // Surfaced in the platform's log (Vercel/hosting) rather than the UI.
    console.error('[app] unhandled route error:', error);
  }, [error]);

  return (
    <Container className="flex min-h-[70dvh] flex-col items-center justify-center py-24 text-center">
      <Logo className="mb-10 opacity-70" />

      <p className="text-caption text-danger-foreground font-mono tracking-[0.3em] uppercase">
        {t('code')}
      </p>
      <h1 className="text-display-sm mt-4">{t('title')}</h1>
      <p className="text-body-lg text-muted-foreground mt-5 max-w-md">{t('description')}</p>

      <Button onClick={reset} size="lg" className="mt-10">
        <RotateCcw className="size-4" aria-hidden="true" />
        {tCommon('retry')}
      </Button>
    </Container>
  );
}
