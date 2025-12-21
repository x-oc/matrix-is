-- Полная очистка схемы базы данных

-- УДАЛЕНИЕ ТРИГГЕРОВ
DROP TRIGGER IF EXISTS trg_escalate_mass_glitch ON tickets_units;
DROP TRIGGER IF EXISTS trg_create_candidate ON units;

-- УДАЛЕНИЕ ФУНКЦИЙ
DROP FUNCTION IF EXISTS escalate_mass_glitch() CASCADE;
DROP FUNCTION IF EXISTS create_candidate() CASCADE;
DROP FUNCTION IF EXISTS create_glitch_ticket_manual(TEXT, TEXT, INTEGER, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS request_oracle_prediction(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS generate_daily_report(TIMESTAMP, TIMESTAMP) CASCADE;
DROP FUNCTION IF EXISTS select_chosen_one(INTEGER, INTEGER, INTEGER) CASCADE;

-- УДАЛЕНИЕ ПРОЦЕДУР
DROP PROCEDURE IF EXISTS assign_ticket(INTEGER, TEXT);
DROP PROCEDURE IF EXISTS process_oracle_prediction(INTEGER, TEXT);
DROP PROCEDURE IF EXISTS initiate_system_audit(INTEGER, INTEGER);

-- УДАЛЕНИЕ ТАБЛИЦ (в правильном порядке из-за внешних ключей)
DROP TABLE IF EXISTS tickets_units CASCADE;
DROP TABLE IF EXISTS users_tickets CASCADE;
DROP TABLE IF EXISTS tickets_comments CASCADE;
DROP TABLE IF EXISTS sentinel_tasks CASCADE;
DROP TABLE IF EXISTS mechanic_permissions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS roles_permissions CASCADE;
DROP TABLE IF EXISTS forecasts CASCADE;
DROP TABLE IF EXISTS oracle_requests CASCADE;
DROP TABLE IF EXISTS chosen_ones CASCADE;
DROP TABLE IF EXISTS system_audits CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS sectors CASCADE;
DROP TABLE IF EXISTS matrix_iterations CASCADE;
DROP TABLE IF EXISTS real_locations CASCADE;
DROP TABLE IF EXISTS anomaly_types CASCADE;
DROP TABLE IF EXISTS audit_types CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- СООБЩЕНИЕ О ЗАВЕРШЕНИИ
SELECT 'Схема успешно очищена. Все таблицы, функции, триггеры и данные удалены.' AS message;
