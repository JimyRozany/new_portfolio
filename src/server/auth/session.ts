import 'server-only';

import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/auth';
import type { UserRole } from '@/generated/prisma/client';

export type SessionUser = {
  id: number;
  name: string | null;
  email: string;
  role: UserRole;
};

/**
 * Read the current session user, or `null` when signed out.
 *
 * Wrapped in React's `cache` so a page, its layout and several server
 * components that all ask "who is this?" resolve the session once per request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !user.email) return null;

  const id = Number(user.id);

  // A non-numeric id means the token did not come from `authorize`, so the
  // session cannot be trusted.
  if (!Number.isInteger(id)) return null;

  return { id, name: user.name ?? null, email: user.email, role: user.role };
});

/**
 * Require an authenticated admin.
 *
 * Call this at the top of every admin server component. The Auth.js
 * `authorized` callback already redirects anonymous visitors, but a layout
 * guard is the part that actually protects the data: the proxy can be bypassed
 * by posting directly to a Server Action, whereas this runs on the render path.
 */
export const requireUser = async (): Promise<SessionUser> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin/login' as Route);
  }

  return user;
};

/** Require one of the given roles, redirecting to the dashboard otherwise. */
export const requireRole = async (...allowed: readonly UserRole[]): Promise<SessionUser> => {
  const user = await requireUser();

  if (!allowed.includes(user.role)) {
    redirect('/admin' as Route);
  }

  return user;
};

/** True when the user may mutate content. Both roles can; kept explicit for clarity. */
export const canEdit = (user: SessionUser | null): boolean =>
  user?.role === 'ADMIN' || user?.role === 'EDITOR';
