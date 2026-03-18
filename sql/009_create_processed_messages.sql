CREATE TABLE processed_messages (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, message_id)
);

CREATE INDEX idx_processed_messages_processed_at ON processed_messages(processed_at);
