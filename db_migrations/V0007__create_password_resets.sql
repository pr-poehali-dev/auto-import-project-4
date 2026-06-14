CREATE TABLE IF NOT EXISTS t_p64303579_auto_import_project_.password_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    expires_at TIMESTAMP NOT NULL DEFAULT (now() + '00:15:00'::interval)
);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON t_p64303579_auto_import_project_.password_resets (email);