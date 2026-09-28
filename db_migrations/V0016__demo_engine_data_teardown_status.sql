-- Тестовые данные номерных агрегатов и статус «В разбор»
UPDATE cars SET engine_model = 'B48B20B', engine_number = 'B48-7729341' WHERE id = 2;
UPDATE orders SET status = 'teardown' WHERE id = (SELECT order_id FROM cars WHERE id = 2);