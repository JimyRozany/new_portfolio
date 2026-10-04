import type { Metadata } from 'next';
import { TimelineListPage } from '@/components/admin/timeline-list';

export const metadata: Metadata = { title: 'Education' };

export default function AdminEducationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <TimelineListPage kind="education" searchParams={searchParams} />;
}
