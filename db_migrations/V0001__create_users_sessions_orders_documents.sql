
CREATE TABLE IF NOT EXISTS t_p64303579_auto_import_project_.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  company VARCHAR(255),
  inn VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p64303579_auto_import_project_.sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p64303579_auto_import_project_.users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p64303579_auto_import_project_.orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p64303579_auto_import_project_.users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  car_brand VARCHAR(100),
  car_model VARCHAR(100),
  car_year INTEGER,
  quantity INTEGER DEFAULT 1,
  budget BIGINT,
  comment TEXT,
  status VARCHAR(50) DEFAULT 'new',
  origin VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p64303579_auto_import_project_.documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p64303579_auto_import_project_.users(id),
  order_id INTEGER REFERENCES t_p64303579_auto_import_project_.orders(id),
  filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER,
  doc_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
