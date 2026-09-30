import type { LucideIcon } from 'lucide-react';
import type { Locale } from '@/i18n/routing';

/**
 * A single navigation entry.
 *
 * `href` is a locale-less pathname (next-intl's `Link` adds the prefix), and
 * `labelKey` points at a message namespace so no copy is hardcoded here.
 */
export type NavItem = {
  href: string;
  labelKey: string;
  icon?: LucideIcon;
};

export const mainNav: NavItem[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/projects', labelKey: 'nav.projects' },
  { href: '/experience', labelKey: 'nav.experience' },
  { href: '/services', labelKey: 'nav.services' },
  { href: '/contact', labelKey: 'nav.contact' },
];

/** Anchors on the home page itself (used by the "jump to section" CTA row). */
export const homeSectionNav: NavItem[] = [
  { href: '/#about', labelKey: 'nav.about' },
  { href: '/#projects', labelKey: 'nav.projects' },
  { href: '/#experience', labelKey: 'nav.experience' },
  { href: '/#services', labelKey: 'nav.services' },
  { href: '/#contact', labelKey: 'nav.contact' },
];

/** Ordered list of routes for the footer sitemap. */
export const footerNav: NavItem[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/projects', labelKey: 'nav.projects' },
  { href: '/experience', labelKey: 'nav.experience' },
  { href: '/services', labelKey: 'nav.services' },
  { href: '/contact', labelKey: 'nav.contact' },
];

/** Locale-aware social profile links used in the hero, footer and contact page. */
export const socialProfiles: { platform: string; url: string }[] = [
  { platform: 'github', url: 'https://github.com/JimyRozany' },
  { platform: 'linkedin', url: 'https://linkedin.com/in/rozny' },
];

/** Accessible label prefix so each social link is unique in the a11y tree. */
export const socialLabels: Record<string, Record<Locale, string>> = {
  github: { en: 'GitHub', ar: 'جيت هاب' },
  linkedin: { en: 'LinkedIn', ar: 'لينكد إن' },
  facebook: { en: 'Facebook', ar: 'فيسبوك' },
  x: { en: 'X', ar: 'إكس' },
  instagram: { en: 'Instagram', ar: 'إنستجرام' },
  youtube: { en: 'YouTube', ar: 'يوتيوب' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب' },
  telegram: { en: 'Telegram', ar: 'تيليجرام' },
  dribbble: { en: 'Dribbble', ar: 'دريبل' },
  behance: { en: 'Behance', ar: 'بيهانس' },
};
