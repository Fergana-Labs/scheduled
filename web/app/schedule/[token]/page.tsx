import type { Metadata } from 'next';
import SchedulePageClient from './schedule-client';

export const metadata: Metadata = {
  title: 'Find a Time | Scheduled',
  description: 'Pick a time that works for you.',
  robots: { index: false, follow: false },
};

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <SchedulePageClient token={token} />;
}
