'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

/**
 * Repeater for a list of short strings (a project's technologies).
 *
 * Each entry is a real `<input name="technologies">`, so the values reach the
 * server action as ordinary form fields and the form still works if JavaScript
 * fails to hydrate. The visible "+" affordance is a convenience on top, not the
 * mechanism.
 *
 * Entries are added on Enter or comma, and removed with a button rather than
 * backspace so a stray keystroke cannot silently delete a technology the owner
 * typed two minutes ago.
 */
export function TagInput({
  name,
  defaultValue = [],
  placeholder,
  max = 30,
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
  max?: number;
}) {
  const t = useTranslations('admin.projects.fields');
  const [entries, setEntries] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const value = raw.trim().replace(/,+$/, '').trim();
    if (value === '' || entries.includes(value) || entries.length >= max) return;

    setEntries((current) => [...current, value]);
    setDraft('');
  };

  const remove = (value: string) => {
    setEntries((current) => current.filter((entry) => entry !== value));
  };

  return (
    <div className="flex flex-col gap-2">
      {entries.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {entries.map((entry) => (
            <li key={entry}>
              <Badge variant="outline" className="gap-1 py-1 pe-1">
                {entry}
                <button
                  type="button"
                  onClick={() => remove(entry)}
                  // The list item already reads as "<technology>", so the button
                  // only needs to announce what it removes.
                  aria-label={`${t('removeTechnology')} ${entry}`}
                  className="hover:bg-border focus-visible:outline-ring -me-0.5 rounded-full p-0.5 focus-visible:outline-2"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => add(draft)}
        placeholder={placeholder ?? t('technologiesHint')}
        disabled={entries.length >= max}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            // Otherwise Enter would submit the whole form half-filled, which is
            // how entries silently disappear.
            event.preventDefault();
            add(draft);
          }
        }}
      />

      {/* The visible list is decorative: the inputs above carry the values. */}
      {entries.map((entry) => (
        <input key={entry} type="hidden" name={name} value={entry} />
      ))}
    </div>
  );
}
