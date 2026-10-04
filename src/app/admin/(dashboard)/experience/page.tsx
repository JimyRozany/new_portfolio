import type { Metadata } from 'next';
import { TimelineListPage } from '@/components/admin/timeline-list';

export const metadata: Metadata = { title: 'Experience' };

export default function AdminExperiencePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <TimelineListPage kind="experience" searchParams={searchParams} />;
}
