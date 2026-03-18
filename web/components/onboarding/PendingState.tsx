'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function PendingState() {
  return (
    <>
      <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              We&apos;re learning your style
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Your scheduling preferences and email style guide will appear here
              when ready.
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          This runs in the background and typically takes a few minutes.
        </p>
      </div>

      <div className="mt-8 border-t border-gray-100 pt-8">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-400 uppercase">
          How it works
        </h2>
        <Image
          src="/how-it-works.svg"
          alt="How Scheduled works: 1. Meeting request arrives, 2. AI drafts a reply, 3. You accept the draft, 4. Meeting is scheduled"
          width={680}
          height={620}
          className="w-full"
          priority
        />
      </div>
    </>
  );
}
