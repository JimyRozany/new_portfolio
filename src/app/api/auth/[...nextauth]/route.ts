import { handlers } from '@/auth';

/**
 * Auth.js route handler, mounted at `/api/auth/*`.
 *
 * NextAuth owns sign-in, the CSRF token, the session callback and sign-out, so
 * the dashboard never implements any of that itself.
 */
export const { GET, POST } = handlers;
