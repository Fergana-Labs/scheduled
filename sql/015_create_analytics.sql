-- Generic event log for all engagement tracking
CREATE TABLE analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event ON analytics_events(event);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

-- Stores anonymized thread context + original/sent draft for change detection
CREATE TABLE composed_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thread_id TEXT NOT NULL,
    draft_id TEXT NOT NULL,
    thread_context JSONB NOT NULL DEFAULT '[]',
    original_subject TEXT NOT NULL DEFAULT '',
    original_body TEXT NOT NULL DEFAULT '',
    sent_body TEXT,
    was_autopilot BOOLEAN NOT NULL DEFAULT FALSE,
    was_edited BOOLEAN,
    edit_distance_ratio FLOAT,
    chars_added INT,
    chars_removed INT,
    composed_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ
);
CREATE INDEX idx_composed_drafts_user_thread ON composed_drafts(user_id, thread_id);
CREATE INDEX idx_composed_drafts_composed_at ON composed_drafts(composed_at);
