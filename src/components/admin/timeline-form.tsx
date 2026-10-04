'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError, FieldHint, Input, Label, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  TIMELINE_DATE_BOUNDS,
  TIMELINE_LIMITS,
  toDateInputValue,
} from '@/server/validations/experience';
import type { TimelineFormState } from '@/server/actions/timeline';

/**
 * The experience and education create/edit forms.
 *
 * One component for both screens and both entities. Experience and education are
 * the same record wearing different labels --- a bilingual title, an optional
 * description, a date range --- so a single form with a `kind` prop is less code
 * than two near-identical components and, more usefully, cannot drift: a fix to
 * the date handling lands in both at once.
 *
 * What differs is named explicitly rather than inferred. `kind` picks the field
 * labels ("Position" vs "Degree") and which optional blocks render; education has
 * a field of study and no location or stack, experience has the reverse.
 */

export type TimelineKind = 'experience' | 'education';

/**
 * The description pair, the only field both entities spell the same way.
 *
 * Deliberately *not* the bilingual title: that is `positionEn/Ar` on experience and
 * `degreeEn/Ar` on education, so an intersection would demand four keys that no row
 * has, and every caller passing a real record would fail to typecheck.
 */
type SharedDefaults = {
  descriptionEn: string | null;
  descriptionAr: string | null;
};

export type ExperienceDefaults = SharedDefaults & {
  id: number;
  company: string;
  positionEn: string;
  positionAr: string;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  location: string | null;
  /** Raw `Json` column: the form re-splits it into the repeater. */
  technologies: unknown;
  sortOrder: number;
};

export type EducationDefaults = SharedDefaults & {
  id: number;
  institution: string;
  degreeEn: string;
  degreeAr: string;
  fieldEn: string | null;
  fieldAr: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  sortOrder: number;
};

type Defaults = ExperienceDefaults | EducationDefaults | null;

export function TimelineForm({
  kind,
  action,
  defaults,
}: {
  kind: TimelineKind;
  action: (state: TimelineFormState, formData: FormData) => Promise<TimelineFormState>;
  defaults: Defaults;
}) {
  const isExperience = kind === 'experience';

  const tEntity = useTranslations(`admin.${kind}`);
  const tFields = useTranslations(`admin.${kind}.fields`);
  const tForm = useTranslations('admin.form');
  const tErrors = useTranslations('admin.errors');

  /**
   * Normalised view of the record.
   *
   * The two entities differ only in the *names* of a few fields, so rather than
   * branch on `kind` at every call site --- which is also what stops TypeScript
   * narrowing the defaults union --- the differing fields are resolved once here
   * into one shape. Everything below reads `title` / `organisation` and does not
   * care which screen it is on.
   */
  const title = isExperience
    ? {
        en: (defaults as ExperienceDefaults | null)?.positionEn ?? '',
        ar: (defaults as ExperienceDefaults | null)?.positionAr ?? '',
        max: TIMELINE_LIMITS.position,
        fieldEn: 'positionEn',
        fieldAr: 'positionAr',
      }
    : {
        en: (defaults as EducationDefaults | null)?.degreeEn ?? '',
        ar: (defaults as EducationDefaults | null)?.degreeAr ?? '',
        max: TIMELINE_LIMITS.degree,
        fieldEn: 'degreeEn',
        fieldAr: 'degreeAr',
      };

  const organisation = isExperience
    ? {
        field: 'company',
        label: tFields('company'),
        placeholder: tFields('companyPlaceholder'),
        value: (defaults as ExperienceDefaults | null)?.company ?? '',
      }
    : {
        field: 'institution',
        label: tFields('institution'),
        placeholder: tFields('institutionPlaceholder'),
        value: (defaults as EducationDefaults | null)?.institution ?? '',
      };

  const [state, formAction] = useActionState(action, null);

  /**
   * `current` decides whether an end date means anything, so it is state rather
   * than a plain checkbox: ticking it has to disable and clear the end-date input,
   * or the owner is left staring at a value that is about to be discarded.
   *
   * The hidden field is the single submitted value. The switch renders a
   * `<button>` and posts nothing itself, so this is also what makes an unticked
   * switch submit an explicit `false` instead of looking like a missing field.
   */
  const [current, setCurrent] = useState(defaults?.current ?? false);

  /**
   * The technologies repeater rows.
   *
   * Held in state rather than read from the DOM, because the rows are re-ordered,
   * added, and removed without the field being the source of truth; the single
   * hidden input that actually submits them is derived from this list.
   */
  const [technologies, setTechnologies] = useState<string[]>(() =>
    toTechnologyList(kind === 'experience' ? (defaults as ExperienceDefaults)?.technologies : null),
  );

  /**
   * Values echoed back by a failed submit.
   *
   * Read straight off `state`, not latched into a `useState` on mount. Latching was
   * subtly wrong: on first render `state` is `null`, so the snapshot was always
   * `null` and did nothing at all --- and worse, `useState`'s initial value is only
   * ever used on the first render, so it could not have worked later either.
   *
   * React does re-apply a changed `defaultValue` to an uncontrolled input, so once
   * the action returns, the inputs are re-seeded from what the server saw. They
   * hold the same text the owner typed, so this is invisible when it is not needed
   * and it keeps the values right if the form is ever remounted after a failure.
   */
  const seed = state?.values ?? null;

  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];

  /** Echoed value if the last submit failed, otherwise the stored default. */
  const value = (field: string, fallback: string | number | Date | null | undefined) => {
    const echoed = seed?.[field];
    if (echoed !== undefined) return echoed;

    if (fallback === null || fallback === undefined) return '';
    // A `Date` default is formatted for a date input; everything else stringifies.
    return fallback instanceof Date ? toDateInputValue(fallback) : String(fallback);
  };

  useEffect(() => {
    if (state?.status === 'success') {
      const timer = setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      return () => clearTimeout(timer);
    }
  }, [state?.status]);

  const minDate = `${TIMELINE_DATE_BOUNDS.min}-01-01`;
  const maxDate = `${TIMELINE_DATE_BOUNDS.max}-12-31`;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{tFields('identity')}</CardTitle>
              <CardDescription>{tEntity('description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id={organisation.field}
                label={organisation.label}
                error={errorFor(organisation.field)}
                required
                dir="ltr"
              >
                {(props) => (
                  <Input
                    {...props}
                    dir="ltr"
                    defaultValue={value(organisation.field, organisation.value)}
                    placeholder={organisation.placeholder}
                    maxLength={TIMELINE_LIMITS.institution}
                  />
                )}
              </Field>

              {isExperience ? (
                <Field
                  id="location"
                  label={tFields('location')}
                  error={errorFor('location')}
                  hint={tFields('locationHint')}
                >
                  {(props) => (
                    <Input
                      {...props}
                      dir="ltr"
                      defaultValue={value(
                        'location',
                        (defaults as ExperienceDefaults | null)?.location,
                      )}
                      placeholder={tFields('locationPlaceholder')}
                      maxLength={TIMELINE_LIMITS.location}
                    />
                  )}
                </Field>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tFields('bilingual')}</CardTitle>
              <CardDescription>{tFields('bilingualDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id={title.fieldEn}
                label={tFields('titleEn')}
                error={errorFor(title.fieldEn)}
                required
                dir="ltr"
              >
                {(props) => (
                  <Input
                    {...props}
                    dir="ltr"
                    defaultValue={value(title.fieldEn, title.en)}
                    placeholder={tFields('titlePlaceholder')}
                    maxLength={title.max}
                  />
                )}
              </Field>

              <Field
                id={title.fieldAr}
                label={tFields('titleAr')}
                error={errorFor(title.fieldAr)}
                required
                dir="rtl"
              >
                {(props) => (
                  <Input
                    {...props}
                    dir="rtl"
                    defaultValue={value(title.fieldAr, title.ar)}
                    placeholder={tFields('titlePlaceholder')}
                    maxLength={title.max}
                  />
                )}
              </Field>

              {!isExperience ? (
                <>
                  <Field
                    id="fieldEn"
                    label={tFields('fieldEn')}
                    error={errorFor('fieldEn')}
                    hint={tFields('fieldHint')}
                    dir="ltr"
                  >
                    {(props) => (
                      <Input
                        {...props}
                        dir="ltr"
                        defaultValue={value(
                          'fieldEn',
                          (defaults as EducationDefaults | null)?.fieldEn,
                        )}
                        placeholder={tFields('fieldPlaceholder')}
                        maxLength={TIMELINE_LIMITS.field}
                      />
                    )}
                  </Field>

                  <Field
                    id="fieldAr"
                    label={tFields('fieldAr')}
                    error={errorFor('fieldAr')}
                    dir="rtl"
                  >
                    {(props) => (
                      <Input
                        {...props}
                        dir="rtl"
                        defaultValue={value(
                          'fieldAr',
                          (defaults as EducationDefaults | null)?.fieldAr,
                        )}
                        placeholder={tFields('fieldPlaceholder')}
                        maxLength={TIMELINE_LIMITS.field}
                      />
                    )}
                  </Field>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tFields('description')}</CardTitle>
              <CardDescription>{tFields('descriptionDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5">
              <Field
                id="descriptionEn"
                label={tFields('descriptionEn')}
                error={errorFor('descriptionEn')}
                dir="ltr"
              >
                {(props) => (
                  <Textarea
                    {...props}
                    dir="ltr"
                    rows={4}
                    defaultValue={value('descriptionEn', defaults?.descriptionEn)}
                    placeholder={tFields('descriptionPlaceholder')}
                    maxLength={TIMELINE_LIMITS.description}
                  />
                )}
              </Field>

              <Field
                id="descriptionAr"
                label={tFields('descriptionAr')}
                error={errorFor('descriptionAr')}
                dir="rtl"
              >
                {(props) => (
                  <Textarea
                    {...props}
                    dir="rtl"
                    rows={4}
                    defaultValue={value('descriptionAr', defaults?.descriptionAr)}
                    placeholder={tFields('descriptionPlaceholder')}
                    maxLength={TIMELINE_LIMITS.description}
                  />
                )}
              </Field>
            </CardContent>
          </Card>

          {isExperience ? (
            <TechnologyRepeater
              technologies={technologies}
              onChange={setTechnologies}
              labels={{
                title: tFields('technologies'),
                description: tFields('technologiesDescription'),
                add: tFields('addTechnology'),
                remove: tFields('removeTechnology'),
                placeholder: tFields('technologyPlaceholder'),
                limit: tFields('technologyLimit', { count: TIMELINE_LIMITS.technologyCount }),
              }}
              error={errorFor('technologies')}
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{tFields('dates')}</CardTitle>
              <CardDescription>{tFields('datesDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field
                id="startDate"
                label={tFields('startDate')}
                error={errorFor('startDate')}
                required
              >
                {(props) => (
                  <Input
                    {...props}
                    type="date"
                    dir="ltr"
                    min={minDate}
                    max={maxDate}
                    defaultValue={value('startDate', defaults?.startDate)}
                  />
                )}
              </Field>

              <Field
                id="endDate"
                label={tFields('endDate')}
                error={errorFor('endDate')}
                hint={current ? tFields('endDateCurrentHint') : tFields('endDateHint')}
              >
                {(props) => (
                  <Input
                    {...props}
                    type="date"
                    dir="ltr"
                    min={minDate}
                    max={maxDate}
                    disabled={current}
                    defaultValue={value('endDate', defaults?.endDate)}
                  />
                )}
              </Field>

              {/* The switch's value is the hidden field below; the visible control
                  only drives state. */}
              <div className="border-border flex items-center justify-between gap-4 rounded-lg border p-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="current">{tFields('current')}</Label>
                  <FieldHint id="current-hint">{tFields('currentHint')}</FieldHint>
                </div>
                <Switch id="current" checked={current} onCheckedChange={setCurrent} />
              </div>
              <input type="hidden" name="current" value={String(current)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tFields('ordering')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field
                id="sortOrder"
                label={tFields('sortOrder')}
                error={errorFor('sortOrder')}
                hint={tFields('sortOrderHint')}
              >
                {(props) => (
                  <Input
                    {...props}
                    type="number"
                    dir="ltr"
                    min={0}
                    max={9_999}
                    step={1}
                    defaultValue={value('sortOrder', defaults?.sortOrder ?? 0)}
                  />
                )}
              </Field>
            </CardContent>
          </Card>

          <SubmitButton label={tForm('save')} />

          {state?.status === 'error' && state.messageKey ? (
            <p role="alert" className="text-small text-danger">
              {tErrors(state.messageKey as Parameters<typeof tErrors>[0])}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

/**
 * Repeater for the stack used in a role.
 *
 * The visible inputs are state, not form fields, and a single hidden
 * `technologies` input carries the joined list. Submitting one hidden input per row
 * was the original approach and it is a trap here: `FormData.get` would then return
 * only the first value, while `FormData.getAll` returns them all, so a read written
 * against the wrong one loses every entry but the first with no error anywhere.
 * One joined string has exactly one reading.
 *
 * Blank rows are dropped rather than rejected, so a half-filled row does not block
 * a save; that is why the hidden value is derived from a filtered list rather than
 * submitted as typed.
 */
function TechnologyRepeater({
  technologies,
  onChange,
  labels,
  error,
}: {
  technologies: string[];
  onChange: (next: string[]) => void;
  labels: {
    title: string;
    description: string;
    add: string;
    remove: string;
    placeholder: string;
    limit: string;
  };
  error?: string;
}) {
  const entries = technologies.length > 0 ? technologies : [''];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              dir="ltr"
              value={entry}
              aria-label={`${labels.title} ${index + 1}`}
              placeholder={labels.placeholder}
              maxLength={TIMELINE_LIMITS.technology}
              onChange={(event) => {
                const next = [...technologies];
                next[index] = event.target.value;
                // A trailing blank row is the "add" affordance, so it is kept in
                // state rather than trimmed away on every keystroke.
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`${labels.remove} ${index + 1}`}
              disabled={entries.length === 1 && entry === ''}
              onClick={() => onChange(technologies.filter((_, i) => i !== index))}
            >
              ×
            </Button>
          </div>
        ))}

        {/**
         * `value`, not `defaultValue`.
         *
         * This is the field the schema actually reads, and `defaultValue` is
         * captured on mount only: with it, adding or retyping a technology updated
         * the visible inputs and left this one submitting the original list, so the
         * save silently reverted the edit. `readOnly` is what keeps React from
         * warning about a value with no `onChange`.
         */}
        <input
          type="hidden"
          name="technologies"
          value={technologies
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0)
            .join(',')}
          readOnly
        />

        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={technologies.length >= TIMELINE_LIMITS.technologyCount}
            onClick={() => onChange([...technologies, ''])}
          >
            {labels.add}
          </Button>
          <p className="text-caption text-subtle-foreground">{labels.limit}</p>
        </div>

        {error ? <FieldError id="technologies-error">{error}</FieldError> : null}
      </CardContent>
    </Card>
  );
}

/**
 * A labelled control with room for a hint and an error.
 *
 * `render` receives the props that tie the control to the label, so every field
 * gets a real `<label for>` and `aria-describedby` wiring without repeating it.
 */
function Field({
  id,
  label,
  error,
  hint,
  required,
  className,
  dir,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  /** Writing direction of the label text, for the bilingual pairs. */
  dir?: 'ltr' | 'rtl';
  children: (props: {
    id: string;
    name: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  }) => React.ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`}>
      <Label htmlFor={id} dir={dir}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-danger ms-1">
            *
          </span>
        ) : null}
      </Label>

      {children({
        id,
        name: id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}

      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
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

/**
 * Read the raw `Json` column into a list of strings.
 *
 * The column is `unknown` as far as TypeScript is concerned and the admin form
 * writes whatever the browser sent, so it is validated at the read boundary rather
 * than trusted --- the same reasoning as the public query layer's `toStringArray`,
 * and deliberately not shared with it: this runs in the browser bundle, that on
 * the server, and they cannot import across that line.
 */
function toTechnologyList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}
