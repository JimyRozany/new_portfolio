'use client';

import { CheckCircle2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import {
  submitContactAction,
  type ContactField,
  type ContactState,
} from '@/app/[locale]/contact/actions';
import { CONTACT_LIMITS } from '@/config/contact';

/**
 * Public contact form.
 *
 * Built on `useActionState` so the four states the spec asks for --- idle,
 * submitting, success, error --- all come from the action's return value rather
 * than from a pile of booleans. Validation messages arrive as codes and are
 * resolved against the message catalogue here, which is what keeps the copy
 * translatable.
 *
 * `noValidate` on the form: the browser's own bubbles are replaced by
 * inline, translated errors that stay put instead of disappearing on scroll.
 */
export function ContactForm() {
  const t = useTranslations('contact.form');
  const [state, formAction, pending] = useActionState<ContactState, FormData>(submitContactAction, {
    status: 'idle',
  });

  const formRef = useRef<HTMLFormElement>(null);
  // Stable, unique ids so every label is bound to its input.
  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();

  // "Send another" needs to get from the success panel back to an empty form.
  // `useActionState` has no reset, so the form is remounted with a new key and
  // the panel is suppressed locally. Reloading the page would be a poor trade
  // for something the visitor may do several times.
  const [restarted, setRestarted] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // On success the fields are cleared, so move focus to the confirmation.
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === 'success') successRef.current?.focus();
  }, [state.status]);

  if (state.status === 'success' && !restarted) {
    return (
      <Card className="items-center gap-4 p-8 text-center">
        <span
          aria-hidden="true"
          className="bg-success-soft text-success grid size-14 place-items-center rounded-full"
        >
          <CheckCircle2 className="size-7" />
        </span>

        <div
          ref={successRef}
          tabIndex={-1}
          className="flex flex-col gap-2 focus-visible:outline-none"
        >
          <p className="text-h3 font-semibold">{t('success.title')}</p>
          <p className="text-small text-muted-foreground">{t('success.description')}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setRestarted(true);
            setFormKey((key) => key + 1);
          }}
        >
          {t('success.sendAnother')}
        </Button>
      </Card>
    );
  }

  const formError = state.error ? t(`errors.${state.error}`) : null;

  return (
    <Card className="gap-6 p-6 sm:p-8">
      <h2 className="text-h3 font-semibold">{t('title')}</h2>

      <form
        key={formKey}
        ref={formRef}
        action={formAction}
        noValidate
        className="flex flex-col gap-5"
      >
        {/* Honeypot. `aria-hidden` + `tabIndex={-1}` keep it out of the
            accessibility tree and the tab order, so it is invisible to everyone
            except an automated submitter. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            id={nameId}
            name="name"
            label={t('name')}
            error={fieldError(state, 'name', t)}
            defaultValue={state.values?.name}
          >
            {(props) => (
              <Input
                {...props}
                type="text"
                name="name"
                autoComplete="name"
                placeholder={t('namePlaceholder')}
                required
              />
            )}
          </Field>

          <Field
            id={emailId}
            name="email"
            label={t('email')}
            error={fieldError(state, 'email', t)}
            defaultValue={state.values?.email}
          >
            {(props) => (
              <Input
                {...props}
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
                required
              />
            )}
          </Field>
        </div>

        <Field
          id={subjectId}
          name="subject"
          label={t('subject')}
          error={fieldError(state, 'subject', t)}
          defaultValue={state.values?.subject}
        >
          {(props) => (
            <Input
              {...props}
              type="text"
              name="subject"
              placeholder={t('subjectPlaceholder')}
              required
            />
          )}
        </Field>

        <Field
          id={messageId}
          name="message"
          label={t('message')}
          error={fieldError(state, 'message', t)}
          defaultValue={state.values?.message}
        >
          {(props) => (
            <textarea
              {...props}
              name="message"
              rows={6}
              maxLength={CONTACT_LIMITS.messageMax}
              placeholder={t('messagePlaceholder')}
              required
              className={cn(
                'border-input bg-surface text-foreground placeholder:text-subtle-foreground text-body w-full rounded-lg border px-4 py-3',
                'focus-visible:ring-ring/25 focus-visible:border-foreground/40 focus-visible:ring-[3px] focus-visible:outline-none',
                'aria-invalid:ring-danger/20 aria-invalid:border-danger aria-invalid:ring-[3px]',
                'resize-y',
              )}
            />
          )}
        </Field>

        {/* `role="alert"` makes a failure announced immediately, not queued
            behind other page updates. */}
        {formError ? (
          <p
            role="alert"
            className="border-danger/30 bg-danger-soft text-danger text-small rounded-lg border px-4 py-3"
          >
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={pending} className="w-full sm:w-fit">
            <Send className="size-4" aria-hidden="true" />
            {pending ? t('submitting') : t('submit')}
          </Button>

          <p className="text-caption text-subtle-foreground">{t('privacyNote')}</p>
        </div>
      </form>
    </Card>
  );
}

/**
 * One labelled control with its error message.
 *
 * The child is a render function so the caller owns the input element (textarea
 * and input need different props) while the label, error and `aria` wiring stay
 * in one place. `aria-describedby` points at the error only when there is one,
 * so a screen reader is not sent to an empty element.
 */
function Field({
  id,
  name,
  label,
  error,
  defaultValue,
  children,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  defaultValue?: string;
  children: (props: {
    id: string;
    name: string;
    'aria-invalid': boolean | undefined;
    'aria-describedby': string | undefined;
    defaultValue?: string;
  }) => React.ReactNode;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-medium">
        {label}
      </label>

      {children({
        id,
        name,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
        defaultValue,
      })}

      {error ? (
        <p id={errorId} className="text-danger text-caption">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Resolve a field error code to translated text. */
function fieldError(
  state: ContactState,
  field: ContactField,
  t: (key: string, values?: Record<string, string | number>) => string,
): string | undefined {
  const code = state.fieldErrors?.[field];
  if (!code) return undefined;

  // The two length errors need their limits interpolated.
  if (code === 'messageMax') {
    return t('errors.messageMax', { max: CONTACT_LIMITS.messageMax });
  }

  if (code === 'nameMin') return t('errors.nameMin', { min: CONTACT_LIMITS.name });
  if (code === 'subjectMin') return t('errors.subjectMin', { min: CONTACT_LIMITS.subject });
  if (code === 'messageMin') return t('errors.messageMin', { min: CONTACT_LIMITS.message });

  return t(`errors.${code}`);
}
