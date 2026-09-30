import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Empty state.
 *
 * Used by every admin list and every public collection so a "nothing here yet"
 * moment always looks intentional rather than broken.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'border-border flex flex-col items-center justify-center rounded-xl border border-dashed',
        'bg-surface-2/40 text-center',
        size === 'sm' ? 'gap-3 px-6 py-10' : 'gap-4 px-6 py-16',
        className,
      )}
    >
      {Icon ? (
        <span className="border-border bg-surface text-muted-foreground grid size-12 place-items-center rounded-full border">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <div className="space-y-1.5">
        <p className="text-h4 font-semibold">{title}</p>
        {description ? (
          <p className="text-small text-muted-foreground mx-auto max-w-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
