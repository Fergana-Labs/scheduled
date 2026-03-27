'use client';

interface CalendarEvent {
  start: string; // ISO8601
  end: string;
  summary: string;
}

interface Props {
  events: CalendarEvent[];
  proposedTimes?: { start: string; end: string }[];
  dateLabel: string;
}

const START_HOUR = 8;
const END_HOUR = 19;
const HOUR_HEIGHT = 28;
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

function timeToOffset(iso: string): number {
  const dt = new Date(iso);
  const hours = dt.getHours() + dt.getMinutes() / 60;
  const clamped = Math.max(START_HOUR, Math.min(END_HOUR, hours));
  return ((clamped - START_HOUR) / (END_HOUR - START_HOUR)) * TOTAL_HEIGHT;
}

function timeToHeight(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startHours = Math.max(START_HOUR, start.getHours() + start.getMinutes() / 60);
  const endHours = Math.min(END_HOUR, end.getHours() + end.getMinutes() / 60);
  return Math.max(4, ((endHours - startHours) / (END_HOUR - START_HOUR)) * TOTAL_HEIGHT);
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 12) return '12';
  return String(hour > 12 ? hour - 12 : hour);
}

export default function CalendarDayView({ events, proposedTimes, dateLabel }: Props) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <div className="mt-3 mb-1">
      <div className="mb-2 text-[11px] font-medium text-gray-500">{dateLabel}</div>
      <div className="relative flex" style={{ height: TOTAL_HEIGHT }}>
        {/* Time labels */}
        <div className="w-10 flex-shrink-0">
          {hours.map((h) => (
            <div
              key={h}
              className="absolute text-[10px] leading-none text-gray-400"
              style={{ top: ((h - START_HOUR) / (END_HOUR - START_HOUR)) * TOTAL_HEIGHT - 5 }}
            >
              {formatHour(h)}{h < 12 ? 'a' : 'p'}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="relative flex-1 rounded border border-gray-200 bg-gray-50/50">
          {/* Hour gridlines */}
          {hours.map((h) => (
            <div
              key={h}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: ((h - START_HOUR) / (END_HOUR - START_HOUR)) * TOTAL_HEIGHT }}
            />
          ))}

          {/* Blocked events */}
          {events.map((ev, i) => (
            <div
              key={i}
              className="absolute left-1 right-1 overflow-hidden rounded-sm bg-gray-200/70 px-1.5 py-0.5"
              style={{
                top: timeToOffset(ev.start),
                height: timeToHeight(ev.start, ev.end),
              }}
            >
              <span className="text-[9px] font-medium text-gray-500">{ev.summary}</span>
            </div>
          ))}

          {/* Proposed times */}
          {proposedTimes?.map((t, i) => (
            <div
              key={`p-${i}`}
              className="absolute left-1 right-1 overflow-hidden rounded-sm border border-[#43614a] bg-[#43614a]/10 px-1.5 py-0.5"
              style={{
                top: timeToOffset(t.start),
                height: timeToHeight(t.start, t.end),
              }}
            >
              <span className="text-[9px] font-medium text-[#43614a]">Proposed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
