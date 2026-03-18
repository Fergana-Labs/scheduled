'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'already' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/api/v1/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus(data.status === 'already_on_waitlist' ? 'already' : 'success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F0E8] px-6">
      <div className="w-full max-w-md">
        <a
          href="/"
          className="mb-12 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </a>

        {status === 'success' || status === 'already' ? (
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal italic tracking-tight text-gray-900">
              {status === 'already' ? "You're already on the list" : "You're on the list"}
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              {status === 'already'
                ? "We already have your email — sit tight, we'll reach out soon."
                : "We'll send you an invite when a spot opens up."}
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal italic tracking-tight text-gray-900">
              Join the waitlist
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Scheduled is invite-only right now. Drop your email and we'll let you know when a spot opens up.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-base text-gray-900 placeholder-gray-400 outline-none focus:border-[#43614a] focus:ring-1 focus:ring-[#43614a]"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full rounded-xl bg-[#43614a] px-7 py-3.5 text-base font-medium text-white transition-all hover:bg-[#527559] disabled:opacity-60"
              >
                {status === 'submitting' ? 'Joining...' : 'Join the waitlist'}
              </button>
            </form>

            {status === 'error' && (
              <p className="mt-4 text-sm text-red-600">Something went wrong — try again.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
