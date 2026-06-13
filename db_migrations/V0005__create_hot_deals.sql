CREATE TABLE t_p64303579_auto_import_project_.hot_deals (
    id SERIAL PRIMARY KEY,
    origin VARCHAR(50) NOT NULL DEFAULT 'hongkong',
    brand VARCHAR(100) NOT NULL DEFAULT '',
    model VARCHAR(150) NOT NULL DEFAULT '',
    year INTEGER,
    mileage VARCHAR(50) NOT NULL DEFAULT '',
    engine VARCHAR(80) NOT NULL DEFAULT '',
    price VARCHAR(80) NOT NULL DEFAULT '',
    badge VARCHAR(50) NOT NULL DEFAULT '',
    photo TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hot_deals_origin ON t_p64303579_auto_import_project_.hot_deals(origin);

INSERT INTO t_p64303579_auto_import_project_.hot_deals (origin, brand, model, year, mileage, engine, price, badge, sort_order) VALUES
('hongkong', 'BMW', 'X5 xDrive40i', 2021, '32 000 км', '3.0 бензин', 'от 4 250 000 ₽', 'Хит', 1),
('hongkong', 'Mercedes-Benz', 'GLE 350d 4MATIC', 2020, '48 000 км', '3.0 дизель', 'от 3 980 000 ₽', '-12%', 2),
('hongkong', 'Audi', 'Q7 55 TFSI quattro', 2021, '27 500 км', '3.0 бензин', 'от 4 100 000 ₽', 'Хит', 3),
('hongkong', 'Porsche', 'Cayenne S', 2019, '61 000 км', '2.9 бензин', 'от 5 350 000 ₽', 'Премиум', 4),
('hongkong', 'Land Rover', 'Range Rover Velar', 2020, '39 000 км', '2.0 дизель', 'от 3 650 000 ₽', '-8%', 5),
('hongkong', 'Volkswagen', 'Touareg R-Line', 2021, '24 000 км', '3.0 дизель', 'от 3 290 000 ₽', 'Новинка', 6);