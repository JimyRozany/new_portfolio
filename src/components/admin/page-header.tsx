import Link from 'next/link';
import type { Route } from 'next';
import { ChevronLeft } from 'lucide-react';

/**
 * Header for an admin sub-page.
 *
 * Every create/edit screen needs the same three things --- where you are, a way
 * back, and a place for primary actions --- and getting them slightly different
 * on each screen is how an admin starts to feel unpolished. The back link is
 * explicit rather than a browser-back button so the destination is always
 * visible.
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  children,
}: {
  title: string;
  description?: string;
  backHref?: string;
  /** Accessible name for the back link; pass the destination, not "back". */
  backLabel?: string;
  /** Primary actions, usually a "new" button. */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      {backHref ? (
        <Link
          href={backHref as Route}
          className="text-subtle-foreground hover:text-foreground focus-visible:outline-ring text-small inline-flex w-fit items-center gap-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          {backLabel}
        </Link>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h3">{title}</h1>
          {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
        </div>

        {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
      </div>
    </div>
  );
}
