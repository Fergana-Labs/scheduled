'use client';

import { useState, useEffect, useRef } from 'react';
import ReasoningEmail from './ReasoningEmail';
import DraftPreview from './DraftPreview';
import BookingCTA from './BookingCTA';
import { trackPageEvent } from '@/lib/analytics';

interface Props {
  events: { start: string; end: string; summary: string }[];
  reasoning: {
    summary: string;
    date_label: string;
    event_summary: string;
    agreed_time_start: string;
    agreed_time_end: string;
  };
  lastReply: string;
}

export default function RevealPhase({ events, reasoning, lastReply }: Props) {
  const [showDraft, setShowDraft] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackPageEvent('demo_reveal_viewed');
    const t = setTimeout(() => setShowDraft(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleSend = () => {
    trackPageEvent('demo_send_clicked');
    setShowCTA(true);
    setTimeout(() => {
      ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-normal italic tracking-tight text-gray-900 sm:text-3xl">
          Behind the scenes
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Here&apos;s what Scheduled does when it handles this conversation.
        </p>
      </div>

      <ReasoningEmail events={events} reasoning={reasoning} />

      {showDraft && (
        <DraftPreview draftText={lastReply} onSend={handleSend} />
      )}

      {showCTA && <BookingCTA ref={ctaRef} />}
    </div>
  );
}
