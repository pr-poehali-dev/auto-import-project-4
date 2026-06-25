INSERT INTO t_p64303579_auto_import_project_.users (email, password_hash, full_name, role, phone_verified)
VALUES (
  'autodom777msk@yahoo.com',
  encode(sha256('425125'::bytea), 'hex'),
  'Autodom',
  'client',
  TRUE
);