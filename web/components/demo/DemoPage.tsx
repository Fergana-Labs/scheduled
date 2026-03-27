'use client';

import { useState, useEffect } from 'react';
import ChatPhase from './ChatPhase';
import RevealPhase from './RevealPhase';
import { trackPageEvent } from '@/lib/analytics';

type DemoPhase = 'chat' | 'transitioning' | 'reveal';

interface CompletionData {
  messages: { role: 'user' | 'assistant'; content: string }[];
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

export default function DemoPage() {
  const [phase, setPhase] = useState<DemoPhase>('chat');
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);

  useEffect(() => {
    trackPageEvent('demo_page_view');
  }, []);

  const handleChatComplete = (data: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    events?: { start: string; end: string; summary: string }[];
    reasoning?: CompletionData['reasoning'];
    lastReply: string;
  }) => {
    setCompletionData({
      messages: data.messages,
      events: data.events || [],
      reasoning: data.reasoning || {
        summary: 'Scheduling request',
        date_label: '',
        event_summary: 'Meeting',
        agreed_time_start: '',
        agreed_time_end: '',
      },
      lastReply: data.lastReply,
    });
    setPhase('transitioning');
    setTimeout(() => setPhase('reveal'), 800);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <header className="px-4 py-5 sm:px-6">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="transition-opacity hover:opacity-70">
            <img src="/scheduled_logo.svg" alt="Scheduled" className="h-5" />
          </a>
          <span className="rounded-full border border-[#43614a]/20 px-3 py-1 text-xs font-medium text-[#43614a]">
            Interactive Demo
          </span>
        </nav>
      </header>

      <main className="px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        {/* Title */}
        <div className="mx-auto mb-10 max-w-lg text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal italic tracking-tight text-gray-900 sm:text-4xl">
            Try scheduling with Sam
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Send a message like you&apos;re trying to schedule a meeting.
            Scheduled will reply using Sam&apos;s real calendar availability.
          </p>
        </div>

        {/* Phase container */}
        <div className="relative">
          {/* Chat phase */}
          <div
            className={`transition-all duration-700 ${
              phase === 'chat'
                ? 'opacity-100'
                : phase === 'transitioning'
                  ? 'pointer-events-none -translate-y-4 opacity-0'
                  : 'hidden'
            }`}
          >
            <ChatPhase onComplete={handleChatComplete} />
          </div>

          {/* Reveal phase */}
          {phase === 'reveal' && completionData && (
            <RevealPhase
              events={completionData.events}
              reasoning={completionData.reasoning}
              lastReply={completionData.lastReply}
            />
          )}
        </div>
      </main>
    </div>
  );
}
