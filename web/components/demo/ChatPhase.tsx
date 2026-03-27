'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import TypingIndicator from './TypingIndicator';
import { trackPageEvent } from '@/lib/analytics';
import type { SidePanelStep } from './SidePanel';

const API_BASE = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isDraft?: boolean; // assistant messages start as drafts
}

export interface DemoResponse {
  reply: string;
  is_complete: boolean;
  events?: { start: string; end: string; summary: string }[];
  reasoning?: {
    summary: string;
    date_label: string;
    event_summary: string;
    agreed_time_start: string;
    agreed_time_end: string;
  };
}

interface Props {
  onStep: (step: SidePanelStep, data?: Partial<DemoResponse>) => void;
  onDraftReady: (data: DemoResponse) => void;
  draftSent: boolean; // true when user clicked "Send" in side panel
  isComplete: boolean;
}

export default function ChatPhase({ onStep, onDraftReady, draftSent, isComplete }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForSend, setWaitingForSend] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  // When draftSent becomes true, mark the draft as sent
  useEffect(() => {
    if (draftSent && waitingForSend) {
      setMessages((prev) =>
        prev.map((m) => (m.isDraft ? { ...m, isDraft: false } : m)),
      );
      setWaitingForSend(false);
    }
  }, [draftSent, waitingForSend]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || isComplete || waitingForSend) return;

    trackPageEvent('demo_message_sent');

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Side panel: email received → checking calendar → drafting
    onStep('received');
    await delay(600);
    onStep('checking-calendar');
    await delay(800);
    onStep('drafting');

    try {
      // Build API messages (strip isDraft field)
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/api/v1/demo/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Request failed');
      }

      const data: DemoResponse = await res.json();

      // Add the reply as a draft (visually distinct, needs "Send" click)
      const assistantMsg: Message = { role: 'assistant', content: data.reply, isDraft: true };
      setMessages([...newMessages, assistantMsg]);
      setWaitingForSend(true);

      // Show reasoning on final message
      if (data.is_complete) {
        trackPageEvent('demo_conversation_complete');
        onStep('reasoning', data);
        await delay(1000);
      }

      onStep('draft-ready', data);
      onDraftReady(data);
    } catch (err) {
      console.error('Demo chat error:', err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "Sorry, I'm having trouble right now. Try again?" },
      ]);
      onStep('idle');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isComplete, waitingForSend, messages, onStep, onDraftReady]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Thread header */}
      <div className="rounded-t-xl border border-gray-200 bg-white px-5 py-3">
        <div className="text-xs font-medium text-gray-400">EMAIL THREAD</div>
        <div className="mt-1 text-sm font-medium text-gray-800">
          Schedule a meeting with Sam
        </div>
      </div>

      {/* Email messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center border-x border-b border-gray-200 bg-white">
            <p className="max-w-xs px-4 py-12 text-center text-sm text-gray-400">
              Type a message to start scheduling. Try something like
              &ldquo;Hey, can we grab coffee next week?&rdquo;
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`animate-fade-in border-x border-b border-gray-200 px-5 py-4 ${
              msg.isDraft ? 'bg-amber-50/50' : 'bg-white'
            }`}
            style={{ animationDelay: '50ms' }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-800">
                  {msg.role === 'user' ? 'You' : 'Sam'}
                </span>
                {msg.role === 'assistant' && (
                  <span className="text-gray-400">&lt;sam@ferganalabs.com&gt;</span>
                )}
                {msg.isDraft && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                    DRAFT
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-300">just now</span>
            </div>
            <div className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="border-x border-b border-gray-200 bg-white px-5 py-4">
            <div className="mb-2 text-xs">
              <span className="font-medium text-gray-800">Sam</span>
              <span className="ml-1.5 text-gray-400">&lt;sam@ferganalabs.com&gt;</span>
            </div>
            <TypingIndicator align="left" />
          </div>
        )}
      </div>

      {/* Compose input */}
      <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
        <div className="mb-2 text-xs text-gray-400">
          <span className="font-medium text-gray-500">To:</span> sam@ferganalabs.com
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isComplete
                ? 'Meeting booked!'
                : waitingForSend
                  ? 'Hit "Send draft" in the panel first →'
                  : 'Write your message...'
            }
            disabled={isLoading || isComplete || waitingForSend}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || isComplete || waitingForSend}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#43614a] text-white transition-all hover:bg-[#527559] disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
