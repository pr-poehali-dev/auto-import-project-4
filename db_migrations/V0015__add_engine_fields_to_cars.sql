-- Номерные агрегаты: модель и номер ДВС в карточке машины
ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_model VARCHAR(64);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_number VARCHAR(64);