'use client';

import { useEffect, useState } from 'react';
import { FileEdit, Check, Send, Link2 } from 'lucide-react';

interface Props {
  draftText: string;
  onSend: () => void;
}

export default function DraftPreview({ draftText, onSend }: Props) {
  const [visible, setVisible] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => onSend(), 800);
  };

  return (
    <div
      className={`w-full transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
        <FileEdit className="h-4 w-4" />
        Draft Reply
      </div>
      <div
        className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors duration-300 ${
          sent ? 'border-[#43614a]' : 'border-gray-200'
        }`}
      >
        {/* Draft header */}
        <div className="border-b border-gray-100 px-5 py-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
              DRAFT
            </span>
          </div>
        </div>

        {/* Draft body */}
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-gray-800">{draftText}</p>

          {/* Scheduling link footer */}
          <div className="mt-4 border-t border-dashed border-gray-200 pt-3">
            <div className="relative">
              <div className="flex items-center gap-1.5 text-xs text-[#43614a]">
                <Link2 className="h-3 w-3" />
                <span className="underline">Find a time that works →</span>
              </div>
              {/* Annotation */}
              <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-500">
                <span className="font-medium text-gray-600">↑ Scheduling link</span> — if the
                proposed time doesn&apos;t work, they can pick from your available slots.
              </div>
            </div>
          </div>
        </div>

        {/* Send button area */}
        <div className="border-t border-gray-100 px-5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              When you hit send, Scheduled creates a calendar invite automatically.
            </p>
            <button
              onClick={handleSend}
              disabled={sent}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition-all ${
                sent
                  ? 'bg-[#43614a]'
                  : 'bg-[#43614a] hover:bg-[#527559] active:scale-95'
              }`}
            >
              {sent ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Sent
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
