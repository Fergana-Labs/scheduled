-- Add soft-delete column for auto-deleted drafts (preserves analytics data)
ALTER TABLE composed_drafts ADD COLUMN auto_deleted_at TIMESTAMPTZ;

CREATE INDEX idx_composed_drafts_auto_deleted ON composed_drafts (auto_deleted_at)
    WHERE auto_deleted_at IS NOT NULL;
