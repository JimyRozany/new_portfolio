'use client';

import { ArrowLeft, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Logo } from '@/components/shared/logo';
import { loginAction, type LoginState } from './actions';

const INITIAL: LoginState = {};

/**
 * Sign-in form.
 *
 * Built on `useActionState` so validation, rate limiting and the redirect all
 * run in one server round trip. Two details worth noting:
 *
 *  - The password field is a real `<input type="password">` with a visibility
 *    toggle, not a custom widget, so browser password managers and
 *    `autocomplete="current-password"` keep working.
 *  - The form is operable with JavaScript disabled: the action is a server
 *    action, so a plain submit still validates and signs in.
 */
export function LoginForm() {
  const t = useTranslations('admin.login');
  const tCommon = useTranslations('common');
  const [state, formAction] = useActionState(loginAction, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage = state.error ? t(`errors.${state.error}`) : null;

  return (
    <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="space-y-6">
          <Logo href="/en" label={tCommon('appName')} />

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{t('title')}</h1>
            <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
          </div>
        </div>

        {/* `role="alert"` so the message is announced when it appears, and
            `aria-live` is unnecessary because the node is inserted fresh. */}
        {errorMessage ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/8 text-destructive rounded-lg border px-4 py-3 text-sm"
          >
            {errorMessage}
          </p>
        ) : null}

        <form action={formAction} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              autoFocus
              placeholder={t('emailPlaceholder')}
              aria-invalid={state.fieldErrors?.email ? true : undefined}
              aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
            />
            {state.fieldErrors?.email ? (
              <p id="email-error" className="text-destructive text-xs">
                {t('errors.invalid')}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder={t('passwordPlaceholder')}
                className="pe-11"
                aria-invalid={state.fieldErrors?.password ? true : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                aria-pressed={showPassword}
                className="text-subtle-foreground hover:text-foreground focus-visible:outline-ring absolute inset-y-0 end-0 grid w-11 place-items-center transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <SubmitButton label={t('submit')} loadingLabel={t('submitting')} icon={LogIn} />
        </form>

        <Link
          href="/en"
          className="text-muted-foreground hover:text-foreground focus-visible:outline-ring inline-flex items-center gap-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          {t('backToSite')}
        </Link>
      </div>
    </div>
  );
}

/**
 * Submit button wired to the form's pending state.
 *
 * `useFormStatus` must live in its own component: it reads the enclosing
 * `<form>`'s status, which is not yet available inside the component that
 * renders the form.
 */
function SubmitButton({
  label,
  loadingLabel,
  icon: Icon,
}: {
  label: string;
  loadingLabel: string;
  icon: typeof LogIn;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="size-4" aria-hidden="true" />
      )}
      {pending ? loadingLabel : label}
    </Button>
  );
}
