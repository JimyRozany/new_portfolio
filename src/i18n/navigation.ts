import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware replacements for the Next.js navigation primitives.
 *
 * Always import `Link`, `redirect`, `usePathname`, `useRouter` and `getPathname`
 * from here — never from `next/link` / `next/navigation` — otherwise the active
 * locale prefix is dropped and the visitor is silently redirected to the
 * default language.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
