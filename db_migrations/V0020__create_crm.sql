-- CRM: сделки (воронка), журнал событий, задачи; Telegram менеджера для напоминаний
CREATE TABLE IF NOT EXISTS crm_deals (
    id SERIAL PRIMARY KEY,
    source_type VARCHAR(16) NOT NULL DEFAULT 'manual',
    source_id INTEGER,
    client_id INTEGER REFERENCES users(id),
    contact_name VARCHAR(255) NOT NULL DEFAULT '',
    contact_phone VARCHAR(64) NOT NULL DEFAULT '',
    title VARCHAR(255) NOT NULL,
    stage VARCHAR(16) NOT NULL DEFAULT 'new',
    manager_id INTEGER REFERENCES users(id),
    amount BIGINT,
    lost_reason TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stage_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_deals_source ON crm_deals(source_type, source_id) WHERE source_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_deals_client ON crm_deals(client_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_manager ON crm_deals(manager_id);

CREATE TABLE IF NOT EXISTS crm_events (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES crm_deals(id),
    author_id INTEGER REFERENCES users(id),
    kind VARCHAR(16) NOT NULL DEFAULT 'comment',
    text TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_events_deal ON crm_events(deal_id, created_at DESC);

CREATE TABLE IF NOT EXISTS crm_tasks (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES crm_deals(id),
    client_id INTEGER REFERENCES users(id),
    assignee_id INTEGER REFERENCES users(id),
    author_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    done_at TIMESTAMPTZ,
    reminded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_due ON crm_tasks(done, due_at);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_deal ON crm_tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assignee ON crm_tasks(assignee_id, done);

ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(32) NOT NULL DEFAULT '';