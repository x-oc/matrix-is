-- 1. УДАЛЕНИЕ ТРИГГЕРОВ
DROP TRIGGER IF EXISTS trg_create_candidate ON units;
DROP TRIGGER IF EXISTS trg_escalate_mass_glitch ON tickets_units;

-- 2. УДАЛЕНИЕ ФУНКЦИЙ И ПРОЦЕДУР
DROP PROCEDURE IF EXISTS initiate_system_audit(INTEGER, audit_type_enum);
DROP PROCEDURE IF EXISTS process_oracle_prediction(INTEGER, TEXT);
DROP PROCEDURE IF EXISTS assign_ticket(INTEGER, role_enum);
DROP FUNCTION IF EXISTS select_chosen_one(INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS generate_daily_report(TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS request_oracle_prediction(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS create_glitch_ticket_manual(TEXT, TEXT, INTEGER, anomaly_type_enum, TEXT);
DROP FUNCTION IF EXISTS create_candidate();
DROP FUNCTION IF EXISTS escalate_mass_glitch();

-- 3. УДАЛЕНИЕ ИНДЕКСОВ
DROP INDEX IF EXISTS idx_tickets_analytics;
DROP INDEX IF EXISTS idx_users_activity;
DROP INDEX IF EXISTS idx_tickets_anomaly_stats;
DROP INDEX IF EXISTS idx_tickets_description_fts;
DROP INDEX IF EXISTS idx_units_dossier_fts;
DROP INDEX IF EXISTS idx_system_audits_comprehensive;
DROP INDEX IF EXISTS idx_chosen_ones_current;
DROP INDEX IF EXISTS idx_units_awake_candidates;
DROP INDEX IF EXISTS idx_tickets_closed_date;
DROP INDEX IF EXISTS idx_tickets_created_date;
DROP INDEX IF EXISTS idx_units_candidate_search;
DROP INDEX IF EXISTS idx_tickets_complex_search;
DROP INDEX IF EXISTS idx_tickets_comments_ticket;
DROP INDEX IF EXISTS idx_messages_to_user;
DROP INDEX IF EXISTS idx_units_status_update;
DROP INDEX IF EXISTS idx_chosen_ones_iteration;
DROP INDEX IF EXISTS idx_system_audits_status;
DROP INDEX IF EXISTS idx_forecasts_request;
DROP INDEX IF EXISTS idx_oracle_requests_status;
DROP INDEX IF EXISTS idx_units_disagreement_status;
DROP INDEX IF EXISTS idx_reports_period;
DROP INDEX IF EXISTS idx_tickets_created_updated;
DROP INDEX IF EXISTS idx_tickets_units_count;
DROP INDEX IF EXISTS idx_tickets_units_status;
DROP INDEX IF EXISTS idx_users_tickets_processed;
DROP INDEX IF EXISTS idx_tickets_threat_level;
DROP INDEX IF EXISTS idx_tickets_created_at;
DROP INDEX IF EXISTS idx_tickets_assigned_role_status;
DROP INDEX IF EXISTS idx_tickets_status_importance;

-- 4. УДАЛЕНИЕ ТАБЛИЦ (в обратном порядке создания)
DROP TABLE IF EXISTS tickets_comments;
DROP TABLE IF EXISTS tickets_units;
DROP TABLE IF EXISTS users_tickets;
DROP TABLE IF EXISTS sentinel_tasks;
DROP TABLE IF EXISTS chosen_ones;
DROP TABLE IF EXISTS forecasts;
DROP TABLE IF EXISTS oracle_requests;
DROP TABLE IF EXISTS system_audits;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS mechanic_permissions;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS real_locations;
DROP TABLE IF EXISTS matrix_iterations;
DROP TABLE IF EXISTS sectors;

-- 5. УДАЛЕНИЕ ТИПОВ ENUM
DROP TYPE IF EXISTS audit_type_enum;
DROP TYPE IF EXISTS sentinel_task_status_enum;
DROP TYPE IF EXISTS ticket_unit_status_enum;
DROP TYPE IF EXISTS oracle_request_status_enum;
DROP TYPE IF EXISTS audit_status_enum;
DROP TYPE IF EXISTS unit_status_enum;
DROP TYPE IF EXISTS ticket_status_enum;
DROP TYPE IF EXISTS ticket_importance_enum;
DROP TYPE IF EXISTS anomaly_type_enum;
DROP TYPE IF EXISTS permission_enum;
DROP TYPE IF EXISTS role_enum;

-- 6. ПРОВЕРКА (необязательно, для отладки)
DO $$
BEGIN
    RAISE NOTICE 'Все объекты успешно удалены';
END $$;