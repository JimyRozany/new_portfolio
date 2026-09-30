'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError, FieldHint, Input, Label, Select, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TagInput } from '@/components/admin/tag-input';
import type { ProjectFormState } from '@/app/admin/(dashboard)/projects/actions';

/**
 * The project create/edit form.
 *
 * One component serves both pages: the only difference is whether an action is
 * bound, and a separate "new" form would drift from the edit form within a week.
 *
 * Field-level errors come back from the action as codes, not sentences, and are
 * resolved against `admin.errors.*` here so the wording stays translatable. The
 * submitted values are echoed back on failure and seeded into the uncontrolled
 * inputs, so a validation error never discards what was typed.
 */
export function ProjectForm({
  mode,
  action,
  defaults,
  technologies = [],
}: {
  mode: 'create' | 'edit';
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  /** Null when creating, so every field starts empty. */
  defaults: ProjectDefaults | null;
  technologies?: string[];
}) {
  const t = useTranslations('admin.projects');
  const tFields = useTranslations('admin.projects.fields');
  const tForm = useTranslations('admin.form');
  const tErrors = useTranslations('admin.errors');
  const tStatus = useTranslations('admin.status');

  const [state, formAction] = useActionState(action, null);

  /**
   * `featured` lives in state because the Radix switch renders a `<button>`, not
   * a form control, so it submits nothing by itself. One hidden field carries the
   * current value, which is also what makes an unticked switch submit an explicit
   * `false` rather than being indistinguishable from a missing field.
   */
  const [featured, setFeatured] = useState(defaults?.featured ?? false);

  /**
   * Values to seed uncontrolled inputs with.
   *
   * Read once on mount from the echoed values, because React will not reset an
   * uncontrolled input when the action's state changes --- re-seeding on every
   * render would fight the visitor mid-edit.
   */
  const [seed] = useState<Record<string, string> | null>(state?.values ?? null);

  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];
  const value = (field: string, fallback: string | null | undefined) =>
    seed?.[field] ?? fallback ?? '';

  // A successful edit is reported in place so the owner can keep working; the
  // list and create flows redirect instead.
  useEffect(() => {
    if (state?.status === 'success' && mode === 'edit') {
      const timer = setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      return () => clearTimeout(timer);
    }
  }, [mode, state?.status]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{tFields('identity')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="titleEn" label={tFields('titleEn')} error={errorFor('titleEn')} required>
                {(props) => (
                  <Input
                    {...props}
                    dir="ltr"
                    defaultValue={value('titleEn', defaults?.titleEn)}
                    maxLength={191}
                  />
                )}
              </Field>

              <Field id="titleAr" label={tFields('titleAr')} error={errorFor('titleAr')} required>
                {(props) => (
                  <Input
                    {...props}
                    dir="rtl"
                    defaultValue={value('titleAr', defaults?.titleAr)}
                    maxLength={191}
                  />
                )}
              </Field>

              <Field
                id="slug"
                label={tFields('slug')}
                error={errorFor('slug')}
                hint={tForm('slugHint')}
              >
                {(props) => (
                  <Input
                    {...props}
                    dir="ltr"
                    defaultValue={value('slug', defaults?.slug)}
                    placeholder="my-project"
                    maxLength={191}
                  />
                )}
              </Field>

              <Field id="category" label={tFields('category')} error={errorFor('category')}>
                {(props) => (
                  <Input
                    {...props}
                    defaultValue={value('category', defaults?.category)}
                    maxLength={120}
                  />
                )}
              </Field>

              <Field
                id="technologies"
                label={tFields('technologies')}
                error={errorFor('technologies')}
                hint={tFields('technologiesHint')}
                className="sm:col-span-2"
              >
                {() => (
                  <TagInput
                    name="technologies"
                    defaultValue={seed ? splitList(seed.technologies) : technologies}
                    placeholder={tFields('technologiesHint')}
                  />
                )}
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tFields('content')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id="descriptionEn"
                label={tFields('summaryEn')}
                error={errorFor('descriptionEn')}
                required
              >
                {(props) => (
                  <Textarea
                    {...props}
                    dir="ltr"
                    rows={3}
                    defaultValue={value('descriptionEn', defaults?.descriptionEn)}
                    maxLength={500}
                  />
                )}
              </Field>

              <Field
                id="descriptionAr"
                label={tFields('summaryAr')}
                error={errorFor('descriptionAr')}
                required
              >
                {(props) => (
                  <Textarea
                    {...props}
                    dir="rtl"
                    rows={3}
                    defaultValue={value('descriptionAr', defaults?.descriptionAr)}
                    maxLength={500}
                  />
                )}
              </Field>

              <Field
                id="longDescriptionEn"
                label={tFields('longEn')}
                error={errorFor('longDescriptionEn')}
                className="sm:col-span-2"
              >
                {(props) => (
                  <Textarea
                    {...props}
                    dir="ltr"
                    rows={8}
                    defaultValue={value('longDescriptionEn', defaults?.longDescriptionEn)}
                  />
                )}
              </Field>

              <Field
                id="longDescriptionAr"
                label={tFields('longAr')}
                error={errorFor('longDescriptionAr')}
                className="sm:col-span-2"
              >
                {(props) => (
                  <Textarea
                    {...props}
                    dir="rtl"
                    rows={8}
                    defaultValue={value('longDescriptionAr', defaults?.longDescriptionAr)}
                  />
                )}
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tFields('seo')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="liveUrl" label={tFields('liveUrl')} error={errorFor('liveUrl')}>
                {(props) => (
                  <Input
                    {...props}
                    type="url"
                    dir="ltr"
                    inputMode="url"
                    defaultValue={value('liveUrl', defaults?.liveUrl)}
                    placeholder="https://example.com"
                  />
                )}
              </Field>

              <Field id="githubUrl" label={tFields('githubUrl')} error={errorFor('githubUrl')}>
                {(props) => (
                  <Input
                    {...props}
                    type="url"
                    dir="ltr"
                    inputMode="url"
                    defaultValue={value('githubUrl', defaults?.githubUrl)}
                    placeholder="https://github.com/…"
                  />
                )}
              </Field>

              <Field
                id="thumbnail"
                label={tFields('thumbnail')}
                error={errorFor('thumbnail')}
                className="sm:col-span-2"
              >
                {(props) => (
                  <Input
                    {...props}
                    dir="ltr"
                    defaultValue={value('thumbnail', defaults?.thumbnail)}
                    placeholder="/uploads/example.webp"
                  />
                )}
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{tForm('publishing')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field id="status" label={tFields('status')}>
                {(props) => (
                  <Select {...props} defaultValue={value('status', defaults?.status) || 'DRAFT'}>
                    {(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((status) => (
                      <option key={status} value={status}>
                        {tStatus(status.toLowerCase() as 'published' | 'draft' | 'archived')}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              <Field
                id="sortOrder"
                label={tFields('sortOrder')}
                error={errorFor('sortOrder')}
                hint={tForm('sortOrderHint')}
              >
                {(props) => (
                  <Input
                    {...props}
                    type="number"
                    min={0}
                    max={9999}
                    defaultValue={value('sortOrder', String(defaults?.sortOrder ?? 0))}
                  />
                )}
              </Field>

              <div className="border-border flex items-start justify-between gap-4 border-t pt-5">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="featured" className="cursor-pointer">
                    {tFields('featured')}
                  </Label>
                  <FieldHint>{tFields('featuredHint')}</FieldHint>
                </div>
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
              </div>

              <input type="hidden" name="featured" value={String(featured)} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* `role="status"` announces the outcome to a screen reader without
          stealing focus, which would lose the owner's place in a long form. */}
      <div className="border-border bg-surface/95 sticky bottom-0 flex items-center gap-4 border-t px-1 py-3 backdrop-blur">
        <div role="status" aria-live="polite" className="text-small min-w-0 flex-1">
          {state?.status === 'error' && state.messageKey ? (
            <p className="text-danger">{tErrors(state.messageKey)}</p>
          ) : null}
          {state?.status === 'success' ? <p className="text-success">{tForm('saved')}</p> : null}
        </div>

        <Button type="button" variant="ghost" asChild>
          <Link href={'/admin/projects' as Route}>{tForm('cancel')}</Link>
        </Button>

        <SubmitButton label={mode === 'create' ? tForm('create') : tForm('save')} />
      </div>
    </form>
  );
}

/** Field defaults, i.e. the columns the form owns. */
type ProjectDefaults = {
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  longDescriptionEn: string | null;
  longDescriptionAr: string | null;
  category: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  thumbnail: string | null;
  featured: boolean;
  status: string;
  sortOrder: number;
};

/**
 * A labelled control with room for a hint and an error.
 *
 * `render` receives the props that tie the control to the label, so every field
 * gets a real `<label for>` and `aria-describedby` wiring without each call site
 * repeating it.
 */
function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  /** A validation code, resolved against `admin.errors.*`. */
  error?: string;
  required?: boolean;
  className?: string;
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
    <div className={`flex flex-col gap-2 ${className ?? ''}`}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-danger ms-0.5">*</span> : null}
      </Label>

      {children({
        id,
        name: id,
        'aria-invalid': Boolean(error),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      })}

      {hint ? <FieldHint id={`${id}-hint`}>{hint}</FieldHint> : null}

      {error ? <FieldError id={`${id}-error`}>{tErrors(error)}</FieldError> : null}
    </div>
  );
}

/**
 * Submit button that disables itself while the action is in flight.
 *
 * `useFormStatus` must be read from a child of the `<form>`, which is why this is
 * a separate component rather than a prop on `ProjectForm`.
 */
function SubmitButton({ label }: { label: string }) {
  const tForm = useTranslations('admin.form');
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? tForm('saving') : label}
    </Button>
  );
}

/** Re-split the comma-separated value the action echoes back on failure. */
function splitList(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}
