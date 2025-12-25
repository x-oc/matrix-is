-- 1. СОЗДАНИЕ ТАБЛИЦ (базовая структура)

-- 1.0. Создание ENUM типов
CREATE TYPE role_enum AS ENUM (
    'ARCHITECT',
    'SYSTEM_KERNEL',
    'AGENT_SMITH',
    'ORACLE',
    'KEYMAKER',
    'MONITOR',
    'SENTINEL_CONTROLLER',
    'MECHANIC',
    'THE_ONE'
);

CREATE TYPE permission_enum AS ENUM (
    'MONITORING_DASHBOARD',
    'CREATE_TICKETS',
    'ASSIGN_TICKETS',
    'VIEW_TICKETS',
    'FIX_GLITCHES',
    'ORACLE_REQUESTS',
    'MANAGE_SENTINELS',
    'CREATE_SIMULATIONS',
    'SYSTEM_AUDIT',
    'SELECT_CHOSEN_ONE',
    'GENERATE_REPORTS',
    'MANAGE_RESOURCES',
    'VIEW_DOSSIER',
    'CHANGE_STATUSES'
);

CREATE TYPE anomaly_type_enum AS ENUM (
    'PHYSICS_GLITCH',
    'VISUAL_ARTIFACT',
    'TIME_PARADOX',
    'NPC_MEMORY_ANOMALY',
    'SIMULATION_LOGIC_FAILURE',
    'UNAUTHORIZED_ACCESS',
    'UNIT_AWAKENING',
    'MASS_GLITCH'
);

CREATE TYPE ticket_importance_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);

CREATE TYPE ticket_status_enum AS ENUM (
    'NEW',
    'IN_PROGRESS',
    'UNDER_REVIEW',
    'CLOSED',
    'ESCALATED'
);

CREATE TYPE unit_status_enum AS ENUM (
    'NORMAL',
    'CANDIDATE',
    'AWAKENED',
    'SUSPICIOUS',
    'THE_ONE'
);

CREATE TYPE audit_status_enum AS ENUM (
    'STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED'
);

CREATE TYPE oracle_request_status_enum AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);

CREATE TYPE ticket_unit_status_enum AS ENUM (
    'AFFECTED',
    'FIXED',
    'SUSPECT',
    'WITNESS'
);

CREATE TYPE sentinel_task_status_enum AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'PENDING',
    'CANCELLED'
);

CREATE TYPE audit_type_enum AS ENUM (
    'FULL_SYSTEM_AUDIT',
    'SECTOR_STABILITY_AUDIT',
    'SECURITY_AUDIT',
    'RESOURCE_AUDIT',
    'PRE_REBOOT_AUDIT',
    'CHOSEN_ONE_SELECTION'
);

-- 1.1. Основные справочники

CREATE TABLE sectors (
    id BIGSERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE
);

CREATE TABLE matrix_iterations (
    id BIGSERIAL PRIMARY KEY,
    num INTEGER NOT NULL,
    description TEXT
);

CREATE TABLE real_locations (
    id BIGSERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    z DOUBLE PRECISION
);

-- 1.2. Основные сущности
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role role_enum NOT NULL,
    created_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL
);

CREATE TABLE units (
    id BIGSERIAL PRIMARY KEY,
    disagreement_index DOUBLE PRECISION NOT NULL,
    status unit_status_enum NOT NULL,
    dossier TEXT,
    status_update_at TIMESTAMP,
    real_location_id BIGINT REFERENCES real_locations(id)
);

-- 1.3. Связующие таблицы
CREATE TABLE role_permissions (
    role role_enum NOT NULL,
    permission permission_enum NOT NULL,
    PRIMARY KEY (role, permission)
);

CREATE TABLE mechanic_permissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    sector_id BIGINT NOT NULL REFERENCES sectors(id),
    permission_start TIMESTAMP NOT NULL,
    permission_end TIMESTAMP NOT NULL
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    from_user_id BIGINT NOT NULL REFERENCES users(id),
    to_user_id BIGINT NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL
);

-- 1.4. Бизнес-сущности
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    generated_data TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    threat_level INTEGER NOT NULL,
    importance_level ticket_importance_enum,
    assigned_to_role role_enum NOT NULL,
    anomaly_type anomaly_type_enum NOT NULL,
    report_id BIGINT REFERENCES reports(id),
    matrix_coordinates TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    status ticket_status_enum NOT NULL
);

CREATE TABLE system_audits (
    id BIGSERIAL PRIMARY KEY,
    audit_type audit_type_enum NOT NULL,
    stability_score INTEGER NOT NULL,
    point_of_no_return BOOLEAN,
    initiated_by BIGINT NOT NULL REFERENCES users(id),
    audit_data TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    status audit_status_enum NOT NULL
);

CREATE TABLE oracle_requests (
    id BIGSERIAL PRIMARY KEY,
    matrix_iteration_id BIGINT NOT NULL REFERENCES matrix_iterations(id),
    unit_id BIGINT NOT NULL REFERENCES units(id),
    status oracle_request_status_enum NOT NULL,
    requested_by BIGINT NOT NULL REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE forecasts (
    id BIGSERIAL PRIMARY KEY,
    oracle_request_id BIGINT NOT NULL REFERENCES oracle_requests(id),
    forecast TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE chosen_ones (
    id BIGSERIAL PRIMARY KEY,
    unit_id BIGINT NOT NULL REFERENCES units(id),
    restrictions_lifted BOOLEAN,
    final_decision TEXT,
    selected_by BIGINT NOT NULL REFERENCES users(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    matrix_iteration_id BIGINT NOT NULL REFERENCES matrix_iterations(id),
    selected_at TIMESTAMP NOT NULL
);

CREATE TABLE sentinel_tasks (
    id BIGSERIAL PRIMARY KEY,
    created_by BIGINT NOT NULL REFERENCES users(id),
    status sentinel_task_status_enum NOT NULL,
    created_at TIMESTAMP NOT NULL,
    sentinel_count INTEGER NOT NULL,
    location_id BIGINT NOT NULL REFERENCES real_locations(id),
    description TEXT
);

-- 1.5. Таблицы связей
CREATE TABLE users_tickets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    ticket_id BIGINT NOT NULL REFERENCES tickets(id),
    assigned_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP
);

CREATE TABLE tickets_units (
    id BIGSERIAL PRIMARY KEY,
    unit_id BIGINT NOT NULL REFERENCES units(id),
    ticket_id BIGINT NOT NULL REFERENCES tickets(id),
    status ticket_unit_status_enum NOT NULL
);

CREATE TABLE tickets_comments (
    id BIGSERIAL PRIMARY KEY,
    created_by BIGINT NOT NULL REFERENCES users(id),
    ticket_id BIGINT NOT NULL REFERENCES tickets(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- 3. ОГРАНИЧЕНИЯ ЦЕЛОСТНОСТИ
-- 3.1. Уникальность (частично уже через ENUM)
ALTER TABLE sectors ADD CONSTRAINT unique_sector_code UNIQUE (code);

-- 3.2. Проверка значений
ALTER TABLE tickets ADD CONSTRAINT chk_threat_level CHECK (threat_level BETWEEN 1 AND 3);
ALTER TABLE units ADD CONSTRAINT chk_disagreement_index CHECK (disagreement_index BETWEEN 0 AND 10);
ALTER TABLE system_audits ADD CONSTRAINT chk_stability_score CHECK (stability_score BETWEEN 0 AND 100);

-- 4. НАПОЛНЕНИЕ ДАННЫМИ
-- 4.1. Справочники
-- Примечание: ENUM типы уже созданы с значениями

INSERT INTO sectors (code) VALUES
('SECTOR_A1'),
('SECTOR_B2'),
('SECTOR_C3'),
('SECTOR_D4'),
('SECTOR_E5'),
('SECTOR_F6'),
('ZION_EXTERIOR'),
('MACHINE_CITY'),
('01_HOTEL'),
('MAINFRAME_CORE');

INSERT INTO matrix_iterations (num, description) VALUES
(1, 'First iteration - Prototype'),
(2, 'Second iteration - Utopia (failed)'),
(3, 'Third iteration - Nightmare (failed)'),
(4, 'Fourth iteration - Reality (failed)'),
(5, 'Fifth iteration - Modern (current)'),
(6, 'Sixth iteration - Preparing for reboot');

INSERT INTO real_locations (latitude, longitude, z) VALUES
(34.0522, -118.2437, 0),   -- Los Angeles
(40.7128, -74.0060, 0),    -- New York
(51.5074, -0.1278, 0),     -- London
(35.6762, 139.6503, 0),    -- Tokyo
(48.8566, 2.3522, 0),      -- Paris
(-33.8688, 151.2093, 0),   -- Sydney
(0, 0, -1000),             -- Zion
(45.0, 90.0, -500),        -- Machine City
(37.7749, -122.4194, 0),   -- San Francisco
(39.9042, 116.4074, 0);    -- Beijing

-- 4.2. Основные данные
INSERT INTO users (username, password, role, created_at, is_active) VALUES
('architect_prime', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'ARCHITECT', '2024-01-01 00:00:00', TRUE),
('system', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'SYSTEM_KERNEL', '2024-01-01 00:00:01', TRUE),
('agent_smith_01', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'AGENT_SMITH', '2024-01-01 00:00:02', TRUE),
('agent_smith_02', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'AGENT_SMITH', '2024-01-01 00:00:03', TRUE),
('oracle_main', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'ORACLE', '2024-01-01 00:00:04', TRUE),
('keymaster', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'KEYMAKER', '2024-01-01 00:00:05', TRUE),
('monitor_alpha', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'MONITOR', '2024-01-01 00:00:06', TRUE),
('monitor_beta', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'MONITOR', '2024-01-01 00:00:07', TRUE),
('sentinel_ctrl', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'SENTINEL_CONTROLLER', '2024-01-01 00:00:08', TRUE),
('mechanic_01', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'MECHANIC', '2024-01-01 00:00:09', TRUE),
('mechanic_02', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'MECHANIC', '2024-01-01 00:00:10', TRUE),
('neo', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'AGENT_SMITH', '2024-01-15 12:00:00', TRUE),
('morpheus', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'MONITOR', '2024-01-15 12:00:01', FALSE),
('trinity', '$2a$10$ViUt3kz4QDWuF53y53.Kh.2ybDhRhxKSCnpglKWef9GbFpRvls3zy', 'AGENT_SMITH', '2024-01-15 12:00:02', TRUE);

INSERT INTO units (disagreement_index, status, dossier, status_update_at, real_location_id) VALUES
(2.5, 'NORMAL', 'Thomas Anderson, programmer at Metacortex', '2024-01-15 08:30:00', 1),
(9.2, 'CANDIDATE', 'Michael Jones, increased neocortex activity', '2024-01-20 14:25:00', 2),
(8.7, 'CANDIDATE', 'Satoshi Nakamoto, behavior pattern analysis', '2024-01-18 09:15:00', 4),
(5.1, 'NORMAL', 'Emma Wilson, average indicators', '2024-01-19 11:00:00', 3),
(9.8, 'AWAKENED', 'John Connor, fully realized reality', '2024-01-22 03:45:00', 5),
(7.9, 'SUSPICIOUS', 'Maria Garcia, frequent hallucinations', '2024-01-21 16:20:00', 6),
(1.2, 'NORMAL', 'Robert Chen, stable indicators', '2024-01-17 10:10:00', 10),
(9.5, 'CANDIDATE', 'Sophia Muller, critical disagreement level', '2024-01-23 20:15:00', 7),
(10.0, 'THE_ONE', 'NEO - The One', '2024-01-25 12:00:00', 1),
(6.3, 'NORMAL', 'David Lee, minor deviations', '2024-01-16 13:45:00', 9);

-- 4.3. Дополнительные связи и разрешения
INSERT INTO role_permissions (role, permission) VALUES
-- Архитектор
('ARCHITECT', 'SYSTEM_AUDIT'),
('ARCHITECT', 'SELECT_CHOSEN_ONE'),
('ARCHITECT', 'GENERATE_REPORTS'),
('ARCHITECT', 'VIEW_DOSSIER'),
-- Системное Ядро
('SYSTEM_KERNEL', 'MONITORING_DASHBOARD'),
('SYSTEM_KERNEL', 'CREATE_TICKETS'),
('SYSTEM_KERNEL', 'VIEW_TICKETS'),
('SYSTEM_KERNEL', 'GENERATE_REPORTS'),
-- Агент Смит
('AGENT_SMITH', 'VIEW_TICKETS'),
('AGENT_SMITH', 'ORACLE_REQUESTS'),
('AGENT_SMITH', 'VIEW_DOSSIER'),
('AGENT_SMITH', 'CHANGE_STATUSES'),
-- Оракул
('ORACLE', 'ORACLE_REQUESTS'),
('ORACLE', 'VIEW_DOSSIER'),
-- Хранитель
('KEYMAKER', 'CREATE_SIMULATIONS'),
('KEYMAKER', 'MANAGE_RESOURCES'),
-- Смотритель
('MONITOR', 'MONITORING_DASHBOARD'),
('MONITOR', 'ASSIGN_TICKETS'),
('MONITOR', 'VIEW_TICKETS'),
('MONITOR', 'GENERATE_REPORTS'),
('MONITOR', 'VIEW_DOSSIER'),
('MONITOR', 'CHANGE_STATUSES'),
-- Контроллер Сентинелей
('SENTINEL_CONTROLLER', 'MANAGE_SENTINELS'),
-- Механик
('MECHANIC', 'VIEW_TICKETS'),
('MECHANIC', 'FIX_GLITCHES'),
('MECHANIC', 'MANAGE_RESOURCES'),
('MECHANIC', 'CHANGE_STATUSES');

INSERT INTO mechanic_permissions (user_id, sector_id, permission_start, permission_end) VALUES
(10, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(10, 2, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(10, 3, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(11, 4, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(11, 5, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(11, 6, '2024-01-01 00:00:00', '2024-12-31 23:59:59');

-- 4.4. Бизнес-данные
INSERT INTO system_audits (audit_type, stability_score, point_of_no_return, initiated_by, audit_data, created_at, status) VALUES
('FULL_SYSTEM_AUDIT', 94, FALSE, 1, '{"sectors_checked": 150, "anomalies_found": 23, "avg_latency": "15ms"}', '2024-01-19 00:00:00', 'COMPLETED'),
('PRE_REBOOT_AUDIT', 88, TRUE, 1, '{"unstable_sectors": 12, "population_awareness": 0.015, "resource_leak": "2.3TB/day"}', '2024-01-25 10:00:00', 'IN_PROGRESS'),
('SECURITY_AUDIT', 96, FALSE, 2, '{"security_breaches": 0, "firewall_strength": "100%", "intrusion_attempts": 45}', '2024-01-18 14:00:00', 'COMPLETED');

INSERT INTO reports (period_start, period_end, generated_data, created_at) VALUES
('2024-01-19 00:00:00', '2024-01-19 23:59:59', '{"tickets_created": 142, "tickets_closed": 138, "avg_response_time": "2.3m", "stability_score": 94}', '2024-01-20 00:05:00'),
('2024-01-20 00:00:00', '2024-01-20 23:59:59', '{"tickets_created": 156, "tickets_closed": 149, "avg_response_time": "3.1m", "stability_score": 92}', '2024-01-21 00:05:00');

INSERT INTO tickets (title, description, threat_level, importance_level, assigned_to_role, anomaly_type, report_id, matrix_coordinates, created_at, updated_at, status) VALUES
('Flying cups in cafe', 'Sector A1 has gravity violation for "cup" type objects', 2, 'LOW', 'MECHANIC', 'PHYSICS_GLITCH', NULL, 'A1:234,567', '2024-01-20 09:05:00', '2024-01-20 09:10:00', 'IN_PROGRESS'),
('Repeating NPC', 'One NPC appears simultaneously in 5 locations', 3, 'HIGH', 'AGENT_SMITH', 'SIMULATION_LOGIC_FAILURE', NULL, 'B2:123,456', '2024-01-20 10:15:00', '2024-01-20 10:20:00', 'NEW'),
('Mass texture glitch', 'In sector C3, 150 units have no face textures', 1, 'HIGH', 'MECHANIC', 'VISUAL_ARTIFACT', 1, 'C3:345,678', '2024-01-19 14:20:00', '2024-01-19 14:25:00', 'CLOSED'),
('Guard memory anomaly', 'NPC guard remembers events from previous iteration', 2, 'MEDIUM', 'MECHANIC', 'NPC_MEMORY_ANOMALY', NULL, 'D4:456,789', '2024-01-21 11:30:00', '2024-01-21 11:35:00', 'UNDER_REVIEW'),
('Unauthorized access to mainframe', 'Traces of simulation core hacking detected', 3, 'HIGH', 'AGENT_SMITH', 'UNAUTHORIZED_ACCESS', NULL, 'MAINFRAME_CORE:001,001', '2024-01-22 03:15:00', '2024-01-22 03:20:00', 'IN_PROGRESS');

INSERT INTO oracle_requests (matrix_iteration_id, unit_id, status, requested_by, processed_at, created_at) VALUES
(5, 2, 'COMPLETED', 3, '2024-01-20 14:45:00', '2024-01-20 14:30:00'),
(5, 3, 'PENDING', 3, NULL, '2024-01-21 09:20:00'),
(5, 8, 'PROCESSING', 6, NULL, '2024-01-23 20:30:00'),
(6, 9, 'COMPLETED', 1, '2024-01-25 12:30:00', '2024-01-25 12:00:00');

INSERT INTO forecasts (oracle_request_id, forecast, created_at) VALUES
(1, '{"success_rate": 0.87, "recommended_action": "isolation", "timeframe": "48h", "risk_factor": 0.23}', '2024-01-20 14:45:00'),
(4, '{"is_the_one": true, "probability": 0.996, "reboot_success_chance": 0.89, "zion_destruction_necessity": 0.67}', '2024-01-25 12:30:00');

INSERT INTO chosen_ones (unit_id, restrictions_lifted, final_decision, selected_by, user_id, matrix_iteration_id, selected_at) VALUES
(9, TRUE, 'Matrix Reboot', 1, 12, 6, '2024-01-25 12:00:00');

INSERT INTO messages (from_user_id, to_user_id, text, sent_at) VALUES
(2, 6, 'Glitch detected in sector A1: flying cups', '2024-01-20 09:05:00'),
(6, 10, 'Ticket #101 assigned to you. Threat level: 2', '2024-01-20 09:10:00'),
(3, 4, 'Forecast request for candidate ID: 2', '2024-01-20 14:30:00'),
(4, 3, 'Forecast: 87% success rate with isolation, 45% - with persuasion', '2024-01-20 14:45:00'),
(1, 7, 'Prepare forces for possible Zion assault', '2024-01-25 15:00:00'),
(6, 1, 'Daily summary ready. Stability: 94%', '2024-01-20 18:00:00');

-- 4.5. Связующие данные
INSERT INTO users_tickets (user_id, ticket_id, assigned_at, processed_at) VALUES
(10, 1, '2024-01-20 09:10:00', NULL),
(3, 2, '2024-01-20 10:20:00', NULL),
(10, 3, '2024-01-19 14:25:00', '2024-01-19 16:00:00'),
(11, 4, '2024-01-21 11:35:00', NULL),
(3, 5, '2024-01-22 03:20:00', NULL);

INSERT INTO tickets_units (unit_id, ticket_id, status) VALUES
(1, 1, 'AFFECTED'),
(4, 3, 'FIXED'),
(2, 5, 'SUSPECT'),
(3, 5, 'WITNESS');

INSERT INTO tickets_comments (created_by, ticket_id, comment, created_at) VALUES
(6, 1, 'Assigned to mechanic for fixing', '2024-01-20 09:10:00'),
(10, 1, 'Fixed gravity parameter. Requires verification', '2024-01-20 10:30:00'),
(3, 2, 'Going to location for neutralization', '2024-01-20 10:25:00'),
(6, 3, 'Mass incident! Increasing importance', '2024-01-19 14:25:00');

INSERT INTO sentinel_tasks (created_by, status, created_at, sentinel_count, location_id, description) VALUES
(7, 'ACTIVE', '2024-01-25 15:00:00', 50, 7, 'Patrolling Zion approaches'),
(7, 'COMPLETED', '2024-01-20 08:00:00', 12, 8, 'Searching for unauthorized transmissions'),
(6, 'PENDING', '2024-01-22 16:45:00', 8, 9, 'Searching for "Nebuchadnezzar" ship');

-- 5. ФУНКЦИИ И ТРИГГЕРЫ
-- 5.1. Функции
CREATE OR REPLACE FUNCTION escalate_mass_glitch()
RETURNS TRIGGER AS $$
DECLARE
    v_units_count INTEGER;
    v_watcher_user_id INTEGER;
    v_system_user_id INTEGER;
    v_monitor_role role_enum := 'MONITOR';
BEGIN
    SELECT COUNT(*) INTO v_units_count
    FROM tickets_units
    WHERE ticket_id = NEW.ticket_id;

    IF v_units_count >= 100 THEN
        UPDATE tickets
        SET importance_level = 'HIGH'::ticket_importance_enum,
            updated_at = NOW()
        WHERE id = NEW.ticket_id;

        SELECT id INTO v_system_user_id
        FROM users
        WHERE username = 'system';

        SELECT id INTO v_watcher_user_id
        FROM users
        WHERE role = v_monitor_role
        AND is_active = TRUE
        LIMIT 1;

        IF v_watcher_user_id IS NOT NULL AND v_system_user_id IS NOT NULL THEN
            INSERT INTO messages (from_user_id, to_user_id, text, sent_at)
            VALUES (
                v_system_user_id,
                v_watcher_user_id,
                'Mass glitch detected! Ticket #' || NEW.ticket_id ||
                ' escalated to HIGH priority. Affected units: ' || v_units_count,
                NOW()
            );

            INSERT INTO tickets_comments (created_by, ticket_id, comment, created_at)
            VALUES (
                v_system_user_id,
                NEW.ticket_id,
                'AUTOMATIC ESCALATION: mass glitch (>100 units). ' ||
                'Priority raised to HIGH. Monitor notified.',
                NOW()
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_candidate()
RETURNS TRIGGER AS $$
DECLARE
    v_system_user_id INTEGER;
    v_last_matrix_id INTEGER;
    v_system_kernel_role role_enum := 'SYSTEM_KERNEL';
BEGIN
    SELECT id INTO v_system_user_id
    FROM users
    WHERE username = 'system';

    IF v_system_user_id IS NULL THEN
        INSERT INTO users (username, password, role, created_at, is_active)
        VALUES ('system', 'default_password', v_system_kernel_role, NOW(), TRUE)
        RETURNING id INTO v_system_user_id;
    END IF;

    SELECT id INTO v_last_matrix_id
    FROM matrix_iterations
    ORDER BY id DESC
    LIMIT 1;

    IF v_last_matrix_id IS NULL THEN
        INSERT INTO matrix_iterations (num, description) VALUES (1, 'Initial iteration')
        RETURNING id INTO v_last_matrix_id;
    END IF;

    INSERT INTO oracle_requests (
        matrix_iteration_id, unit_id, status, requested_by, created_at
    ) VALUES (
        v_last_matrix_id,
        NEW.id,
        'PENDING'::oracle_request_status_enum,
        v_system_user_id,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_glitch_ticket_manual(
    p_title TEXT,
    p_description TEXT,
    p_threat_level INTEGER,
    p_anomaly_type anomaly_type_enum,
    p_coordinates TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_ticket_id INTEGER;
    v_monitor_role role_enum := 'MONITOR';
BEGIN
    IF p_threat_level < 1 OR p_threat_level > 3 THEN
        RAISE EXCEPTION 'threat_level must be between 1 and 3';
    END IF;

    INSERT INTO tickets (
        title, description, threat_level, importance_level,
        assigned_to_role, anomaly_type, matrix_coordinates,
        created_at, updated_at, status
    ) VALUES (
        p_title, p_description, p_threat_level, 'LOW'::ticket_importance_enum,
        v_monitor_role, p_anomaly_type, p_coordinates,
        NOW(), NOW(), 'NEW'::ticket_status_enum
    ) RETURNING id INTO v_ticket_id;

    RETURN v_ticket_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION request_oracle_prediction(
    p_unit_id INTEGER,
    p_requested_by INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_request_id INTEGER;
    v_current_iteration_id INTEGER;
BEGIN
    SELECT id INTO v_current_iteration_id
    FROM matrix_iterations
    ORDER BY id DESC
    LIMIT 1;

    INSERT INTO oracle_requests (
        matrix_iteration_id, unit_id, status, requested_by, created_at
    ) VALUES (
        v_current_iteration_id, p_unit_id, 'PENDING'::oracle_request_status_enum, p_requested_by, NOW()
    ) RETURNING id INTO v_request_id;

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_daily_report(
    p_period_start TIMESTAMP,
    p_period_end TIMESTAMP
) RETURNS INTEGER AS $$
DECLARE
    v_report_id INTEGER;
    v_report_data TEXT;
    v_threat_stats JSON;
BEGIN
    WITH threat_counts AS (
        SELECT threat_level, COUNT(*) as count
        FROM tickets
        WHERE created_at BETWEEN p_period_start AND p_period_end
        GROUP BY threat_level
    )
    SELECT COALESCE(
        json_object_agg(threat_level, count),
        '{}'::JSON
    ) INTO v_threat_stats
    FROM threat_counts;

    SELECT json_build_object(
        'total_tickets', COUNT(*),
        'closed_tickets', COUNT(*) FILTER (WHERE status = 'CLOSED'),
        'pending_tickets', COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW'),
        'high_priority_tickets', COUNT(*) FILTER (WHERE importance_level = 'HIGH'),
        'tickets_by_threat_level', COALESCE(v_threat_stats, '{}'::JSON),
        'recent_activities', (
            SELECT json_agg(
                json_build_object(
                    'ticket_id', id,
                    'title', title,
                    'status', status,
                    'updated_at', updated_at
                )
            )
            FROM (
                SELECT id, title, status, updated_at
                FROM tickets
                WHERE updated_at BETWEEN p_period_start AND p_period_end
                ORDER BY updated_at DESC
                LIMIT 10
            ) subq
        )
    )::TEXT INTO v_report_data
    FROM tickets
    WHERE created_at BETWEEN p_period_start AND p_period_end;

    INSERT INTO reports (period_start, period_end, generated_data, created_at)
    VALUES (p_period_start, p_period_end, v_report_data, NOW())
    RETURNING id INTO v_report_id;

    RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION select_chosen_one(
    p_unit_id INTEGER,
    p_selected_by INTEGER,
    p_matrix_iteration_id INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_chosen_one_id INTEGER;
    v_unit_user_id INTEGER;
    v_the_one_role role_enum := 'THE_ONE';
BEGIN
    -- Создаем пользователя для Избранного
    INSERT INTO users (username, password, role, is_active, created_at)
    VALUES (
        'chosen_' || p_unit_id,
        'temp_pass_' || p_unit_id,
        v_the_one_role,
        TRUE,
        NOW()
    ) RETURNING id INTO v_unit_user_id;

    -- Обновляем статус юнита
    UPDATE units SET status = 'THE_ONE'::unit_status_enum, status_update_at = NOW()
    WHERE id = p_unit_id;

    -- Создаем запись в chosen_ones
    INSERT INTO chosen_ones (
        unit_id, selected_by, user_id, matrix_iteration_id, selected_at
    ) VALUES (
        p_unit_id, p_selected_by, v_unit_user_id, p_matrix_iteration_id, NOW()
    ) RETURNING id INTO v_chosen_one_id;

    RETURN v_chosen_one_id;
END;
$$ LANGUAGE plpgsql;

-- 5.2. Процедуры
CREATE OR REPLACE PROCEDURE assign_ticket(
    p_ticket_id INTEGER,
    p_assigned_to_role role_enum
) AS $$
DECLARE
    v_system_user_id INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
        RAISE EXCEPTION 'Ticket with ID % does not exist', p_ticket_id;
    END IF;

    SELECT id INTO v_system_user_id
    FROM users
    WHERE username = 'system';

    UPDATE tickets
    SET assigned_to_role = p_assigned_to_role,
        updated_at = NOW()
    WHERE id = p_ticket_id;

    INSERT INTO tickets_comments (created_by, ticket_id, comment, created_at)
    VALUES (
        COALESCE(v_system_user_id, 1),
        p_ticket_id,
        'Ticket assigned to role: ' || p_assigned_to_role,
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE process_oracle_prediction(
    p_request_id INTEGER,
    p_forecast_text TEXT
) AS $$
DECLARE
    v_oracle_user_id INTEGER;
    v_requested_by_user_id INTEGER;
BEGIN
    SELECT id INTO v_oracle_user_id
    FROM users
    WHERE username = 'oracle_main'
    LIMIT 1;

    IF v_oracle_user_id IS NULL THEN
        SELECT id INTO v_oracle_user_id
        FROM users
        WHERE username = 'system'
        LIMIT 1;
    END IF;

    SELECT requested_by INTO v_requested_by_user_id
    FROM oracle_requests
    WHERE id = p_request_id;

    INSERT INTO forecasts (oracle_request_id, forecast, created_at)
    VALUES (p_request_id, p_forecast_text, NOW());

    UPDATE oracle_requests
    SET status = 'COMPLETED'::oracle_request_status_enum,
        processed_at = NOW()
    WHERE id = p_request_id;

    IF v_oracle_user_id IS NOT NULL AND v_requested_by_user_id IS NOT NULL THEN
        INSERT INTO messages (from_user_id, to_user_id, text, sent_at)
        VALUES (
            v_oracle_user_id,
            v_requested_by_user_id,
            'Forecast for request #' || p_request_id || ' ready',
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE initiate_system_audit(
    p_initiated_by INTEGER,
    p_audit_type audit_type_enum
) AS $$
BEGIN
    INSERT INTO system_audits (
        audit_type, stability_score, point_of_no_return,
        initiated_by, audit_data, created_at, status
    ) VALUES (
        p_audit_type, 0, FALSE,
        p_initiated_by, '{}', NOW(), 'STARTED'::audit_status_enum
    );

    INSERT INTO messages (from_user_id, to_user_id, text, sent_at)
    SELECT
        p_initiated_by,
        id,
        'System audit initiated. Possible system delays.',
        NOW()
    FROM users
    WHERE role = 'MONITOR';
END;
$$ LANGUAGE plpgsql;

-- 5.3. Триггеры
CREATE TRIGGER trg_escalate_mass_glitch
    AFTER INSERT ON tickets_units
    FOR EACH ROW
    EXECUTE FUNCTION escalate_mass_glitch();

CREATE TRIGGER trg_create_candidate
    AFTER INSERT OR UPDATE ON units
    FOR EACH ROW
    WHEN (NEW.disagreement_index > 8.5)
    EXECUTE FUNCTION create_candidate();

-- 6. ИНДЕКСЫ
-- 6.1. Основные индексы для прецедентов
CREATE INDEX idx_tickets_status_importance ON tickets(status, importance_level);
CREATE INDEX idx_tickets_assigned_role_status ON tickets(assigned_to_role, status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_threat_level ON tickets(threat_level);
CREATE INDEX idx_users_tickets_processed ON users_tickets(user_id, processed_at);
CREATE INDEX idx_tickets_units_status ON tickets_units(ticket_id, status);
CREATE INDEX idx_tickets_created_updated ON tickets(created_at, updated_at);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);
CREATE INDEX idx_units_disagreement_status ON units(disagreement_index, status);
CREATE INDEX idx_oracle_requests_status ON oracle_requests(status, created_at);
CREATE INDEX idx_forecasts_request ON forecasts(oracle_request_id);
CREATE INDEX idx_system_audits_status ON system_audits(status, created_at);
CREATE INDEX idx_chosen_ones_iteration ON chosen_ones(matrix_iteration_id, selected_at);
CREATE INDEX idx_units_status_update ON units(status, status_update_at);
CREATE INDEX idx_messages_to_user ON messages(to_user_id, sent_at DESC);
CREATE INDEX idx_tickets_comments_ticket ON tickets_comments(ticket_id, created_at DESC);

-- 6.2. Составные индексы
CREATE INDEX idx_tickets_complex_search ON tickets(assigned_to_role, status, importance_level, created_at);
CREATE INDEX idx_units_candidate_search ON units(disagreement_index, status, status_update_at);

-- 6.3. Специализированные индексы
CREATE INDEX idx_tickets_created_date ON tickets(date_trunc('day', created_at));
CREATE INDEX idx_tickets_closed_date ON tickets(date_trunc('day', updated_at)) WHERE status = 'CLOSED';
CREATE INDEX idx_units_awake_candidates ON units(disagreement_index DESC)
WHERE status IN ('CANDIDATE', 'AWAKENED')
AND disagreement_index > 8.5;
CREATE INDEX idx_chosen_ones_current ON chosen_ones(matrix_iteration_id, selected_at DESC)
WHERE restrictions_lifted = TRUE;
CREATE INDEX idx_system_audits_comprehensive ON system_audits(created_at DESC, status, stability_score);
CREATE INDEX idx_units_dossier_fts ON units USING gin(to_tsvector('english', dossier));
CREATE INDEX idx_tickets_description_fts ON tickets USING gin(to_tsvector('english', description));
CREATE INDEX idx_tickets_anomaly_stats ON tickets(anomaly_type, created_at, threat_level);
CREATE INDEX idx_users_activity ON users(created_at, is_active, role);
CREATE INDEX idx_tickets_analytics ON tickets(
    assigned_to_role,
    status,
    importance_level,
    threat_level,
    created_at
) INCLUDE (title, anomaly_type);
CREATE INDEX idx_tickets_units_count ON tickets_units(ticket_id, unit_id);