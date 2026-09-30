'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowUp } from 'lucide-react';
import { footerNav, socialLabels } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { localeTags, type Locale } from '@/i18n/routing';
import { Container } from '@/components/layout/container';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Logo } from '@/components/shared/logo';
import { getSocialIcon } from '@/components/shared/social-icon';
import { Separator } from '@/components/ui/separator';
import { toArabicDigits } from '@/lib/utils/format';

export type FooterSocialLink = { platform: string; url: string };

/**
 * Site footer.
 *
 * Renders navigation, contact details and social links. The social list is a
 * prop so the database-backed version can be passed in from Phase 5 onwards
 * without changing this component; until then the caller falls back to
 * `siteConfig.social`.
 */
export function Footer({ socialLinks }: { socialLinks?: FooterSocialLink[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const links: FooterSocialLink[] =
    socialLinks ??
    (Object.entries(siteConfig.social) as [string, string][]).map(([platform, url]) => ({
      platform,
      url,
    }));

  const currentYear = new Date().getFullYear();
  const year = locale === 'ar' ? toArabicDigits(String(currentYear)) : String(currentYear);

  return (
    <footer className="border-border bg-surface-2/40 relative mt-auto border-t">
      <Container>
        <div className="grid gap-12 py-16 sm:py-20 md:grid-cols-12">
          {/* Brand + short pitch */}
          <div className="md:col-span-5">
            <Link href="/" aria-label={t('common.appName')}>
              <Logo name={t('common.appName')} />
            </Link>
            <p className="text-small text-muted-foreground mt-5 max-w-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-body decoration-accent hover:text-accent-foreground mt-6 inline-block font-medium underline underline-offset-4 transition-colors"
              dir="ltr"
            >
              {siteConfig.contact.email}
            </a>
          </div>

          {/* Navigation */}
          <nav aria-label={t('footer.navigation')} className="md:col-span-3">
            <h2 className="text-caption text-subtle-foreground font-medium tracking-wider uppercase">
              {t('footer.navigation')}
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-small text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social */}
          <div className="md:col-span-4">
            <h2 className="text-caption text-subtle-foreground font-medium tracking-wider uppercase">
              {t('footer.connect')}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {links.map((link) => {
                const Icon = getSocialIcon(link.platform);
                const label = socialLabels[link.platform]?.[locale] ?? link.platform;
                return (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={label}
                      className="border-border bg-surface text-muted-foreground hover:border-foreground hover:text-foreground grid size-11 place-items-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      {Icon ? <Icon className="size-4.5" aria-hidden="true" /> : null}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <LanguageSwitcher />
              <a
                href="#top"
                className="border-border bg-surface text-small text-muted-foreground hover:text-foreground inline-flex h-10 items-center gap-2 rounded-full border px-4 transition-colors duration-200"
              >
                {t('footer.backToTop')}
                <ArrowUp className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <Separator />

        <div className="text-caption text-subtle-foreground flex flex-col items-center justify-between gap-4 py-7 sm:flex-row">
          <p>{t('footer.copyright', { year, name: t('common.appName') })}</p>
          <p className="font-mono" dir="ltr">
            {localeTags[locale]}
          </p>
        </div>
      </Container>
    </footer>
  );
}
