'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import { trackPageEvent } from '@/lib/analytics';

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
  onComplete: (data: {
    messages: Message[];
    events: DemoResponse['events'];
    reasoning: DemoResponse['reasoning'];
    lastReply: string;
  }) => void;
}

export default function ChatPhase({ onComplete }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    trackPageEvent('demo_message_sent');

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

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
        setTimeout(() => {
          onComplete({
            messages: updatedMessages,
            events: data.events,
            reasoning: data.reasoning,
            lastReply: data.reply,
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Demo chat error:', err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "Sorry, I'm having trouble right now. Try again?" },
      ]);
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
    <div className="mx-auto flex h-[min(600px,70vh)] w-full max-w-lg flex-col">
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
            label={msg.role === 'user' ? 'You' : 'Scheduled (for Sam)'}
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
          placeholder="Type a scheduling message..."
          disabled={isLoading}
          className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-[#43614a] disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#43614a] text-white transition-all hover:bg-[#527559] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
