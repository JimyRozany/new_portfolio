import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import createMiddleware from 'next-intl/middleware';
import { authConfig } from '@/auth.config';
import { routing } from '@/i18n/routing';

const handleI18n = createMiddleware(routing);

/**
 * Auth.js session reader for the proxy.
 *
 * Built from `authConfig`, which is deliberately free of Prisma and bcrypt, so
 * the JWT can be decoded without loading the database layer into the edge
 * runtime. Credentials verification lives in `src/auth.ts` and only runs in the
 * Node request path.
 */
const { auth } = NextAuth(authConfig);

const LOGIN_PATH = '/admin/login';

/** Admin and API routes are locale-independent, so they bypass the i18n proxy. */
const BYPASS_PREFIXES = ['/api'];

/**
 * Matches a locale-prefixed admin URL such as `/ar/admin/login`.
 *
 * The dashboard deliberately lives *outside* the `[locale]` segment and is
 * English-only, so `/admin/login` is its one and only address. A path like
 * `/ar/admin/login` has no matching route and would 404, which reads as "the
 * page is broken" rather than "that URL is not a thing".
 */
const LOCALE_PREFIXED_ADMIN = new RegExp(`^/(?:${routing.locales.join('|')})(/admin(?:/.*)?)$`);

/**
 * Send a locale-prefixed admin URL to its canonical form.
 *
 * A 307 is used rather than a 308 so the redirect is never cached: a temporary
 * mis-typed URL should not stick in a browser or a proxy.
 */
function redirectToCanonicalAdmin(request: Parameters<typeof handleI18n>[0], rest: string) {
  const target = request.nextUrl.clone();
  target.pathname = rest;
  target.search = '';

  return NextResponse.redirect(target, 307);
}

/**
 * Redirect a visitor to the sign-in page, remembering where they were headed.
 *
 * `callbackUrl` is preserved so a deep link such as `/admin/settings/seo` is
 * restored after signing in instead of dumping the admin on the overview.
 */
function redirectToLogin(request: Parameters<typeof handleI18n>[0]) {
  const signInUrl = request.nextUrl.clone();
  signInUrl.pathname = LOGIN_PATH;
  signInUrl.search = '';
  signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);

  return NextResponse.redirect(signInUrl);
}

/**
 * Internationalisation proxy (Next.js 16 renamed `middleware` to `proxy`).
 *
 * Responsibilities:
 *  1. Guard `/admin`: anonymous visitors are sent to the sign-in page.
 *  2. Redirect `/` to the best matching locale (`/en` or `/ar`).
 *  3. Prefix every public URL with its locale so each language has a unique,
 *     indexable address.
 *  4. Persist the visitor's choice in a cookie for the next visit.
 *  5. Send a mis-typed locale-prefixed admin URL (`/ar/admin/login`) to its
 *     canonical form instead of returning a 404.
 *
 * Note on the `authorized` callback: because this proxy supplies its own
 * handler, Auth.js takes the `userMiddlewareOrRoute` branch and its
 * `!authorized` fallback never runs. A boolean returned from `authorized` would
 * therefore be silently ignored, so the check lives here, against the `auth`
 * property Auth.js attaches to the request. See `src/auth.config.ts`.
 *
 * This redirect is a convenience, not the security boundary. A proxy matcher can
 * bypassed by posting straight to a Server Action, so every admin screen also
 * calls `requireUser()` on its render path.
 */
export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const isSignedIn = Boolean(request.auth?.user);

    // Already signed in and sitting on the form? Go to the dashboard instead of
    // making the admin sign in again.
    if (isSignedIn && pathname === LOGIN_PATH) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin';
      dashboardUrl.search = '';

      return NextResponse.redirect(dashboardUrl);
    }

    if (!isSignedIn && pathname !== LOGIN_PATH) {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  }

  // `/ar/admin/login` is not a route --- the admin has no locale prefix. Point
  // it at the real URL rather than 404ing on a URL that looks plausible.
  const localePrefixedAdmin = LOCALE_PREFIXED_ADMIN.exec(pathname);

  if (localePrefixedAdmin) {
    return redirectToCanonicalAdmin(request, localePrefixedAdmin[1] ?? '/admin');
  }

  if (BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  return handleI18n(request);
});

export const config = {
  /**
   * Skip the proxy for:
   *  - Next.js internals and static assets
   *  - the public media library (uploaded files)
   *  - any path with a file extension, which covers `robots.txt` and
   *    `sitemap.xml` --- both are route handlers rather than pages, so they must
   *    not be locale-prefixed or wrapped in the site layout.
   */
  matcher: ['/((?!_next|_vercel|uploads|.*\\..*).*)'],
};
