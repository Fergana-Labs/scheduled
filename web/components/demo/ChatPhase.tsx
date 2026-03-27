'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import { trackPageEvent } from '@/lib/analytics';
import type { SidePanelStep } from './SidePanel';

const API_BASE = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DemoResponse {
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
  isComplete: boolean;
}

export default function ChatPhase({ onStep, isComplete }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || isComplete) return;

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
      const res = await fetch(`${API_BASE}/api/v1/demo/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Request failed');
      }

      const data: DemoResponse = await res.json();
      const assistantMsg: Message = { role: 'assistant', content: data.reply };
      const updatedMessages = [...newMessages, assistantMsg];
      setMessages(updatedMessages);

      if (data.is_complete) {
        trackPageEvent('demo_conversation_complete');
        // Walk through the remaining steps with the data
        onStep('reasoning', data);
        await delay(1200);
        onStep('draft-ready', data);
        await delay(1500);
        onStep('sent', data);
        await delay(1200);
        onStep('complete', data);
      } else {
        // Reset side panel for next exchange
        onStep('draft-ready', data);
      }
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Thread header */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div className="text-xs font-medium text-gray-400">EMAIL THREAD</div>
        <div className="mt-1 text-sm text-gray-700">
          Schedule a meeting with Sam
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="max-w-xs text-center text-sm text-gray-400">
              Type a message to start scheduling. Try something like
              &ldquo;Hey, can we grab coffee next week?&rdquo;
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            text={msg.content}
            align={msg.role === 'user' ? 'left' : 'right'}
            label={msg.role === 'user' ? 'You' : 'Sam'}
            animate
          />
        ))}
        {isLoading && <TypingIndicator align="right" />}
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isComplete ? 'Conversation complete' : 'Type a scheduling message...'}
          disabled={isLoading || isComplete}
          className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-[#43614a] disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading || isComplete}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#43614a] text-white transition-all hover:bg-[#527559] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
