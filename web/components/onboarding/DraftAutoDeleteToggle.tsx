'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { track } from '@/lib/analytics';

interface DraftAutoDeleteToggleProps {
  initialEnabled: boolean;
}

export default function DraftAutoDeleteToggle({ initialEnabled }: DraftAutoDeleteToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    try {
      await api('/web/api/v1/settings/draft-auto-delete', {
        method: 'PUT',
        body: JSON.stringify({ enabled: next }),
      });
      track('setting_changed', { setting: 'draft_auto_delete_enabled', new_value: next });
    } catch {
      setEnabled(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
      <div>
        <p className="text-sm font-medium text-gray-900">Auto-delete stale drafts</p>
        <p className="mt-1 text-xs text-gray-500">
          Automatically delete drafts created by Scheduled that haven&apos;t been
          sent after 48 hours.
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          enabled ? 'bg-[#43614a]' : 'bg-gray-200'
        } ${saving ? 'opacity-50' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
