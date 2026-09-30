import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { AppProviders } from '@/components/providers/app-providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { siteConfig } from '@/config/site';
import { getDirection } from '@/i18n/direction';
import { routing, type Locale } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import '../globals.css';

/**
 * Pre-render both locales at build time instead of streaming them on demand.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Theme-aware viewport colours so mobile browser chrome matches the site. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a19' },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const homeMeta = await getTranslations({ locale, namespace: 'metadata.home' });
  const translateKeywords = await getTranslations({ locale, namespace: 'metadata' });
  const keywords: string[] = translateKeywords('keywords')
    .split(',')
    .map((k) => k.trim());
  return {
    title: homeMeta('title'),
    description: homeMeta('description'),
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    keywords,
    alternates: {
      canonical: `${siteConfig.url}/${locale}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((code) => [code, `${siteConfig.url}/${code}`])),
        'x-default': `${siteConfig.url}/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: homeMeta('title'),
      description: homeMeta('description'),
      url: `${siteConfig.url}/${locale}`,
      locale: locale === 'ar' ? 'ar_EG' : 'en_GB',
      alternateLocale: locale === 'ar' ? 'en_GB' : 'ar_EG',
    },
    twitter: {
      card: 'summary_large_image',
      title: homeMeta('title'),
      description: homeMeta('description'),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

/**
 * Public site document shell.
 *
 * `<html lang dir>` come from the active locale, so RTL is a real browser-level
 * direction (caret behaviour, screen-reader voice, text selection) rather than
 * a CSS approximation. The admin area lives outside this segment because it is
 * language-independent.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale as Locale);

  return (
    <html
      lang={locale}
      dir={getDirection(locale as Locale)}
      suppressHydrationWarning
      className={fontVariables}
      // Tells Next.js the document scrolls smoothly, so it can use an instant
      // scroll during route transitions (the correct behaviour when jumping to
      // the top of a new page) while leaving in-page anchor scrolling smooth.
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <AppProviders>
            <TooltipProvider>
              <ScrollProgress />
              <div id="top" /> <Navbar />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />{' '}
            </TooltipProvider>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
