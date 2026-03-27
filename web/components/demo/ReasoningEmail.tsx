'use client';

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';

interface MaskedEvent {
  start: string;
  end: string;
  summary: string; // always "Blocked"
}

interface ReasoningData {
  summary: string;
  date_label: string;
  event_summary: string;
  agreed_time_start: string;
  agreed_time_end: string;
}

interface Props {
  events: MaskedEvent[];
  reasoning: ReasoningData;
  userEmail?: string;
}

function formatTime(iso: string): string {
  try {
    const dt = new Date(iso);
    return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  try {
    const dt = new Date(iso);
    return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function ReasoningEmail({ events, reasoning, userEmail = 'sam@ferganalabs.com' }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const agreedStart = formatTime(reasoning.agreed_time_start);
  const agreedEnd = formatTime(reasoning.agreed_time_end);
  const agreedDate = formatDate(reasoning.agreed_time_start);

  return (
    <div
      className={`w-full transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
        <Mail className="h-4 w-4" />
        Reasoning Email
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Email header */}
        <div className="border-b border-gray-100 px-5 py-3 text-xs text-gray-500">
          <div>
            <span className="text-gray-400">From:</span>{' '}
            Scheduled &lt;internal@tryscheduled.com&gt;
          </div>
          <div>
            <span className="text-gray-400">To:</span> {userEmail}
          </div>
          <div>
            <span className="text-gray-400">Subject:</span>{' '}
            <span className="text-gray-700">Re: {reasoning.event_summary}</span>
          </div>
        </div>

        {/* Email body */}
        <div className="space-y-3 px-5 py-4 font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-gray-700">
          <p>Scheduled drafted a reply in this thread.</p>

          <p>
            <span className="text-gray-400">Why:</span> {reasoning.summary}
          </p>

          <div>
            <p className="mb-1">Your meetings on {reasoning.date_label}:</p>
            {events.length === 0 ? (
              <p className="pl-3 text-gray-400">No other meetings</p>
            ) : (
              <div className="space-y-0.5">
                {events.map((ev, i) => (
                  <div
                    key={i}
                    className="rounded py-0.5 pl-3 text-gray-600"
                  >
                    {ev.start} – {ev.end}: {ev.summary}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border-l-2 border-[#43614a] bg-[#43614a]/5 py-2 pl-3 pr-2">
            <p className="mb-1 font-medium text-gray-800">Calendar invite:</p>
            <p className="text-gray-500">
              When you send this draft, Scheduled will create a calendar invite:
            </p>
            <div className="mt-1 space-y-0.5 pl-2 text-gray-600">
              <div>- What: {reasoning.event_summary}</div>
              <div>- When: {agreedStart} – {agreedEnd} on {agreedDate}</div>
            </div>
            <p className="mt-1 text-gray-400">
              An agent will verify your sent message still confirms the meeting
              before sending the invite.
            </p>
          </div>

          <p className="text-gray-400">— Scheduled</p>
        </div>
      </div>
    </div>
  );
}
