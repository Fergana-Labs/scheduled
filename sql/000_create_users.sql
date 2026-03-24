CREATE TABLE IF NOT EXISTS users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   TEXT NOT NULL UNIQUE,
    google_refresh_token    TEXT NOT NULL,
    google_access_token     TEXT,
    access_token_expires_at TIMESTAMP,
    scheduled_calendar_id       TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);
