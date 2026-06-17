ALTER TABLE t_p64303579_auto_import_project_.cars
ADD COLUMN IF NOT EXISTS teardown JSONB NOT NULL DEFAULT '[]'::jsonb;