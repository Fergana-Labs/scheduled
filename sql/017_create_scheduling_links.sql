-- Scheduling links for "Find a Time" feature
CREATE TABLE scheduling_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thread_id TEXT,
    mode TEXT NOT NULL DEFAULT 'availability',
    attendee_email TEXT NOT NULL,
    attendee_name TEXT,
    event_summary TEXT NOT NULL DEFAULT 'Meeting',
    duration_minutes INT NOT NULL DEFAULT 30,
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    suggested_windows JSONB NOT NULL DEFAULT '[]',
    recipient_availability JSONB,
    recipient_submitted_at TIMESTAMPTZ,
    confirmed_time_start TIMESTAMPTZ,
    confirmed_time_end TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    calendar_event_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    add_google_meet BOOLEAN NOT NULL DEFAULT FALSE,
    location TEXT NOT NULL DEFAULT '',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '14 days',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduling_links_user ON scheduling_links(user_id);
CREATE INDEX idx_scheduling_links_status ON scheduling_links(status);
