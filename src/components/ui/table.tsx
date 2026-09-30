import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Data table primitives.
 *
 * Wrapped in an overflow container so wide tables scroll horizontally on
 * mobile instead of breaking the layout, and `<caption>` is exposed for
 * screen-reader users via `TableCaption`.
 */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div data-slot="table-wrapper" className="w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('text-small w-full caption-bottom', className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-border hover:bg-surface-2/60 data-[state=selected]:bg-surface-2 border-b transition-colors duration-150',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        'text-caption text-subtle-foreground h-11 px-4 text-start align-middle font-medium tracking-wider uppercase',
        'whitespace-nowrap',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td data-slot="table-cell" className={cn('px-4 py-3.5 align-middle', className)} {...props} />
  );
}

export function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-caption text-subtle-foreground mt-4', className)}
      {...props}
    />
  );
}

export function TableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-14 text-center">
        {children}
      </TableCell>
    </TableRow>
  );
}
