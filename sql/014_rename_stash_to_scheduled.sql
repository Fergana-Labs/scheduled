-- Rename "stash" columns to "scheduled" for naming consistency.
ALTER TABLE users RENAME COLUMN stash_calendar_id TO scheduled_calendar_id;
ALTER TABLE users RENAME COLUMN stash_branding_enabled TO scheduled_branding_enabled;
