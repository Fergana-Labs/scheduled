import type { Metadata } from 'next';
import DemoPage from '@/components/demo/DemoPage';

export const metadata: Metadata = {
  title: 'Interactive Demo | Scheduled',
  description:
    'Experience how Scheduled handles your scheduling emails — no sign-up required.',
};

export default function Demo() {
  return <DemoPage />;
}
