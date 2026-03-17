'use client';

import AutopilotToggle from './AutopilotToggle';
import GuideEditor from './GuideEditor';
import CalendarLink from './CalendarLink';
import BrandingToggle from './BrandingToggle';
import DisconnectButton from './DisconnectButton';

interface Guide {
  name: string;
  content: string;
  updated_at: string;
}

interface ReadyStateProps {
  autopilotEnabled: boolean;
  brandingEnabled: boolean;
  calendarId: string | null;
  guides: Guide[];
}

export default function ReadyState({
  autopilotEnabled,
  brandingEnabled,
  calendarId,
  guides,
}: ReadyStateProps) {
  const schedulingGuide = guides.find((g) => g.name === 'scheduling_preferences');
  const emailGuide = guides.find((g) => g.name === 'email_style');

  return (
    <div className="space-y-3">
      <AutopilotToggle initialEnabled={autopilotEnabled} />

      {schedulingGuide && (
        <GuideEditor
          name="scheduling_preferences"
          label="Scheduling Preferences"
          initialContent={schedulingGuide.content}
        />
      )}

      {emailGuide && (
        <GuideEditor
          name="email_style"
          label="Email Style"
          initialContent={emailGuide.content}
        />
      )}

      {calendarId && <CalendarLink calendarId={calendarId} />}

      <BrandingToggle initialEnabled={brandingEnabled} />

      <div className="pt-4">
        <DisconnectButton />
      </div>
    </div>
  );
}
