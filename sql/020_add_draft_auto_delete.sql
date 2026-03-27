-- Auto-delete stale drafts after 48 hours (user-togglable, default on)
ALTER TABLE users ADD COLUMN IF NOT EXISTS draft_auto_delete_enabled BOOLEAN NOT NULL DEFAULT TRUE;
