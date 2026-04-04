CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS software (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    url             TEXT NOT NULL,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('github', 'scrape', 'rss')),
    check_interval  VARCHAR(20) NOT NULL DEFAULT 'daily'
                        CHECK (check_interval IN ('hourly', 'daily', 'weekly')),
    css_selector    TEXT,
    last_version    VARCHAR(255),
    latest_found    VARCHAR(255),
    last_checked_at TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id          SERIAL PRIMARY KEY,
    software_id INTEGER NOT NULL REFERENCES software(id) ON DELETE CASCADE,
    message     TEXT NOT NULL,
    old_version VARCHAR(255),
    new_version VARCHAR(255),
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_software_id ON notifications(software_id);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          SERIAL PRIMARY KEY,
    endpoint    TEXT NOT NULL UNIQUE,
    p256dh      TEXT NOT NULL,
    auth        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
    ('telegram_bot_token',  NULL),
    ('telegram_chat_id',    NULL),
    ('vapid_public_key',    NULL),
    ('vapid_private_key',   NULL),
    ('vapid_subject',       'mailto:admin@example.com'),
    ('notify_telegram',     'false'),
    ('notify_webpush',      'false'),
    ('notify_inapp',        'true')
ON CONFLICT (key) DO NOTHING;
