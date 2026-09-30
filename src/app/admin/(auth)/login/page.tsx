import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './login-form';

/**
 * Admin sign-in page.
 *
 * The dashboard is English-only, so it deliberately sits outside the `[locale]`
 * segment and resolves its own `admin.*` messages. That keeps the admin chrome
 * stable regardless of the visitor's public-site language.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.login');

  return {
    title: t('title'),
    // Belt and braces alongside the `robots` default in `admin/layout.tsx`: the
    // sign-in page must never appear in a search index.
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function LoginPage() {
  const t = await getTranslations('admin.login');

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <LoginForm />

      {/* Editorial panel. Hidden below `lg`, where it would only push the form
          below the fold on a phone. */}
      <aside className="border-border bg-surface-2 relative hidden overflow-hidden border-s lg:block">
        <div
          aria-hidden="true"
          className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-60"
        />
        <div
          aria-hidden="true"
          className="bg-accent/12 absolute -top-24 -right-24 size-[28rem] rounded-full blur-3xl"
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            {t('aside.eyebrow')}
          </p>

          <div className="max-w-md space-y-6">
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance">
              {t('aside.headline')}
            </h2>
            <p className="text-muted-foreground">{t('aside.body')}</p>
          </div>
        </div>
      </aside>
    </main>
  );
}
