'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import TypingIndicator from './TypingIndicator';
import CalendarDayView from './CalendarDayView';
import MeetingConfirmed from './MeetingConfirmed';
import { trackPageEvent } from '@/lib/analytics';
import type { SidePanelStep } from './SidePanel';

const API_BASE = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;

interface MaskedEvent {
  start: string;
  end: string;
  summary: string;
}

interface ReasoningData {
  summary: string;
  date_label: string;
}

export interface DemoResponse {
  reply: string;
  is_complete: boolean;
  events?: MaskedEvent[];
  reasoning?: ReasoningData;
  event_summary?: string;
  agreed_time_start?: string;
  agreed_time_end?: string;
}

type MessageType = 'user' | 'assistant' | 'reasoning' | 'confirmation';

interface Message {
  type: MessageType;
  content: string;
  isDraft?: boolean;
  events?: MaskedEvent[];
  reasoning?: ReasoningData;
  // For confirmation card
  eventSummary?: string;
  agreedTimeStart?: string;
  agreedTimeEnd?: string;
}

interface Props {
  onStep: (step: SidePanelStep, data?: Partial<DemoResponse>) => void;
  onDraftReady: (data: DemoResponse) => void;
  draftSent: boolean;
  isComplete: boolean;
  autopilot: boolean;
}

export default function ChatPhase({ onStep, onDraftReady, draftSent, isComplete, autopilot }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForSend, setWaitingForSend] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const exchangeRef = useRef(0);
  const latestResponseRef = useRef<DemoResponse | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle draft sent (manual or autopilot)
  useEffect(() => {
    if (draftSent && waitingForSend) {
      setMessages((prev) =>
        prev.map((m) => (m.isDraft ? { ...m, isDraft: false } : m)),
      );
      setWaitingForSend(false);

      // If conversation is complete, insert confirmation card
      const resp = latestResponseRef.current;
      if (resp?.is_complete && resp.agreed_time_start && resp.agreed_time_end) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              type: 'confirmation',
              content: '',
              eventSummary: resp.event_summary || 'Meeting',
              agreedTimeStart: resp.agreed_time_start,
              agreedTimeEnd: resp.agreed_time_end,
            },
          ]);
        }, 800);
      }
    }
  }, [draftSent, waitingForSend]);

  // Autopilot: auto-send after 1.5s
  useEffect(() => {
    if (autopilot && waitingForSend && !draftSent) {
      const timer = setTimeout(() => {
        onStep('sent');
        // Simulate the send
        setMessages((prev) =>
          prev.map((m) => (m.isDraft ? { ...m, isDraft: false } : m)),
        );
        setWaitingForSend(false);

        const resp = latestResponseRef.current;
        if (resp?.is_complete && resp.agreed_time_start && resp.agreed_time_end) {
          setTimeout(() => {
            onStep('complete');
            setMessages((prev) => [
              ...prev,
              {
                type: 'confirmation',
                content: '',
                eventSummary: resp.event_summary || 'Meeting',
                agreedTimeStart: resp.agreed_time_start,
                agreedTimeEnd: resp.agreed_time_end,
              },
            ]);
          }, 800);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autopilot, waitingForSend, draftSent, onStep]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || isComplete || waitingForSend) return;

    trackPageEvent('demo_message_sent');

    const userMsg: Message = { type: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    onStep('received');
    await delay(600);
    onStep('checking-calendar');
    await delay(800);
    onStep('drafting');

    try {
      // Strip non-chat messages before sending to API
      const apiMessages = newMessages
        .filter((m) => m.type === 'user' || m.type === 'assistant')
        .map((m) => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));

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
      latestResponseRef.current = data;
      exchangeRef.current += 1;

      const newMsgs: Message[] = [];

      // First exchange: insert reasoning email before the draft
      if (exchangeRef.current === 1 && data.events && data.reasoning) {
        newMsgs.push({
          type: 'reasoning',
          content: data.reasoning.summary,
          events: data.events,
          reasoning: data.reasoning,
        });
      }

      // The draft reply
      newMsgs.push({
        type: 'assistant',
        content: data.reply,
        isDraft: true,
      });

      setMessages((prev) => [...prev, ...newMsgs]);
      setWaitingForSend(true);

      if (data.is_complete) {
        trackPageEvent('demo_conversation_complete');
        onStep('reasoning', data);
        await delay(1000);
      }

      onStep('draft-ready', data);
      onDraftReady(data);
    } catch (err) {
      console.error('Demo chat error:', err);
      setMessages((prev) => [
        ...prev,
        { type: 'assistant', content: "Sorry, I'm having trouble right now. Try again?" },
      ]);
      onStep('idle');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isComplete, waitingForSend, messages, onStep, onDraftReady, autopilot]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Thread header */}
      <div className="border-b border-gray-200 px-5 py-3">
        <div className="text-sm font-semibold text-gray-900">
          Let&apos;s set up time to chat about Scheduled
        </div>
        <div className="mt-0.5 text-xs text-gray-400">
          To: sam@ferganalabs.com
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center px-6">
            <p className="max-w-xs text-center text-sm leading-relaxed text-gray-400">
              Type a message to start scheduling a virtual meeting with Sam.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.type === 'reasoning') {
            return (
              <div key={i} className="border-b border-gray-100 border-l-2 border-l-[#43614a] bg-[#43614a]/[0.03] px-5 py-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-[#43614a]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#43614a]">
                    INTERNAL
                  </span>
                  <span className="font-medium text-gray-600">Scheduled</span>
                  <span className="text-gray-400">&lt;internal@tryscheduled.com&gt;</span>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-gray-600">
                  <p>Scheduled drafted a reply in this thread.</p>
                  <p className="mt-2">
                    <span className="text-gray-400">Why:</span> {msg.content}
                  </p>
                </div>
                {msg.events && msg.reasoning && (
                  <CalendarDayView
                    events={msg.events}
                    dateLabel={msg.reasoning.date_label}
                  />
                )}
              </div>
            );
          }

          if (msg.type === 'confirmation') {
            return (
              <div key={i} className="border-b border-gray-100">
                <MeetingConfirmed
                  eventSummary={msg.eventSummary || 'Meeting'}
                  agreedTimeStart={msg.agreedTimeStart || ''}
                  agreedTimeEnd={msg.agreedTimeEnd || ''}
                />
              </div>
            );
          }

          // user or assistant
          return (
            <div
              key={i}
              className={`border-b border-gray-100 px-5 py-4 ${
                msg.isDraft ? 'bg-amber-50/40' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-900">
                    {msg.type === 'user' ? 'You' : 'Sam'}
                  </span>
                  {msg.type === 'assistant' && (
                    <span className="text-gray-400">&lt;sam@ferganalabs.com&gt;</span>
                  )}
                  {msg.isDraft && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                      DRAFT
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-300">just now</span>
              </div>
              <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-900">Sam</span>
              <span className="text-gray-400">&lt;sam@ferganalabs.com&gt;</span>
            </div>
            <div className="mt-2">
              <TypingIndicator align="left" />
            </div>
          </div>
        )}
      </div>

      {/* Compose area */}
      <div className="border-t border-gray-200 px-5 py-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isComplete
              ? 'Meeting booked!'
              : waitingForSend && !autopilot
                ? 'Hit "Send draft" in the panel first'
                : 'Hey, I\'d love to set up a meeting to learn more about Scheduled...'
          }
          disabled={isLoading || isComplete || (waitingForSend && !autopilot)}
          rows={2}
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-gray-400">
            To: sam@ferganalabs.com
          </span>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || isComplete || (waitingForSend && !autopilot)}
            className="inline-flex items-center gap-1.5 rounded bg-[#43614a] px-3 py-1 text-xs font-medium text-white transition-all hover:bg-[#527559] disabled:opacity-40"
          >
            <Send className="h-3 w-3" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
