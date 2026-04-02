'use client';

import { useSearchParams } from 'next/navigation';
import OnboardingClient from './onboarding-client';

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const needsGoogle = searchParams.get('needs_google') === '1';
  const modeParam = searchParams.get('mode');
  const initialMode = modeParam === 'bot' ? 'bot' : modeParam === 'draft' ? 'draft' : null;

  return <OnboardingClient needsGoogle={needsGoogle} initialMode={initialMode} />;
}
