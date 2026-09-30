import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Loading placeholder.
 *
 * Marked `aria-hidden` because the surrounding region should already announce
 * its own busy state — otherwise a screen reader would read "skeleton" aloud
 * once per placeholder.
 */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('skeleton h-4 w-full', className)}
      {...props}
    />
  );
}

/** Pre-composed skeleton shapes for the common admin/public list patterns. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border-border bg-surface flex flex-col gap-4 rounded-xl border p-6',
        className,
      )}
    >
      <Skeleton className="aspect-[16/10] w-full rounded-lg" />
      <Skeleton className="h-4 w-2/5" />
      <SkeletonText lines={2} />
    </div>
  );
}
