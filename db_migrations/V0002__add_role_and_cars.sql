-- Роль пользователя: client (по умолчанию) или staff (сотрудник)
ALTER TABLE t_p64303579_auto_import_project_.users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'client';

-- Автомобили, прикреплённые сотрудником к заявке клиента
CREATE TABLE IF NOT EXISTS t_p64303579_auto_import_project_.cars (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES t_p64303579_auto_import_project_.orders(id),
  car_brand VARCHAR(100),
  car_model VARCHAR(100),
  car_year INTEGER,
  price BIGINT,
  mileage INTEGER,
  description TEXT,
  photos TEXT,
  created_by INTEGER REFERENCES t_p64303579_auto_import_project_.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_order_id ON t_p64303579_auto_import_project_.cars(order_id);