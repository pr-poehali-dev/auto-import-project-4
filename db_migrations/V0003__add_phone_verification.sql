-- Флаг подтверждения телефона у пользователя
ALTER TABLE t_p64303579_auto_import_project_.users
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Коды подтверждения телефона
CREATE TABLE IF NOT EXISTS t_p64303579_auto_import_project_.phone_codes (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) NOT NULL,
  code VARCHAR(10) NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes')
);

CREATE INDEX IF NOT EXISTS idx_phone_codes_phone ON t_p64303579_auto_import_project_.phone_codes(phone);