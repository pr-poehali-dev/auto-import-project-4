-- Схемы узлов (иллюстрации) для каталогов направления Китай
CREATE TABLE IF NOT EXISTS parts_schemes (
    id SERIAL PRIMARY KEY,
    catalog_id VARCHAR(32) NOT NULL,
    model VARCHAR(64) NOT NULL DEFAULT '',
    title VARCHAR(160) NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parts_schemes_catalog ON parts_schemes(catalog_id, model, sort_order);

-- Артикулы к схеме: номер позиции на рисунке совпадает с pos
CREATE TABLE IF NOT EXISTS parts_scheme_items (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER NOT NULL REFERENCES parts_schemes(id),
    pos VARCHAR(16) NOT NULL DEFAULT '',
    article VARCHAR(64) NOT NULL DEFAULT '',
    name VARCHAR(255) NOT NULL DEFAULT '',
    qty INTEGER NOT NULL DEFAULT 1,
    note VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_parts_scheme_items_scheme ON parts_scheme_items(scheme_id, sort_order);