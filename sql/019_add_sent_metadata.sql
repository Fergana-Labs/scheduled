-- Store metadata about which message triggered the "sent" detection
ALTER TABLE composed_drafts ADD COLUMN IF NOT EXISTS sent_message_sender TEXT;
ALTER TABLE composed_drafts ADD COLUMN IF NOT EXISTS sent_message_id TEXT;
ALTER TABLE composed_drafts ADD COLUMN IF NOT EXISTS sent_similarity FLOAT;
