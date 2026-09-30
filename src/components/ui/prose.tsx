import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Prose styles for CMS-authored rich text (project long descriptions, about
 * copy). The palette, spacing and link treatment come from the design tokens
 * so long-form content matches the rest of the site in both themes.
 */
export const proseVariants = cva([
  'prose max-w-none',
  'prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight',
  'prose-p:text-body prose-p:leading-relaxed prose-p:text-muted-foreground',
  'prose-strong:text-foreground prose-strong:font-semibold',
  'prose-a:text-foreground prose-a:font-medium prose-a:underline prose-a:decoration-accent',
  'prose-a:underline-offset-4 prose-a:transition-colors hover:prose-a:text-accent-foreground',
  'prose-ul:list-disc prose-ol:list-decimal prose-li:my-1.5 prose-li:text-muted-foreground',
  'prose-li:marker:text-subtle-foreground',
  'prose-blockquote:border-s-2 prose-blockquote:border-accent prose-blockquote:text-foreground',
  'prose-blockquote:not-italic prose-blockquote:font-medium',
  'prose-code:rounded prose-code:bg-surface-2 prose-code:px-1.5 prose-code:py-0.5',
  'prose-code:font-mono prose-code:text-[0.85em] prose-code:text-foreground prose-code:font-normal',
  'prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-surface-2',
  'prose-hr:border-border',
  'prose-img:rounded-lg prose-img:border prose-img:border-border',
  'prose-table:text-small',
  // Arabic prose needs a touch more leading and no negative tracking.
  'rtl:prose-p:leading-loose',
]);
export type ProseProps = ComponentProps<'div'> & VariantProps<typeof proseVariants>;

export function Prose({ className, ...props }: ProseProps) {
  return <div className={cn(proseVariants(), className)} {...props} />;
}
