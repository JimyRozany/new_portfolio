import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { AdminShell } from '@/components/admin/shell';
import { requireUser } from '@/server/auth/session';
import { getUnreadMessageCount } from '@/server/queries/admin';

/**
 * Guarded dashboard shell.
 *
 * The Auth.js `authorized` callback in `auth.config.ts` already bounces
 * anonymous visitors to `/admin/login`, but this layout is the part that
 * actually protects the data: a proxy matcher can be bypassed by posting
 * straight to a Server Action, whereas every admin screen renders through here
 * and calls `requireUser()` first.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Sidebar badges need a count on every navigation, so it is resolved once
  // here and passed down rather than fetched per nav item.
  const unreadMessages = await getUnreadMessageCount();

  if (!user) redirect('/admin/login' as Route);

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role }}
      unreadMessages={unreadMessages}
    >
      {children}
    </AdminShell>
  );
}
