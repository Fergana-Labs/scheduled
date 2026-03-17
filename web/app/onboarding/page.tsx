'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Loader2, Calendar, Mail, Brain } from 'lucide-react';

interface UserInfo {
  user_id: string;
  email: string;
}

export default function OnboardingPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/auth/me`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError('not_authenticated');
        setLoading(false);
      });
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
            href={`${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/auth/google`}
            className="mt-6 inline-flex items-center rounded-xl bg-[#43614a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#527559]"
          >
            Sign Up with Google
          </a>
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
              src="/logo.png"
              alt="Stash Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900">
              Stash
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
                Signed in as <span className="font-medium text-gray-700">{user?.email}</span>
              </p>
            </div>
          </div>

          {/* What happens next */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase">
              What happens next
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Calendar backfill</p>
                  <p className="text-xs text-gray-500">
                    We&apos;ll scan your recent emails for commitments and add them to your Stash Calendar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Learn your style</p>
                  <p className="text-xs text-gray-500">
                    We&apos;ll analyze your email style and scheduling preferences so drafts sound like you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Start monitoring</p>
                  <p className="text-xs text-gray-500">
                    Scheduling emails will be detected automatically and drafts will appear in your Gmail.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <p className="mt-8 text-center text-xs text-gray-400">
            Onboarding runs in the background and typically takes a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
