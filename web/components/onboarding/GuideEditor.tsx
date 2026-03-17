'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { api } from '@/lib/api';

interface GuideEditorProps {
  name: string;
  label: string;
  initialContent: string;
}

export default function GuideEditor({ name, label, initialContent }: GuideEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [draft, setDraft] = useState(initialContent);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api(`/web/api/v1/guides/${encodeURIComponent(name)}`, {
        method: 'PUT',
        body: JSON.stringify({ content: draft }),
      });
      setContent(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setDraft(content);
    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 focus:border-[#43614a] focus:outline-none focus:ring-1 focus:ring-[#43614a]"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={cancel}
              className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-[#43614a] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#527559] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </>
      ) : (
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-600">
          {content}
        </p>
      )}
    </div>
  );
}
