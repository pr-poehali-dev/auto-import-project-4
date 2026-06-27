CREATE TABLE IF NOT EXISTS t_p64303579_auto_import_project_.containers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  container_number VARCHAR(50),
  origin VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'collecting',
  comment TEXT,
  created_by INTEGER REFERENCES t_p64303579_auto_import_project_.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p64303579_auto_import_project_.container_cars (
  id SERIAL PRIMARY KEY,
  container_id INTEGER NOT NULL REFERENCES t_p64303579_auto_import_project_.containers(id),
  car_id INTEGER NOT NULL REFERENCES t_p64303579_auto_import_project_.cars(id),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (container_id, car_id)
);

CREATE INDEX IF NOT EXISTS idx_container_cars_container ON t_p64303579_auto_import_project_.container_cars(container_id);
CREATE INDEX IF NOT EXISTS idx_container_cars_car ON t_p64303579_auto_import_project_.container_cars(car_id);