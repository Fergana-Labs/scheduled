'use client';

import { Calendar } from 'lucide-react';

interface CalendarLinkProps {
  calendarId: string;
}

export default function CalendarLink({ calendarId }: CalendarLinkProps) {
  const url = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarId)}`;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
        <Calendar className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">Scheduled Calendar</p>
        <p className="mt-1 text-xs text-gray-500">
          Meetings scheduled through Scheduled are added to this calendar so your
          availability stays up to date.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-[#43614a] hover:underline"
        >
          Open in Google Calendar &rarr;
        </a>
      </div>
    </div>
  );
}
