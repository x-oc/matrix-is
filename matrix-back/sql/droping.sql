-- drop_all.sql
-- ВНИМАНИЕ: Этот файл УДАЛИТ ВСЕ таблицы, функции, процедуры, триггеры и типы из базы данных!
-- Используйте только для очистки тестовой базы или при пересоздании схемы.

-- 1. УДАЛЕНИЕ ТРИГГЕРОВ
DROP TRIGGER IF EXISTS trg_escalate_mass_glitch ON tickets_units;
DROP TRIGGER IF EXISTS trg_create_candidate ON units;

-- 2. УДАЛЕНИЕ ФУНКЦИЙ И ПРОЦЕДУР
DROP FUNCTION IF EXISTS escalate_mass_glitch() CASCADE;
DROP FUNCTION IF EXISTS create_candidate() CASCADE;
DROP FUNCTION IF EXISTS generate_daily_report(TIMESTAMP, TIMESTAMP) CASCADE;
DROP FUNCTION IF EXISTS select_chosen_one(BIGINT, BIGINT, BIGINT) CASCADE;
DROP PROCEDURE IF EXISTS assign_ticket(BIGINT, role_enum) CASCADE;
DROP PROCEDURE IF EXISTS process_oracle_prediction(BIGINT, BIGINT, TEXT) CASCADE;

-- 3. УДАЛЕНИЕ ТАБЛИЦ (в правильном порядке из-за внешних ключей)

-- 3.1. Удаляем таблицы с внешними ключами (зависимые)
DROP TABLE IF EXISTS tickets_comments CASCADE;
DROP TABLE IF EXISTS tickets_units CASCADE;
DROP TABLE IF EXISTS users_tickets CASCADE;
DROP TABLE IF EXISTS sentinel_tasks CASCADE;
DROP TABLE IF EXISTS chosen_ones CASCADE;
DROP TABLE IF EXISTS forecasts CASCADE;
DROP TABLE IF EXISTS oracle_requests CASCADE;
DROP TABLE IF EXISTS system_audits CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS mechanic_permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS units CASCADE;

-- 3.2. Удаляем основные таблицы
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sectors CASCADE;
DROP TABLE IF EXISTS matrix_iterations CASCADE;
DROP TABLE IF EXISTS real_locations CASCADE;

-- 4. УДАЛЕНИЕ ТИПОВ ENUM (в правильном порядке из-за зависимостей)
DROP TYPE IF EXISTS sentinel_task_status_enum CASCADE;
DROP TYPE IF EXISTS ticket_unit_status_enum CASCADE;
DROP TYPE IF EXISTS oracle_request_status_enum CASCADE;
DROP TYPE IF EXISTS audit_status_enum CASCADE;
DROP TYPE IF EXISTS unit_status_enum CASCADE;
DROP TYPE IF EXISTS ticket_status_enum CASCADE;
DROP TYPE IF EXISTS ticket_importance_enum CASCADE;
DROP TYPE IF EXISTS anomaly_type_enum CASCADE;
DROP TYPE IF EXISTS permission_enum CASCADE;
DROP TYPE IF EXISTS audit_type_enum CASCADE;
DROP TYPE IF EXISTS role_enum CASCADE;

-- 5. УДАЛЕНИЕ ПРОЧИХ ОБЪЕКТОВ
-- (если есть последовательности не связанные с таблицами)
DROP SEQUENCE IF EXISTS global_id_seq CASCADE;

-- 6. СООБЩЕНИЕ О ВЫПОЛНЕНИИ
DO $$
BEGIN
    RAISE NOTICE 'Все объекты базы данных успешно удалены!';
END $$;