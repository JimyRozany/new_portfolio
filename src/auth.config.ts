import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/generated/prisma/client';

/**
 * Edge-safe half of the Auth.js configuration.
 *
 * This file must not import anything Node-only --- no Prisma, no bcrypt --- so
 * the proxy can decode a session cookie without loading the database layer into
 * the edge runtime. The credentials provider, which needs `bcrypt` and Prisma,
 * lives in `auth.ts` and is added there on top of this base.
 *
 * Session strategy is **JWT** rather than database sessions, a deliberate
 * choice for a single-admin dashboard:
 *
 *  - A JWT is verified with no database round trip, so the proxy and every
 *    server component can check authorisation cheaply.
 *  - There is no `sessions` table to keep in sync, and signing out clears a
 *    cookie instead of leaving orphaned rows behind.
 *
 * The trade-off: a role change or password reset does not revoke a token that
 * has already been issued. The window is eight hours (see `maxAge`) and forced
 * revocation is not a requirement for this dashboard, so the simpler model
 * wins.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8, // 8 hours.
  },

  // The public site never signs in, so NextAuth's own sign-in page would be
  // dead weight; the dashboard supplies a styled one.
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  /**
   * Required outside Vercel, where there is no platform-provided host header.
   * Setting it here is safe because the dashboard sets an explicit `redirectTo`
   * on every sign-in rather than deriving the target from the request host.
   */
  trustHost: true,

  providers: [],

  callbacks: {
    /**
     * Intentionally **no** `authorized` callback here.
     *
     * `authorized` looks like the right place to guard `/admin`, but it does not
     * run when the proxy supplies its own handler: Auth.js takes the
     * `userMiddlewareOrRoute` branch and the `!authorized` redirect fallback is
     * skipped, so a `false` return would be silently ignored. The guard lives in
     * `src/proxy.ts` instead, checked against the `auth` property Auth.js puts
     * on the request.
     *
     * Two independent checks still protect the dashboard:
     *  - `src/proxy.ts` redirects anonymous visitors (a convenience, and it can
     *    be bypassed by posting straight to a Server Action).
     *  - `requireUser()` on every admin render path is the real boundary.
     */
  },
} satisfies NextAuthConfig;

/** Shape of the extra data this project puts on the token. */
export type AuthTokenExtras = {
  role: UserRole;
};
