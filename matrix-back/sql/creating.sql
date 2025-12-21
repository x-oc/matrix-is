-- 1. СОЗДАНИЕ ТАБЛИЦ (базовая структура)
-- 1.1. Основные справочники
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE audit_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE anomaly_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL
);

CREATE TABLE matrix_iterations (
    id SERIAL PRIMARY KEY,
    num INTEGER NOT NULL,
    description TEXT
);

CREATE TABLE real_locations (
    id SERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    z DOUBLE PRECISION
);

-- 1.2. Основные сущности
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL
);

CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    disagreement_index INTEGER NOT NULL,
    status TEXT NOT NULL,
    dossier TEXT,
    status_update_at TIMESTAMP,
    real_location_id INTEGER REFERENCES real_locations(id)
);

-- 1.3. Связующие таблицы
CREATE TABLE roles_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id),
    permission_id INTEGER NOT NULL REFERENCES permissions(id)
);

CREATE TABLE mechanic_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    sector_id INTEGER NOT NULL REFERENCES sectors(id),
    permission_start TIMESTAMP NOT NULL,
    permission_end TIMESTAMP NOT NULL
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL
);

-- 1.4. Бизнес-сущности
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    generated_data TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    threat_level INTEGER NOT NULL,
    importance_level TEXT,
    assigned_to_role_id INTEGER NOT NULL REFERENCES roles(id),
    anomaly_type_id INTEGER NOT NULL REFERENCES anomaly_types(id),
    report_id INTEGER REFERENCES reports(id),
    matrix_coordinates TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    status TEXT NOT NULL
);

CREATE TABLE system_audits (
    id SERIAL PRIMARY KEY,
    audit_type_id INTEGER NOT NULL,
    stability_score INTEGER NOT NULL,
    point_of_no_return BOOLEAN,
    initiated_by INTEGER NOT NULL REFERENCES users(id),
    audit_data TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    status TEXT NOT NULL
);

CREATE TABLE oracle_requests (
    id SERIAL PRIMARY KEY,
    matrix_iteration_id INTEGER NOT NULL REFERENCES matrix_iterations(id),
    unit_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    requested_by INTEGER NOT NULL REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE forecasts (
    id SERIAL PRIMARY KEY,
    oracle_request_id INTEGER NOT NULL,
    forecast TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE chosen_ones (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL,
    restrictions_lifted BOOLEAN,
    final_decision TEXT,
    selected_by INTEGER NOT NULL REFERENCES users(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    matrix_iteration_id INTEGER NOT NULL REFERENCES matrix_iterations(id),
    selected_at TIMESTAMP NOT NULL
);

CREATE TABLE sentinel_tasks (
    id SERIAL PRIMARY KEY,
    created_by INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    sentinel_count INTEGER NOT NULL,
    location_id INTEGER NOT NULL REFERENCES real_locations(id),
    description TEXT
);

-- 1.5. Таблицы связей
CREATE TABLE users_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    assigned_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP
);

CREATE TABLE tickets_units (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    status TEXT NOT NULL
);

CREATE TABLE tickets_comments (
    id SERIAL PRIMARY KEY,
    created_by INTEGER NOT NULL REFERENCES users(id),
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- 2. ВНЕШНИЕ КЛЮЧИ (дополнительные)
ALTER TABLE system_audits ADD CONSTRAINT fk_system_audits_audit_type 
    FOREIGN KEY (audit_type_id) REFERENCES audit_types(id);

ALTER TABLE chosen_ones ADD CONSTRAINT fk_chosen_ones_unit 
    FOREIGN KEY (unit_id) REFERENCES units(id);

ALTER TABLE forecasts ADD CONSTRAINT fk_forecasts_oracle_request 
    FOREIGN KEY (oracle_request_id) REFERENCES oracle_requests(id);

ALTER TABLE oracle_requests ADD CONSTRAINT fk_oracle_requests_unit 
    FOREIGN KEY (unit_id) REFERENCES units(id);

ALTER TABLE tickets_units ADD CONSTRAINT fk_tickets_units_unit 
    FOREIGN KEY (unit_id) REFERENCES units(id);

-- 3. ОГРАНИЧЕНИЯ ЦЕЛОСТНОСТИ
-- 3.1. Уникальность
ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);
ALTER TABLE roles ADD CONSTRAINT unique_role_name UNIQUE (name);
ALTER TABLE permissions ADD CONSTRAINT unique_permission_name UNIQUE (name);
ALTER TABLE sectors ADD CONSTRAINT unique_sector_code UNIQUE (code);
ALTER TABLE anomaly_types ADD CONSTRAINT unique_anomaly_type_name UNIQUE (name);
ALTER TABLE audit_types ADD CONSTRAINT unique_audit_type_name UNIQUE (name);

-- 3.2. Проверка значений
ALTER TABLE tickets ADD CONSTRAINT chk_threat_level CHECK (threat_level BETWEEN 1 AND 3);
ALTER TABLE tickets ADD CONSTRAINT chk_importance_level CHECK (importance_level IN ('Низкий', 'Средний', 'Высокий'));
ALTER TABLE units ADD CONSTRAINT chk_disagreement_index CHECK (disagreement_index BETWEEN 0 AND 10);
ALTER TABLE system_audits ADD CONSTRAINT chk_stability_score CHECK (stability_score BETWEEN 0 AND 100);
ALTER TABLE oracle_requests ADD CONSTRAINT chk_oracle_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
ALTER TABLE tickets ADD CONSTRAINT chk_ticket_status CHECK (status IN ('новый', 'в работе', 'на проверке', 'закрыт', 'эскалирован'));

-- 4. НАПОЛНЕНИЕ ДАННЫМИ
-- 4.1. Справочники
INSERT INTO roles (name) VALUES
('Архитектор'),
('Системное Ядро'),
('Агент Смит'),
('Оракул'),
('Хранитель'),
('Смотритель'),
('Контроллер Сентинелей'),
('Механик');

INSERT INTO permissions (name) VALUES
('Дашборд мониторинга'),
('Создание тикетов'),
('Назначение тикетов'),
('Просмотр тикетов'),
('Исправление глитчей'),
('Запросы к Оракулу'),
('Управление сентинелями'),
('Создание симуляций'),
('Системный аудит'),
('Выбор Избранного'),
('Генерация отчетов'),
('Управление ресурсами'),
('Просмотр досье'),
('Изменение статусов');

INSERT INTO roles_permissions (role_id, permission_id) VALUES
-- Архитектор
(1, 9), (1, 10), (1, 11), (1, 13),
-- Системное Ядро
(2, 1), (2, 2), (2, 4), (2, 11),
-- Агент Смит
(3, 4), (3, 6), (3, 13), (3, 14),
-- Оракул
(4, 6), (4, 13),
-- Хранитель
(5, 8), (5, 12),
-- Смотритель
(6, 1), (6, 3), (6, 4), (6, 11), (6, 13), (6, 14),
-- Контроллер Сентинелей
(7, 7),
-- Механик
(8, 4), (8, 5), (8, 12), (8, 14);

INSERT INTO audit_types (name) VALUES
('Полный системный аудит'),
('Аудит стабильности сектора'),
('Аудит безопасности'),
('Аудит ресурсов'),
('Аудит перед перезагрузкой'),
('Выбор Избранного');

INSERT INTO anomaly_types (name) VALUES
('Глитч физики'),
('Визуальный артефакт'),
('Парадокс времени'),
('Аномалия памяти NPC'),
('Сбой в логике симуляции'),
('Несанкционированный доступ'),
('Пробуждение юнита'),
('Массовый глитч');

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
(1, 'Первая итерация - Прототип'),
(2, 'Вторая итерация - Утопия (провал)'),
(3, 'Третья итерация - Кошмар (провал)'),
(4, 'Четвертая итерация - Реальность (провал)'),
(5, 'Пятая итерация - Современная (текущая)'),
(6, 'Шестая итерация - Подготовка к перезагрузке');

INSERT INTO real_locations (latitude, longitude, z) VALUES
(34.0522, -118.2437, 0),   -- Лос-Анджелес
(40.7128, -74.0060, 0),    -- Нью-Йорк
(51.5074, -0.1278, 0),     -- Лондон
(35.6762, 139.6503, 0),    -- Токио
(48.8566, 2.3522, 0),      -- Париж
(-33.8688, 151.2093, 0),   -- Сидней
(0, 0, -1000),             -- Зион
(45.0, 90.0, -500),        -- Машинный город
(37.7749, -122.4194, 0),   -- Сан-Франциско
(39.9042, 116.4074, 0);    -- Пекин

-- 4.2. Основные данные
INSERT INTO users (username, password, role_id, created_at, is_active) VALUES
('architect_prime', 'crypt1c_pass', 1, '2024-01-01 00:00:00', TRUE),
('system', 'system_hash_123', 2, '2024-01-01 00:00:01', TRUE),
('agent_smith_01', 'smith_pass_001', 3, '2024-01-01 00:00:02', TRUE),
('agent_smith_02', 'smith_pass_002', 3, '2024-01-01 00:00:03', TRUE),
('oracle_main', 'pr0ph3cy_2024', 4, '2024-01-01 00:00:04', TRUE),
('keymaster', 'd00rs_4ll', 5, '2024-01-01 00:00:05', TRUE),
('monitor_alpha', 'watch_123', 6, '2024-01-01 00:00:06', TRUE),
('monitor_beta', 'watch_456', 6, '2024-01-01 00:00:07', TRUE),
('sentinel_ctrl', 'ext3rnal_force', 7, '2024-01-01 00:00:08', TRUE),
('mechanic_01', 'fix1t_001', 8, '2024-01-01 00:00:09', TRUE),
('mechanic_02', 'fix1t_002', 8, '2024-01-01 00:00:10', TRUE),
('neo', 'th3_ch0sen_one', 3, '2024-01-15 12:00:00', TRUE),
('morpheus', 'r3d_pill', 6, '2024-01-15 12:00:01', FALSE),
('trinity', 'l0v3_m0t0', 3, '2024-01-15 12:00:02', TRUE);

INSERT INTO units (disagreement_index, status, dossier, status_update_at, real_location_id) VALUES
(2.5, 'нормальный', 'Томас Андерсон, программист в Metacortex', '2024-01-15 08:30:00', 1),
(9.2, 'кандидат', 'Майкл Джонс, повышенная активность неокортекса', '2024-01-20 14:25:00', 2),
(8.7, 'кандидат', 'Сатоши Накамото, анализ паттернов поведения', '2024-01-18 09:15:00', 4),
(5.1, 'нормальный', 'Эмма Уилсон, средние показатели', '2024-01-19 11:00:00', 3),
(9.8, 'проснувшийся', 'Джон Коннор, полностью осознал реальность', '2024-01-22 03:45:00', 5),
(7.9, 'подозрительный', 'Мария Гарсия, частые галлюцинации', '2024-01-21 16:20:00', 6),
(1.2, 'нормальный', 'Роберт Чен, стабильные показатели', '2024-01-17 10:10:00', 10),
(9.5, 'кандидат', 'София Мюллер, критический уровень несогласия', '2024-01-23 20:15:00', 7),
(10.0, 'избранный', 'НЕО - The One', '2024-01-25 12:00:00', 1),
(6.3, 'нормальный', 'Дэвид Ли, незначительные отклонения', '2024-01-16 13:45:00', 9);

-- 4.3. Дополнительные связи и разрешения
INSERT INTO mechanic_permissions (user_id, sector_id, permission_start, permission_end) VALUES
(10, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(10, 2, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(10, 3, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(11, 4, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(11, 5, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(11, 6, '2024-01-01 00:00:00', '2024-12-31 23:59:59');

-- 4.4. Бизнес-данные
INSERT INTO system_audits (audit_type_id, stability_score, point_of_no_return, initiated_by, audit_data, created_at, status) VALUES
(1, 94, FALSE, 1, '{"sectors_checked": 150, "anomalies_found": 23, "avg_latency": "15ms"}', '2024-01-19 00:00:00', 'завершен'),
(5, 88, TRUE, 1, '{"unstable_sectors": 12, "population_awareness": 0.015, "resource_leak": "2.3TB/day"}', '2024-01-25 10:00:00', 'в процессе'),
(3, 96, FALSE, 2, '{"security_breaches": 0, "firewall_strength": "100%", "intrusion_attempts": 45}', '2024-01-18 14:00:00', 'завершен');

INSERT INTO reports (period_start, period_end, generated_data, created_at) VALUES
('2024-01-19 00:00:00', '2024-01-19 23:59:59', '{"tickets_created": 142, "tickets_closed": 138, "avg_response_time": "2.3m", "stability_score": 94}', '2024-01-20 00:05:00'),
('2024-01-20 00:00:00', '2024-01-20 23:59:59', '{"tickets_created": 156, "tickets_closed": 149, "avg_response_time": "3.1m", "stability_score": 92}', '2024-01-21 00:05:00');

INSERT INTO tickets (title, description, threat_level, importance_level, assigned_to_role_id, anomaly_type_id, report_id, matrix_coordinates, created_at, updated_at, status) VALUES
('Летающие чашки в кафе', 'В секторе A1 наблюдается нарушение гравитации для объектов типа "чашка"', 2, 'Низкий', 8, 1, NULL, 'A1:234,567', '2024-01-20 09:05:00', '2024-01-20 09:10:00', 'в работе'),
('Повторяющиеся NPC', 'Один NPC появляется одновременно в 5 локациях', 3, 'Высокий', 3, 5, NULL, 'B2:123,456', '2024-01-20 10:15:00', '2024-01-20 10:20:00', 'новый'),
('Массовый глитч текстур', 'В секторе C3 у 150 юнитов отсутствуют текстуры лиц', 1, 'Высокий', 8, 2, 1, 'C3:345,678', '2024-01-19 14:20:00', '2024-01-19 14:25:00', 'закрыт'),
('Аномалия памяти у охранника', 'NPC-охранник помнит события предыдущей итерации', 2, 'Средний', 8, 4, NULL, 'D4:456,789', '2024-01-21 11:30:00', '2024-01-21 11:35:00', 'на проверке'),
('Несанкционированный доступ к mainframe', 'Обнаружены следы взлома ядра симуляции', 3, 'Высокий', 3, 6, NULL, 'MAINFRAME_CORE:001,001', '2024-01-22 03:15:00', '2024-01-22 03:20:00', 'в работе');

INSERT INTO oracle_requests (matrix_iteration_id, unit_id, status, requested_by, processed_at, created_at) VALUES
(5, 2, 'completed', 3, '2024-01-20 14:45:00', '2024-01-20 14:30:00'),
(5, 3, 'pending', 3, NULL, '2024-01-21 09:20:00'),
(5, 8, 'processing', 6, NULL, '2024-01-23 20:30:00'),
(6, 9, 'completed', 1, '2024-01-25 12:30:00', '2024-01-25 12:00:00');

INSERT INTO forecasts (oracle_request_id, forecast, created_at) VALUES
(1, '{"success_rate": 0.87, "recommended_action": "изоляция", "timeframe": "48h", "risk_factor": 0.23}', '2024-01-20 14:45:00'),
(4, '{"is_the_one": true, "probability": 0.996, "reboot_success_chance": 0.89, "zion_destruction_necessity": 0.67}', '2024-01-25 12:30:00');

INSERT INTO chosen_ones (unit_id, restrictions_lifted, final_decision, selected_by, user_id, matrix_iteration_id, selected_at) VALUES
(9, TRUE, 'Перезагрузка Матрицы', 1, 12, 6, '2024-01-25 12:00:00');

INSERT INTO messages (from_user_id, to_user_id, text, sent_at) VALUES
(2, 6, 'Обнаружен глитч в секторе A1: летающие чашки', '2024-01-20 09:05:00'),
(6, 10, 'Тикет #101 назначен на вас. Уровень угрозы: 2', '2024-01-20 09:10:00'),
(3, 4, 'Запрос прогноза для кандидата ID: 2', '2024-01-20 14:30:00'),
(4, 3, 'Прогноз: 87% вероятность успеха при изоляции, 45% - при убеждении', '2024-01-20 14:45:00'),
(1, 7, 'Подготовить силы для возможного штурма Зиона', '2024-01-25 15:00:00'),
(6, 1, 'Ежедневная сводка готова. Стабильность: 94%', '2024-01-20 18:00:00');

-- 4.5. Связующие данные
INSERT INTO users_tickets (user_id, ticket_id, assigned_at, processed_at) VALUES
(10, 1, '2024-01-20 09:10:00', NULL),
(3, 2, '2024-01-20 10:20:00', NULL),
(10, 3, '2024-01-19 14:25:00', '2024-01-19 16:00:00'),
(11, 4, '2024-01-21 11:35:00', NULL),
(3, 5, '2024-01-22 03:20:00', NULL);

INSERT INTO tickets_units (unit_id, ticket_id, status) VALUES
(1, 1, 'затронут'),
(4, 3, 'исправлен'),
(2, 5, 'подозреваемый'),
(3, 5, 'свидетель');

INSERT INTO tickets_comments (created_by, ticket_id, comment, created_at) VALUES
(6, 1, 'Назначил механику для исправления', '2024-01-20 09:10:00'),
(10, 1, 'Исправил параметр гравитации. Требуется проверка', '2024-01-20 10:30:00'),
(3, 2, 'Отправляюсь на место для нейтрализации', '2024-01-20 10:25:00'),
(6, 3, 'Массовый инцидент! Повышаю важность', '2024-01-19 14:25:00');

INSERT INTO sentinel_tasks (created_by, status, created_at, sentinel_count, location_id, description) VALUES
(7, 'активна', '2024-01-25 15:00:00', 50, 7, 'Патрулирование подходов к Зиону'),
(7, 'завершена', '2024-01-20 08:00:00', 12, 8, 'Поиск несанкционированных передач'),
(6, 'ожидание', '2024-01-22 16:45:00', 8, 9, 'Поиск корабля "Навуходоносор"');

-- 5. ФУНКЦИИ И ТРИГГЕРЫ
-- 5.1. Функции
CREATE OR REPLACE FUNCTION escalate_mass_glitch()
RETURNS TRIGGER AS $$
DECLARE
    v_units_count INTEGER;
    v_watcher_user_id INTEGER;
    v_system_user_id INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_units_count
    FROM tickets_units 
    WHERE ticket_id = NEW.ticket_id;
    
    IF v_units_count >= 100 THEN
        UPDATE tickets 
        SET importance_level = 'Высокий', 
            updated_at = NOW()
        WHERE id = NEW.ticket_id;
        
        SELECT id INTO v_system_user_id 
        FROM users 
        WHERE username = 'system';
        
        SELECT id INTO v_watcher_user_id
        FROM users 
        WHERE role_id = 6
        AND is_active = TRUE
        LIMIT 1;
        
        IF v_watcher_user_id IS NOT NULL AND v_system_user_id IS NOT NULL THEN
            INSERT INTO messages (from_user_id, to_user_id, text, sent_at)
            VALUES (
                v_system_user_id,
                v_watcher_user_id,
                'Обнаружен массовый глитч! Тикет #' || NEW.ticket_id || 
                ' повышен до Высокого уровня важности. Затронуто юнитов: ' || v_units_count,
                NOW()
            );
            
            INSERT INTO tickets_comments (created_by, ticket_id, comment, created_at)
            VALUES (
                v_system_user_id,
                NEW.ticket_id,
                'АВТОМАТИЧЕСКОЕ ЭСКАЛИРОВАНИЕ: массовый глитч (>100 юнитов). ' ||
                'Важность повышена до Высокого. Смотритель уведомлен.',
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
BEGIN
    SELECT id INTO v_system_user_id 
    FROM users 
    WHERE username = 'system';
    
    IF v_system_user_id IS NULL THEN
        INSERT INTO users (username, password, role_id, created_at)
        VALUES ('system', 'default_password', 
               (SELECT id FROM roles WHERE name = 'Система'), 
               NOW())
        RETURNING id INTO v_system_user_id;
    END IF;
    
    SELECT id INTO v_last_matrix_id 
    FROM matrix_iterations 
    ORDER BY id DESC 
    LIMIT 1;
    
    IF v_last_matrix_id IS NULL THEN
        INSERT INTO matrix_iterations DEFAULT VALUES 
        RETURNING id INTO v_last_matrix_id;
    END IF;
    
    INSERT INTO oracle_requests (
        matrix_iteration_id, unit_id, status, requested_by, created_at
    ) VALUES (
        v_last_matrix_id,
        NEW.id,
        'pending',
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
    p_anomaly_type_id INTEGER,
    p_coordinates TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_ticket_id INTEGER;
    v_watcher_role_id INTEGER;
BEGIN
    SELECT id INTO v_watcher_role_id 
    FROM roles 
    WHERE name = 'Смотритель';
    
    IF v_watcher_role_id IS NULL THEN
        INSERT INTO roles (name)
        VALUES ('Смотритель')
        RETURNING id INTO v_watcher_role_id;
    END IF;
    
    IF p_threat_level < 1 OR p_threat_level > 3 THEN
        RAISE EXCEPTION 'threat_level должен быть от 1 до 3';
    END IF;
    
    INSERT INTO tickets (
        title, description, threat_level, importance_level,
        assigned_to_role_id, anomaly_type_id, matrix_coordinates,
        created_at, updated_at, status
    ) VALUES (
        p_title, p_description, p_threat_level, 'Низкий',
        v_watcher_role_id, p_anomaly_type_id, p_coordinates,
        NOW(), NOW(), 'новый'
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
        v_current_iteration_id, p_unit_id, 'pending', p_requested_by, NOW()
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
        'closed_tickets', COUNT(*) FILTER (WHERE status = 'закрыт'),
        'pending_tickets', COUNT(*) FILTER (WHERE status = 'на проверке'),
        'high_priority_tickets', COUNT(*) FILTER (WHERE importance_level = 'Высокий'),
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
BEGIN
    INSERT INTO users (username, password, role_id, is_active, created_at)
    VALUES (
        'chosen_' || p_unit_id,
        'temp_pass_' || p_unit_id,
        (SELECT id FROM roles WHERE name = 'Избранный' LIMIT 1),
        TRUE,
        NOW()
    ) RETURNING id INTO v_unit_user_id;
    
    UPDATE units SET status = 'Избранный', status_update_at = NOW() 
    WHERE id = p_unit_id;
    
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
    p_assigned_to_role TEXT
) AS $$
DECLARE
    v_role_id INTEGER;
    v_system_user_id INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
        RAISE EXCEPTION 'Тикет с ID % не существует', p_ticket_id;
    END IF;
    
    SELECT id INTO v_role_id FROM roles WHERE name = p_assigned_to_role;
    
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Роль "%" не существует', p_assigned_to_role;
    END IF;
    
    SELECT id INTO v_system_user_id 
    FROM users 
    WHERE username = 'system';
    
    UPDATE tickets 
    SET assigned_to_role_id = v_role_id,
        updated_at = NOW()
    WHERE id = p_ticket_id;
    
    INSERT INTO tickets_comments (created_by, ticket_id, comment, created_at)
    VALUES (
        COALESCE(v_system_user_id, 1),
        p_ticket_id,
        'Тикет назначен на роль: ' || p_assigned_to_role,
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
    SET status = 'completed', 
        processed_at = NOW()
    WHERE id = p_request_id;
    
    IF v_oracle_user_id IS NOT NULL AND v_requested_by_user_id IS NOT NULL THEN
        INSERT INTO messages (from_user_id, to_user_id, text, sent_at)
        VALUES (
            v_oracle_user_id,
            v_requested_by_user_id,
            'Прогноз для запроса #' || p_request_id || ' готов',
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE initiate_system_audit(
    p_initiated_by INTEGER,
    p_audit_type_id INTEGER
) AS $$
BEGIN
    INSERT INTO system_audits (
        audit_type_id, stability_score, point_of_no_return,
        initiated_by, audit_data, created_at, status
    ) VALUES (
        p_audit_type_id, 0, FALSE,
        p_initiated_by, '{}', NOW(), 'начат'
    );
    
    INSERT INTO messages (from_user_id, to_user_id, text, sent_at)
    SELECT 
        p_initiated_by,
        id,
        'Запущен системный аудит. Возможны задержки в работе системы.',
        NOW()
    FROM users 
    WHERE role_id IN (SELECT id FROM roles WHERE name = 'Смотритель');
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
CREATE INDEX idx_tickets_assigned_role_status ON tickets(assigned_to_role_id, status);
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
CREATE INDEX idx_tickets_complex_search ON tickets(assigned_to_role_id, status, importance_level, created_at);
CREATE INDEX idx_units_candidate_search ON units(disagreement_index, status, status_update_at);

-- 6.3. Специализированные индексы
CREATE INDEX idx_tickets_created_date ON tickets(date_trunc('day', created_at));
CREATE INDEX idx_tickets_closed_date ON tickets(date_trunc('day', updated_at)) WHERE status = 'закрыт';
CREATE INDEX idx_units_awake_candidates ON units(disagreement_index DESC) 
WHERE status IN ('кандидат', 'проснувшийся') 
AND disagreement_index > 8.5;
CREATE INDEX idx_chosen_ones_current ON chosen_ones(matrix_iteration_id, selected_at DESC) 
WHERE restrictions_lifted = TRUE;
CREATE INDEX idx_system_audits_comprehensive ON system_audits(created_at DESC, status, stability_score);
CREATE INDEX idx_units_dossier_fts ON units USING gin(to_tsvector('russian', dossier));
CREATE INDEX idx_tickets_description_fts ON tickets USING gin(to_tsvector('russian', description));
CREATE INDEX idx_tickets_anomaly_stats ON tickets(anomaly_type_id, created_at, threat_level);
CREATE INDEX idx_users_activity ON users(created_at, is_active, role_id);
CREATE INDEX idx_tickets_analytics ON tickets(
    assigned_to_role_id,
    status,
    importance_level,
    threat_level,
    created_at
) INCLUDE (title, anomaly_type_id);
CREATE INDEX idx_tickets_units_count ON tickets_units(ticket_id, unit_id);
