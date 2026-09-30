import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const handleI18n = createMiddleware(routing);

/** Admin and API routes are locale-independent, so they bypass the i18n middleware. */
const BYPASS_PREFIXES = ['/admin', '/api'];

/**
 * Internationalisation proxy (Next.js 16 renamed `middleware` to `proxy`).
 *
 * Responsibilities:
 *  1. Redirect `/` to the best matching locale (`/en` or `/ar`).
 *  2. Prefix every public URL with its locale so each language has a unique,
 *     indexable address.
 *  3. Persist the visitor's choice in a cookie for the next visit.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  return handleI18n(request);
}

export const config = {
  /**
   * Skip middleware for:
   *  - Next.js internals and static assets
   *  - the public media library (uploaded files)
   *  - `robots.txt` / `sitemap.xml` which are generated per-locale by the app
   */
  matcher: ['/((?!_next|_vercel|uploads|.*\\..*).*)'],
};
