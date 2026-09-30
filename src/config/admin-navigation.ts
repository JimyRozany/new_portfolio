import {
  Briefcase,
  FolderKanban,
  GraduationCap,
  Handshake,
  Images,
  LayoutDashboard,
  Mail,
  Palette,
  Quote,
  Search,
  Settings,
  Share2,
  Sparkles,
  UserCog,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Route } from 'next';

/**
 * Admin navigation model.
 *
 * Deliberately separate from `src/config/navigation.ts`, which describes the
 * *public* site: the dashboard is English-only, uses a flat pathname space
 * without a locale prefix, and has an entirely different information
 * architecture. Keeping them apart stops a public-site change from breaking the
 * dashboard sidebar and vice versa.
 */

export type AdminNavItem = {
  /** Path relative to `/admin`, e.g. `projects/new`. Empty for the index. */
  href: string;
  /** Key under the `admin.nav` message namespace. */
  labelKey: string;
  icon: LucideIcon;
  /** Show a count badge resolved on the server (e.g. unread messages). */
  badge?: 'unreadMessages';
};

export type AdminNavGroup = {
  /** Key under the `admin.nav` namespace, or `undefined` for an unlabelled group. */
  labelKey?: string;
  items: AdminNavItem[];
};

export type AdminNavigation = {
  brand: { name: string; short: string };
  groups: AdminNavGroup[];
};

/**
 * Annotated (not `satisfies`) on purpose.
 *
 * `satisfies` preserves the literal shape of each object, which turns the item
 * list into a discriminated union where `badge` only exists on some members and
 * every read needs a narrowing check. An explicit annotation widens `badge` to
 * `badge?: 'unreadMessages'` across all items, which is what the sidebar wants.
 */
export const adminNavigation: AdminNavigation = {
  brand: {
    name: 'Dashboard',
    /** Monogram shown in the collapsed sidebar. */
    short: 'MG',
  },

  groups: [
    {
      items: [{ href: '', labelKey: 'dashboard', icon: LayoutDashboard }],
    },
    {
      labelKey: 'content',
      items: [
        { href: 'projects', labelKey: 'projects', icon: FolderKanban },
        { href: 'skills', labelKey: 'skills', icon: Sparkles },
        { href: 'experience', labelKey: 'experience', icon: Briefcase },
        { href: 'education', labelKey: 'education', icon: GraduationCap },
        { href: 'services', labelKey: 'services', icon: Handshake },
        { href: 'testimonials', labelKey: 'testimonials', icon: Quote },
        { href: 'social-links', labelKey: 'socialLinks', icon: Share2 },
      ],
    },
    {
      items: [{ href: 'messages', labelKey: 'messages', icon: Mail, badge: 'unreadMessages' }],
    },
    {
      items: [{ href: 'media', labelKey: 'media', icon: Images }],
    },
    {
      labelKey: 'settings',
      items: [
        { href: 'settings', labelKey: 'general', icon: Settings },
        { href: 'settings/seo', labelKey: 'seo', icon: Search },
        { href: 'settings/appearance', labelKey: 'appearance', icon: Palette },
        { href: 'account', labelKey: 'account', icon: UserCog },
      ],
    },
  ],
};

/**
 * Absolute href for a nav item, so `href === ''` resolves to `/admin`.
 *
 * Returns `Route` rather than `string`. Next.js validates literal `href`s but
 * cannot validate one built at runtime, so this helper is the single place where
 * that cast lives --- every caller then gets type safety from one seam instead
 * of a cast per call site.
 */
export const adminHref = (href: string): Route => (href ? `/admin/${href}` : '/admin') as Route;
