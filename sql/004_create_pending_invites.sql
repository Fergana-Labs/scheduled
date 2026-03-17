CREATE TABLE IF NOT EXISTS pending_invites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    thread_id       TEXT NOT NULL,
    attendee_email  TEXT NOT NULL,
    event_summary   TEXT NOT NULL,
    event_start     TIMESTAMP NOT NULL,
    event_end       TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(user_id, thread_id)
);
