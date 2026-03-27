'use client';

import { useEffect, useState } from 'react';
import { Inbox, Calendar, FileEdit, Mail, Send, CheckCircle, Loader2, CalendarCheck, Zap } from 'lucide-react';

export type SidePanelStep =
  | 'idle'
  | 'received'
  | 'checking-calendar'
  | 'drafting'
  | 'reasoning'
  | 'draft-ready'
  | 'sent'
  | 'complete';

interface Props {
  step: SidePanelStep;
  onSendDraft?: () => void;
  autopilot?: boolean;
}

interface StepInfo {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  complete: boolean;
}

const STEP_ORDER: SidePanelStep[] = [
  'received',
  'checking-calendar',
  'drafting',
  'reasoning',
  'draft-ready',
  'sent',
  'complete',
];

export default function SidePanel({ step, onSendDraft, autopilot }: Props) {
  const [visibleSteps, setVisibleSteps] = useState<SidePanelStep[]>([]);

  useEffect(() => {
    if (step === 'idle') {
      setVisibleSteps([]);
      return;
    }
    const idx = STEP_ORDER.indexOf(step);
    if (idx >= 0) {
      setVisibleSteps(STEP_ORDER.slice(0, idx + 1));
    }
  }, [step]);

  if (step === 'idle') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#43614a]/10">
            <Mail className="h-5 w-5 text-[#43614a]" />
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Send a message to see how
            <br />
            Scheduled works behind the scenes.
          </p>
        </div>
      </div>
    );
  }

  const steps: Record<SidePanelStep, StepInfo> = {
    idle: { icon: null, title: '', description: '', active: false, complete: false },
    received: {
      icon: <Inbox className="h-4 w-4" />,
      title: 'Email received',
      description: 'Scheduled detected a new scheduling email.',
      active: step === 'received',
      complete: STEP_ORDER.indexOf(step) > 0,
    },
    'checking-calendar': {
      icon: <Calendar className="h-4 w-4" />,
      title: 'Checking calendar',
      description: 'Reading Sam\'s calendar for available slots...',
      active: step === 'checking-calendar',
      complete: STEP_ORDER.indexOf(step) > 1,
    },
    drafting: {
      icon: <FileEdit className="h-4 w-4" />,
      title: 'Drafting reply',
      description: 'Writing a reply as Sam.',
      active: step === 'drafting',
      complete: STEP_ORDER.indexOf(step) > 2,
    },
    reasoning: {
      icon: <Mail className="h-4 w-4" />,
      title: 'Reasoning email sent',
      description: 'Sam gets an internal email explaining the draft.',
      active: step === 'reasoning',
      complete: STEP_ORDER.indexOf(step) > 3,
    },
    'draft-ready': {
      icon: <Send className="h-4 w-4" />,
      title: 'Draft ready',
      description: autopilot ? 'Auto-sending...' : 'Waiting for Sam to hit send.',
      active: step === 'draft-ready',
      complete: STEP_ORDER.indexOf(step) > 4,
    },
    sent: {
      icon: <CheckCircle className="h-4 w-4" />,
      title: 'Reply sent',
      description: 'Sam sent the reply.',
      active: step === 'sent',
      complete: STEP_ORDER.indexOf(step) > 5,
    },
    complete: {
      icon: <CalendarCheck className="h-4 w-4" />,
      title: 'Invite sent',
      description: 'Calendar invite created for both parties.',
      active: step === 'complete',
      complete: false,
    },
  };

  return (
    <div className="space-y-5">
      <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
        What Scheduled is doing
      </div>

      {/* Step timeline */}
      <div className="space-y-1">
        {visibleSteps.map((s, i) => {
          const info = steps[s];
          const isLast = i === visibleSteps.length - 1;
          return (
            <div key={s} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                    info.active
                      ? 'bg-[#43614a] text-white'
                      : info.complete
                        ? 'bg-[#43614a]/15 text-[#43614a]'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {info.active && !info.complete && s !== 'complete' && s !== 'sent' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    info.icon
                  )}
                </div>
                {!isLast && <div className="my-1 h-5 w-px bg-gray-200" />}
              </div>
              <div className="min-w-0 pb-2 pt-0.5">
                <div
                  className={`text-sm font-medium ${
                    info.active ? 'text-gray-900' : info.complete ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {info.title}
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-gray-400">
                  {info.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Autopilot callout — shown after first reply is sent */}
      {autopilot && step === 'sent' && (
        <div className="flex items-start gap-2 rounded-lg bg-[#43614a]/5 px-3 py-2.5">
          <Zap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#43614a]" />
          <div className="text-xs leading-relaxed text-gray-600">
            <span className="font-medium text-[#43614a]">Autopilot enabled.</span>{' '}
            Scheduled will automatically send replies as they&apos;re drafted.
          </div>
        </div>
      )}

      {/* Send draft button — only when not on autopilot */}
      {step === 'draft-ready' && onSendDraft && !autopilot && (
        <button
          onClick={onSendDraft}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#43614a] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#527559] active:scale-[0.98]"
        >
          <Send className="h-3.5 w-3.5" />
          Send draft from Sam
        </button>
      )}
    </div>
  );
}
