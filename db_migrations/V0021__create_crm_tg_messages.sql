-- Сообщения Telegram, привязанные к сделке: чтобы обновлять статус и кнопки во всех чатах
CREATE TABLE IF NOT EXISTS crm_tg_messages (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES crm_deals(id),
    chat_id VARCHAR(32) NOT NULL,
    message_id BIGINT NOT NULL,
    base_text TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_tg_messages ON crm_tg_messages(chat_id, message_id);
CREATE INDEX IF NOT EXISTS idx_crm_tg_messages_deal ON crm_tg_messages(deal_id);