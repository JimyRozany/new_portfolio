import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AppProviders } from '@/components/providers/app-providers';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import './admin.css';

/**
 * Admin document shell.
 *
 * Mirrors the public `[locale]` layout but fixed to English and LTR: the
 * dashboard is an editing tool for one person, not a translated surface, and
 * letting the visitor's public-site language flip the admin into RTL would be
 * actively confusing.
 *
 * `NextIntlClientProvider` lives here rather than in `AppProviders` because the
 * provider needs an explicit locale and a message subset, and the public layout
 * already supplies its own.
 */
/**
 * Keep the dashboard out of search results.
 *
 * `robots.txt` already disallows `/admin`, but a crawler that ignores it can
 * still reach the login screen, and a login page in an index is a place to
 * collect automated credential-stuffing attempts. Set here at the layout so
 * every admin route inherits it.
 */
export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  /*
   * `/admin` has no locale segment for next-intl to read, so the locale is
   * pinned to the default rather than inferred. The same value is used for the
   * provider and the `<html lang>` so the two can never disagree.
   */
  const locale = routing.defaultLocale;
  const messages = await getMessages();

  // Only the namespaces the dashboard actually reads. Shipping the full
  // catalogue would put the public site's copy in the admin bundle for nothing.
  const subset = {
    common: messages.common,
    admin: messages.admin,
  };

  return (
    <html
      lang={locale}
      dir="ltr"
      suppressHydrationWarning
      className={fontVariables}
      data-theme-scope="admin"
      data-scroll-behavior="smooth"
    >
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <NextIntlClientProvider locale={locale} messages={subset}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
