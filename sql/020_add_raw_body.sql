-- Store pre-anonymization body for accurate diff comparison
ALTER TABLE composed_drafts ADD COLUMN IF NOT EXISTS raw_body TEXT;
