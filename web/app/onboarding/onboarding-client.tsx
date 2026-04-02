'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Loader2, Mail, Bot } from 'lucide-react';
import { api, captureSessionFromURL, getSession } from '@/lib/api';
import { track, setGAUserId } from '@/lib/analytics';
import PendingState from '@/components/onboarding/PendingState';
import FailedState from '@/components/onboarding/FailedState';

type SchedulingMode = 'draft' | 'bot' | null;

interface UserInfo {
  user_id: string;
  email: string;
  needs_reauth?: boolean;
}

interface OnboardingClientProps {
  needsGoogle: boolean;
  initialMode: SchedulingMode;
}

type AgentStatus = Record<string, string>;

export default function OnboardingClient({ needsGoogle, initialMode }: OnboardingClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [failedError, setFailedError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentStatus | null>(null);
  const [selectedMode, setSelectedMode] = useState<SchedulingMode>(initialMode);

  useEffect(() => {
    captureSessionFromURL();
    api<UserInfo>('/auth/me')
      .then((data) => {
        if (data.needs_reauth) {
          const connectUrl = `${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/auth/google/connect?token=${getSession()}`;
          window.location.href = `/permissions-required?retry_url=${encodeURIComponent(connectUrl)}`;
          return;
        }
        setUser(data);
        setGAUserId(data.user_id);
        track('page_view', { page: 'onboarding' });
        setLoading(false);
      })
      .catch(() => {
        setError('not_authenticated');
        setLoading(false);
      });
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const status = await api<{ ready: boolean; failed?: boolean; error?: string; agents?: AgentStatus }>('/web/api/v1/onboarding/status');
      if (status.agents) {
        setAgents(status.agents);
      }
      if (status.ready) {
        track('onboarding_completed');
        router.push('/settings');
      } else if (status.failed) {
        track('onboarding_failed', { error: status.error });
        setFailed(true);
        setFailedError(status.error || null);
      }
    } catch {
      // ignore — will retry on next poll
    }
  }, [router]);

  useEffect(() => {
    if (!user || needsGoogle || failed) return;

    // Check immediately
    checkStatus();

    const interval = setInterval(checkStatus, 3_000);
    return () => clearInterval(interval);
  }, [user, needsGoogle, failed, checkStatus]);

  const handleRetry = useCallback(async () => {
    setFailed(false);
    setFailedError(null);
    try {
      await api('/api/v1/onboarding/run', { method: 'POST' });
    } catch {
      // will pick up failure on next poll
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="mt-2 text-gray-500">
            Please sign up to get started.
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/auth/login`}
            className="mt-6 inline-flex items-center rounded-xl bg-[#43614a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#527559]"
          >
            Sign Up with Google
          </a>
        </div>
      </div>
    );
  }

  if (needsGoogle) {
    const connectUrl = selectedMode === 'bot'
      ? `${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/auth/google/connect-calendar?token=${getSession() || ''}`
      : `${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/auth/google/connect?token=${getSession() || ''}`;

    type ModeOption = { mode: 'draft' | 'bot'; icon: React.ReactNode; title: string; description: React.ReactNode; footnote: string };
    const modeOptions: ModeOption[] = [
      {
        mode: 'draft',
        icon: <Mail className={`mt-0.5 h-5 w-5 flex-shrink-0 ${selectedMode === 'draft' ? 'text-[#43614a]' : 'text-gray-400'}`} />,
        title: 'Draft mode',
        description: 'Scheduled drafts replies in your Gmail. You review and send them yourself.',
        footnote: 'Requires Gmail + Calendar access',
      },
      {
        mode: 'bot',
        icon: <Bot className={`mt-0.5 h-5 w-5 flex-shrink-0 ${selectedMode === 'bot' ? 'text-[#43614a]' : 'text-gray-400'}`} />,
        title: 'Bot mode',
        description: <>CC <span className="font-medium">scheduling@tryscheduled.com</span> on any thread and the bot replies directly.</>,
        footnote: 'Only needs Calendar access',
      },
    ];

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="mx-auto max-w-lg px-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-8 flex items-center gap-3">
              <Image
                src="/scheduled_icon.svg"
                alt="Scheduled Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900">
                Scheduled
              </span>
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                How would you like to schedule?
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Signed in as{' '}
                <span className="font-medium text-gray-700">
                  {user?.email}
                </span>
              </p>
            </div>

            <div className="mb-6 space-y-3">
              {modeOptions.map(({ mode, icon, title, description, footnote }) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
                    selectedMode === mode
                      ? 'border-[#43614a] bg-[#43614a]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {icon}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{title}</p>
                      <p className="mt-1 text-xs text-gray-500">{description}</p>
                      <p className="mt-1 text-xs text-gray-400">{footnote}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <a
              href={selectedMode ? connectUrl : undefined}
              className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-4 text-base font-semibold text-white transition-colors ${
                selectedMode
                  ? 'bg-[#43614a] hover:bg-[#527559]'
                  : 'cursor-not-allowed bg-gray-300'
              }`}
            >
              Connect Google Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="mx-auto max-w-lg px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/scheduled_icon.svg"
              alt="Scheduled Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900">
              Scheduled
            </span>
          </div>

          {/* Success message */}
          <div className="mb-8 flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#43614a]" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                You&apos;re all set!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Signed in as{' '}
                <span className="font-medium text-gray-700">
                  {user?.email}
                </span>
              </p>
            </div>
          </div>

          {failed ? (
            <FailedState error={failedError} onRetry={handleRetry} />
          ) : (
            <PendingState agents={agents} />
          )}
        </div>
      </div>
    </div>
  );
}

