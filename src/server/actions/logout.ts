'use server';

import { signOut } from '@/auth';

/**
 * Sign out and return to the login page.
 *
 * `signOut` clears the session cookie and then throws `NEXT_REDIRECT`, which is
 * the documented way to redirect from a server action. The target is
 * root-relative so it is never locale-prefixed --- the dashboard lives outside
 * the `[locale]` segment.
 */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/login' });
}
