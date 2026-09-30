'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Destructive action behind a confirmation dialog.
 *
 * The dialog is not decoration: a single click on a trash icon in a list of
 * projects must not be able to delete one. It also does not use an optimistic
 * update --- the row disappears when the server confirms, so a failed delete
 * leaves the list exactly as it was.
 */
export function DeleteButton({
  id,
  action,
  entity,
  entityName,
  redirectTo,
}: {
  /** Primary key of the record this button deletes. */
  id: number;
  /** Server action that performs the delete and returns `{ ok }`. */
  action: (id: number) => Promise<{ ok: boolean }>;
  /** Translated entity name, e.g. "project", for the confirmation copy. */
  entity: string;
  entityName: string;
  /** Where to go once the record is gone. */
  redirectTo?: string;
}) {
  const t = useTranslations('admin.form');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) return;

      setOpen(false);
      if (redirectTo) router.push(redirectTo as Route);
      // Refresh so a delete made from the edit form disappears from the list the
      // owner navigates back to.
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="text-danger">
          <Trash2 className="size-4" aria-hidden="true" />
          {tCommon('delete')}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteConfirmTitle', { entity })}</DialogTitle>
          <DialogDescription>
            {/* Names the record, so a list of similar titles is unambiguous. */}
            {entityName} — {t('deleteConfirmDescription')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? t('saving') : tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
