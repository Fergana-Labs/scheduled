import OnboardingClient from './onboarding-client';

interface OnboardingPageProps {
  searchParams?: Promise<{
    needs_google?: string | string[];
  }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const rawNeedsGoogle = params?.needs_google;
  const needsGoogle = Array.isArray(rawNeedsGoogle)
    ? rawNeedsGoogle.includes('1')
    : rawNeedsGoogle === '1';

  return <OnboardingClient needsGoogle={needsGoogle} />;
}
