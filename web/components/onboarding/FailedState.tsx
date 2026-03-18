'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';

interface FailedStateProps {
  error: string | null;
  onRetry: () => void;
}

export default function FailedState({ error, onRetry }: FailedStateProps) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            Something went wrong during setup
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {error || 'An unexpected error occurred while learning your style.'}
          </p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#43614a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#527559]"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
