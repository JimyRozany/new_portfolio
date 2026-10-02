'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FieldError, FieldHint, Input, Label } from '@/components/ui/input';
import type { SkillCategoryFormState } from '@/app/admin/(dashboard)/skills/actions';

/**
 * Inline add/rename form for skill categories.
 *
 * Categories are edited in place on the list page rather than on their own
 * screens: there are a handful of them, they are two words each, and a full
 * page per category would cost more navigation than it saves.
 *
 * Both languages are required, unlike a skill name. A category is editorial prose
 * the reader meets in their own language, so a half-translated group heading is
 * worse than no category at all.
 */
export function SkillCategoryForm({
  mode,
  action,
  defaultNameEn = '',
  defaultNameAr = '',
  defaultSortOrder = 0,
  onCancel,
}: {
  mode: 'create' | 'edit';
  action: (state: SkillCategoryFormState, formData: FormData) => Promise<SkillCategoryFormState>;
  defaultNameEn?: string;
  defaultNameAr?: string;
  defaultSortOrder?: number;
  /** Cancel button, shown only in edit mode where there is a row to go back to. */
  onCancel?: () => void;
}) {
  const t = useTranslations('admin.skills');
  const tForm = useTranslations('admin.form');
  const tErrors = useTranslations('admin.errors');

  const [state, formAction] = useActionState(action, null);

  /**
   * Read once on mount from the echoed values: React will not reset an
   * uncontrolled input when the action's state changes, and re-seeding on every
   * render would fight the owner mid-edit.
   */
  const [seed] = useState<Record<string, string> | null>(state?.values ?? null);

  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];

  return (
    <form
      action={formAction}
      className="border-border bg-surface-2 flex flex-col gap-3 rounded-xl border p-4"
    >
      {state?.status === 'success' ? (
        <p role="status" className="text-small text-success">
          {tForm('saved')}
        </p>
      ) : null}
      {state?.status === 'error' && state.messageKey ? (
        <p role="status" className="text-small text-danger">
          {tErrors(state.messageKey)}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field id="nameEn" label={t('categoryNameEn')} error={errorFor('nameEn')} required>
          {(props) => (
            <Input
              {...props}
              dir="ltr"
              defaultValue={seed?.nameEn ?? defaultNameEn}
              placeholder="Backend"
              maxLength={120}
            />
          )}
        </Field>

        <Field id="nameAr" label={t('categoryNameAr')} error={errorFor('nameAr')} required>
          {(props) => (
            <Input
              {...props}
              dir="rtl"
              defaultValue={seed?.nameAr ?? defaultNameAr}
              placeholder="الخلفية"
              maxLength={120}
            />
          )}
        </Field>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Field id="sortOrder" label={tForm('sortOrder')} hint={tForm('sortOrderHint')}>
          {(props) => (
            <Input
              {...props}
              type="number"
              min={0}
              max={9999}
              defaultValue={seed?.sortOrder ?? String(defaultSortOrder)}
              className="w-24"
            />
          )}
        </Field>

        <div className="flex items-center gap-2">
          {onCancel ? (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {tForm('cancel')}
            </Button>
          ) : null}
          <SubmitButton label={mode === 'create' ? tForm('add') : tForm('save')} />
        </div>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    name: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  }) => React.ReactNode;
}) {
  const tErrors = useTranslations('admin.errors');
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-danger ms-1">*</span> : null}
      </Label>
      {children({
        id,
        name: id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy || undefined,
      })}
      {hint ? <FieldHint id={`${id}-hint`}>{hint}</FieldHint> : null}
      {error ? (
        <FieldError id={`${id}-error`}>
          {tErrors(error as Parameters<typeof tErrors>[0])}
        </FieldError>
      ) : null}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const t = useTranslations('admin.form');
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" loading={pending}>
      {pending ? t('saving') : label}
    </Button>
  );
}
