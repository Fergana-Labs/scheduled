-- Track consecutive OAuth refresh failures to avoid marking users as
-- needing re-auth on transient Google errors.  Only mark failed after
-- N consecutive failures across separate webhook/watch-renewal cycles.
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_failures integer NOT NULL DEFAULT 0;
