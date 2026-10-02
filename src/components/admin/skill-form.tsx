'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError, FieldHint, Input, Label, Select } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { SkillFormState } from '@/app/admin/(dashboard)/skills/actions';

/**
 * The skill create/edit form.
 *
 * One component for both screens; only whether an action is bound differs.
 *
 * `level` is a number the public grid also renders as a progress bar, so the
 * input is a `range` paired with a live percentage readout. A slider alone would
 * hide the exact number from anyone who cannot use the pointer --- and from a
 * screen reader, which announces the range but not the resulting percentage ---
 * so the value is printed beside it, and the paired text field keeps the number
 * directly editable.
 */
export function SkillForm({
  action,
  defaults,
  categories,
}: {
  action: (state: SkillFormState, formData: FormData) => Promise<SkillFormState>;
  defaults: SkillDefaults | null;
  categories: { id: number; nameEn: string; nameAr: string }[];
}) {
  const t = useTranslations('admin.skills');
  const tFields = useTranslations('admin.skills.fields');
  const tForm = useTranslations('admin.form');
  const tErrors = useTranslations('admin.errors');

  const [state, formAction] = useActionState(action, null);

  /**
   * The Radix switch renders a `<button>`, so it submits nothing by itself.
   * One hidden field carries the current value, which is also what makes an
   * unticked switch submit an explicit `false` rather than being
   * indistinguishable from a missing field.
   */
  const [featured, setFeatured] = useState(defaults?.featured ?? false);

  /**
   * Level is mirrored into state so the slider and the readout cannot drift.
   * `hasLevel` is separate state rather than derived, because "no level" is a
   * real choice the owner makes and it must survive a re-render. The hidden field
   * is the single submitted value, and the range input carries no `name`, so a
   * slider drag and a typed number cannot both post the field.
   */
  const [level, setLevel] = useState(defaults?.level ?? 90);
  const [hasLevel, setHasLevel] = useState(
    defaults?.level !== null && defaults?.level !== undefined,
  );

  /**
   * Read once on mount from the echoed values: React will not reset an
   * uncontrolled input when the action's state changes, and re-seeding on every
   * render would fight the owner mid-edit.
   */
  const [seed] = useState<Record<string, string> | null>(state?.values ?? null);

  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];
  const value = (field: string, fallback: string | number | null | undefined) =>
    seed?.[field] ?? (fallback === null || fallback === undefined ? '' : String(fallback));

  useEffect(() => {
    if (state?.status === 'success') {
      const timer = setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      return () => clearTimeout(timer);
    }
  }, [state?.status]);

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
              <Field id="name" label={tFields('name')} error={errorFor('name')} required>
                {(props) => (
                  <Input
                    {...props}
                    dir="ltr"
                    defaultValue={value('name', defaults?.name)}
                    placeholder="Laravel"
                    maxLength={120}
                  />
                )}
              </Field>

              <Field
                id="icon"
                label={tFields('icon')}
                error={errorFor('icon')}
                hint={tFields('iconHint')}
              >
                {(props) => (
                  <Input
                    {...props}
                    dir="ltr"
                    defaultValue={value('icon', defaults?.icon)}
                    placeholder="server"
                    maxLength={120}
                  />
                )}
              </Field>

              <Field
                id="categoryId"
                label={tFields('category')}
                error={errorFor('categoryId')}
                className="sm:col-span-2"
              >
                {(props) => (
                  <Select {...props} defaultValue={value('categoryId', defaults?.categoryId ?? '')}>
                    <option value="">{tFields('noCategory')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nameEn}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tFields('level')}</CardTitle>
              <CardDescription>{tFields('levelDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field
                id="level"
                label={tFields('level')}
                error={errorFor('level')}
                hint={tFields('levelHint')}
              >
                {() => (
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={level}
                      onChange={(event) => setLevel(Number(event.target.value))}
                      aria-label={tFields('level')}
                      className="accent-accent focus-visible:outline-ring h-2 flex-1 cursor-pointer rounded-full"
                    />
                    {/* Spelled out, not implied by the slider position: this is the
                        number the public progress bar reports. */}
                    <output
                      htmlFor="level"
                      className="text-small text-muted-foreground w-12 text-end tabular-nums"
                    >
                      {level}%
                    </output>
                  </div>
                )}
              </Field>

              <div className="flex flex-col gap-1">
                <Switch
                  id="no-level"
                  checked={!hasLevel}
                  onCheckedChange={(checked) => setHasLevel(!checked)}
                />
                <Label htmlFor="no-level" className="cursor-pointer">
                  {tFields('noLevel')}
                </Label>
                <FieldHint>{tFields('noLevelHint')}</FieldHint>
              </div>

              {/* The one submitted value. Blank means "no level", which the schema
                  turns into SQL NULL rather than a misleading 0. */}
              <input type="hidden" name="level" value={hasLevel ? String(level) : ''} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{tForm('publishing')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
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
                  <FieldHint id="featured-hint">{tFields('featuredHint')}</FieldHint>
                  {/* The switch can only post `true`/`false`, so this is unreachable
                      from the UI --- but the value is validated like any other, and an
                      error the form refuses to show is an error it will hide again. */}
                  {errorFor('featured') ? (
                    <FieldError id="featured-error">
                      {tErrors(errorFor('featured') as Parameters<typeof tErrors>[0])}
                    </FieldError>
                  ) : null}
                </div>
                <Switch
                  id="featured"
                  aria-describedby="featured-hint"
                  aria-invalid={Boolean(errorFor('featured'))}
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>

              <input type="hidden" name="featured" value={String(featured)} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* `role="status"` announces the outcome without stealing focus, which
          would lose the owner's place in a long form. */}
      <div className="border-border bg-surface/95 sticky bottom-0 flex items-center gap-4 border-t px-1 py-3 backdrop-blur">
        <div role="status" aria-live="polite" className="text-small min-w-0 flex-1">
          {state?.status === 'error' && state.messageKey ? (
            <p className="text-danger">{tErrors(state.messageKey)}</p>
          ) : null}
          {state?.status === 'success' ? <p className="text-success">{tForm('saved')}</p> : null}
        </div>

        <SubmitButton label={tForm('save')} />
      </div>
    </form>
  );
}

/** Field defaults, i.e. the columns the form owns. */
type SkillDefaults = {
  name: string;
  icon: string | null;
  categoryId: number | null;
  level: number | null;
  featured: boolean;
  sortOrder: number;
};

/**
 * A labelled control with room for a hint and an error.
 *
 * `render` receives the props that tie the control to the label, so every field
 * gets a real `<label for>` and `aria-describedby` wiring without repeating it.
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
    <div className={cn('flex flex-col gap-2', className)}>
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
    <Button type="submit" loading={pending}>
      {pending ? t('saving') : label}
    </Button>
  );
}

function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
