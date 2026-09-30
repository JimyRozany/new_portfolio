import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

/**
 * Status pill for enum columns.
 *
 * Accepts every status enum the schema defines rather than one bespoke
 * component per table, and derives its colours from the enum value. Adding a
 * status to the Prisma schema therefore does not require touching this file:
 * unknown values fall through to a neutral style instead of breaking the row.
 */
const STYLES: Record<string, string> = {
  // `Project.status`
  PUBLISHED: 'bg-success-soft text-success-foreground',
  DRAFT: 'bg-warning-soft text-warning-foreground',
  ARCHIVED: 'bg-surface-3 text-muted-foreground',
  // `ContactMessage.status`
  NEW: 'bg-accent-soft text-accent-foreground',
  READ: 'bg-surface-3 text-muted-foreground',
  REPLIED: 'bg-info-soft text-info-foreground',
  SPAM: 'bg-danger-soft text-danger-foreground',
} as const;

const LABELS: Record<string, string> = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  NEW: 'new',
  READ: 'read',
  REPLIED: 'replied',
  SPAM: 'spam',
} as const;

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const t = useTranslations('admin.status');

  return (
    <Badge
      className={cn('font-mono text-[0.625rem] tracking-wide uppercase', STYLES[status], className)}
    >
      {t(LABELS[status] ?? 'unknown')}
    </Badge>
  );
}
