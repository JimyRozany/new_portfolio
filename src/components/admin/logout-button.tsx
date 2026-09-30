'use client';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/server/actions/logout';

/**
 * Sign-out control.
 *
 * A `<form>` posting to a server action rather than a `signIn`-style client
 * call, so signing out works with JavaScript disabled and the session cookie is
 * cleared server-side rather than being masked on the client.
 */
export function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  const t = useTranslations('admin.nav');

  return (
    <form action={logoutAction} className="w-full">
      <Button
        type="submit"
        variant="ghost"
        size={collapsed ? 'icon' : 'sm'}
        className={collapsed ? 'w-full' : 'text-muted-foreground w-full justify-start gap-3'}
        aria-label={t('signOut')}
      >
        <LogOut className="size-4 shrink-0" aria-hidden="true" />
        {collapsed ? null : <span>{t('signOut')}</span>}
        <PendingIndicator />
      </Button>
    </form>
  );
}

function PendingIndicator() {
  const { pending } = useFormStatus();

  return pending ? (
    <span
      aria-hidden="true"
      className="ms-auto size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  ) : null;
}
