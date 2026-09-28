-- Запросы наличия автозапчастей (направление Китай)
CREATE TABLE IF NOT EXISTS parts_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    origin VARCHAR(32) NOT NULL DEFAULT 'china',
    category_id VARCHAR(32) NOT NULL,
    category_title VARCHAR(128) NOT NULL,
    car_brand VARCHAR(64) NOT NULL,
    car_model VARCHAR(64),
    car_year INTEGER,
    vin VARCHAR(32),
    parts_text TEXT,
    comment TEXT,
    status VARCHAR(24) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parts_requests_user ON parts_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_parts_requests_status ON parts_requests(status, created_at DESC);