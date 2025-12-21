-- init_data.sql
-- Расширенное наполнение тестовыми данными для системы управления Матрицей

-- 1. ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ ДЛЯ СПРАВОЧНИКОВ

-- 1.1. Добавляем дополнительные секторы
INSERT INTO sectors (code) VALUES
('SECTOR_G7'),
('SECTOR_H8'),
('SECTOR_I9'),
('SECTOR_J10'),
('SECTOR_K11'),
('SECTOR_L12'),
('SECTOR_M13'),
('SECTOR_N14'),
('SECTOR_O15'),
('SECTOR_P16'),
('ZION_INTERIOR'),
('MACHINE_CORE'),
('WASTELANDS'),
('NEBUCHADNEZZAR_PATH'),
('LOGISTICS_HUB'),
('POWER_PLANT_01'),
('POWER_PLANT_02'),
('DATA_CENTER_ALPHA'),
('DATA_CENTER_BETA'),
('BACKUP_NODE_01');

-- 1.2. Добавляем дополнительные итерации матрицы
INSERT INTO matrix_iterations (num, description) VALUES
(7, 'Seventh iteration - Experimental'),
(8, 'Eighth iteration - Balanced (in development)'),
(9, 'Ninth iteration - Utopia 2.0 (planned)'),
(10, 'Tenth iteration - Final (conceptual)');

-- 1.3. Добавляем дополнительные реальные локации
INSERT INTO real_locations (latitude, longitude, z) VALUES
(55.7558, 37.6173, 0),      -- Moscow
(28.6139, 77.2090, 0),      -- New Delhi
(-23.5505, -46.6333, 0),    -- São Paulo
(19.4326, -99.1332, 0),     -- Mexico City
(30.0444, 31.2357, 0),      -- Cairo
(39.9042, 116.4074, 0),     -- Beijing (дополнительная точка)
(1.3521, 103.8198, 0),      -- Singapore
(-33.9249, 18.4241, 0),     -- Cape Town
(59.9311, 30.3609, 0),      -- Saint Petersburg
(-34.6037, -58.3816, 0),    -- Buenos Aires
(0, 0, -2000),              -- Deep Zion
(45.0, 90.0, -1000),        -- Machine City Core
(30.0, 120.0, -800),        -- Sentinel Base 1
(-30.0, -60.0, -750),       -- Sentinel Base 2
(60.0, 30.0, -300),         -- Surface Access Point
(0, 180, -500),             -- Pacific Node
(-90, 0, -1200),            -- Antarctic Backup
(90, 0, -1100),             -- Arctic Monitoring
(0, 90, -950),              -- Indian Ocean Node
(0, -90, -900);             -- Atlantic Node

-- 2. РАСШИРЕННЫЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЕЙ

-- 2.1. Дополнительные пользователи с разными ролями
INSERT INTO users (username, password, role, created_at, is_active) VALUES
-- Архитекторы
('architect_alpha', 'arch_hash_a1', 'ARCHITECT', '2023-12-01 00:00:00', TRUE),
('architect_beta', 'arch_hash_b2', 'ARCHITECT', '2023-12-15 00:00:00', FALSE),

-- Агенты Смита
('agent_smith_03', 'smith_pass_003', 'AGENT_SMITH', '2024-01-01 00:00:11', TRUE),
('agent_smith_04', 'smith_pass_004', 'AGENT_SMITH', '2024-01-01 00:00:12', TRUE),
('agent_smith_05', 'smith_pass_005', 'AGENT_SMITH', '2024-01-01 00:00:13', FALSE),
('agent_smith_06', 'smith_pass_006', 'AGENT_SMITH', '2024-01-01 00:00:14', TRUE),

-- Мониторы
('monitor_gamma', 'watch_789', 'MONITOR', '2024-01-01 00:00:15', TRUE),
('monitor_delta', 'watch_101', 'MONITOR', '2024-01-01 00:00:16', TRUE),
('monitor_epsilon', 'watch_112', 'MONITOR', '2024-01-01 00:00:17', FALSE),
('monitor_zeta', 'watch_131', 'MONITOR', '2024-01-01 00:00:18', TRUE),

-- Механики
('mechanic_03', 'fix1t_003', 'MECHANIC', '2024-01-01 00:00:19', TRUE),
('mechanic_04', 'fix1t_004', 'MECHANIC', '2024-01-01 00:00:20', TRUE),
('mechanic_05', 'fix1t_005', 'MECHANIC', '2024-01-01 00:00:21', FALSE),
('mechanic_06', 'fix1t_006', 'MECHANIC', '2024-01-01 00:00:22', TRUE),

-- Другие роли
('oracle_backup', 'backup_prophecy', 'ORACLE', '2024-01-01 00:00:23', TRUE),
('keymaster_2', 'keys_2_all', 'KEYMAKER', '2024-01-01 00:00:24', TRUE),
('sentinel_ctrl_2', 'ext3rnal_force2', 'SENTINEL_CONTROLLER', '2024-01-01 00:00:25', TRUE),

-- Тестовые пользователи для избранных
('the_one_01', 'one_pass_001', 'THE_ONE', '2024-01-10 00:00:00', FALSE),
('the_one_02', 'one_pass_002', 'THE_ONE', '2024-01-12 00:00:00', FALSE),
('the_one_03', 'one_pass_003', 'THE_ONE', '2024-01-14 00:00:00', FALSE);

-- 3. РАСШИРЕННЫЕ ДАННЫЕ ЮНИТОВ

INSERT INTO units (disagreement_index, status, dossier, status_update_at, real_location_id) VALUES
-- Нормальные юниты с разными индексами
(0.5, 'NORMAL', 'Alice Johnson, kindergarten teacher', '2024-01-24 09:00:00', 11),
(1.8, 'NORMAL', 'Bob Smith, construction worker', '2024-01-24 10:00:00', 12),
(3.2, 'NORMAL', 'Carol Davis, nurse', '2024-01-24 11:00:00', 13),
(4.7, 'NORMAL', 'David Wilson, taxi driver', '2024-01-24 12:00:00', 14),
(5.5, 'NORMAL', 'Eva Brown, accountant', '2024-01-24 13:00:00', 15),

-- Кандидаты с разными уровнями несогласия
(8.6, 'CANDIDATE', 'Frank Miller, philosopher - questioning reality', '2024-01-24 14:00:00', 16),
(8.9, 'CANDIDATE', 'Grace Lee, physicist - noticing anomalies', '2024-01-24 15:00:00', 17),
(9.0, 'CANDIDATE', 'Henry Chen, programmer - debug instinct', '2024-01-24 16:00:00', 18),
(9.3, 'CANDIDATE', 'Irene Park, artist - sees patterns', '2024-01-24 17:00:00', 19),
(9.1, 'CANDIDATE', 'Jack Taylor, security guard - suspicious nature', '2024-01-24 18:00:00', 20),

-- Проснувшиеся
(9.7, 'AWAKENED', 'Katherine White - escaped from pods', '2024-01-23 20:00:00', 21),
(9.6, 'AWAKENED', 'Leo Black - resistance member', '2024-01-23 21:00:00', 22),
(9.4, 'AWAKENED', 'Mona Green - hacker background', '2024-01-23 22:00:00', 23),

-- Подозрительные
(7.5, 'SUSPICIOUS', 'Nick Blue - frequent deja vu', '2024-01-24 19:00:00', 24),
(7.8, 'SUSPICIOUS', 'Olivia Yellow - lucid dreams', '2024-01-24 20:00:00', 25),
(8.2, 'SUSPICIOUS', 'Paul Red - conspiracy theorist', '2024-01-24 21:00:00', 26),

-- Массовые юниты для тестирования (для триггеров)
(6.0, 'NORMAL', 'Unit #1001 - test subject', '2024-01-25 08:00:00', 1),
(6.1, 'NORMAL', 'Unit #1002 - test subject', '2024-01-25 08:05:00', 1),
(6.2, 'NORMAL', 'Unit #1003 - test subject', '2024-01-25 08:10:00', 1),
(6.3, 'NORMAL', 'Unit #1004 - test subject', '2024-01-25 08:15:00', 1),
(6.4, 'NORMAL', 'Unit #1005 - test subject', '2024-01-25 08:20:00', 1);

-- 4. РАСШИРЕННЫЕ РАЗРЕШЕНИЯ

INSERT INTO role_permissions (role, permission) VALUES
-- Дополнительные разрешения для Архитектора
('ARCHITECT', 'MANAGE_SENTINELS'),
('ARCHITECT', 'CREATE_SIMULATIONS'),

-- Дополнительные разрешения для Системного Ядра
('SYSTEM_KERNEL', 'MANAGE_SENTINELS'),
('SYSTEM_KERNEL', 'MANAGE_RESOURCES'),

-- Дополнительные разрешения для Агента Смита
('AGENT_SMITH', 'ASSIGN_TICKETS'),
('AGENT_SMITH', 'MANAGE_SENTINELS'),

-- Разрешения для THE_ONE (если нужно)
('THE_ONE', 'VIEW_TICKETS'),
('THE_ONE', 'VIEW_DOSSIER');

-- 5. РАСШИРЕННЫЕ МЕХАНИКИ И РАЗРЕШЕНИЯ

INSERT INTO mechanic_permissions (user_id, sector_id, permission_start, permission_end) VALUES
(10, 7, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(10, 8, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(11, 9, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(11, 10, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(19, 11, '2024-02-01 00:00:00', '2024-12-31 23:59:59'),
(19, 12, '2024-02-01 00:00:00', '2024-12-31 23:59:59'),
(20, 13, '2024-02-01 00:00:00', '2024-12-31 23:59:59'),
(20, 14, '2024-02-01 00:00:00', '2024-12-31 23:59:59');

-- 6. РАСШИРЕННЫЕ СИСТЕМНЫЕ АУДИТЫ

INSERT INTO system_audits (audit_type, stability_score, point_of_no_return, initiated_by, audit_data, created_at, status) VALUES
('SECTOR_STABILITY_AUDIT', 85, FALSE, 2, '{"sector": "SECTOR_A1", "glitch_count": 45, "avg_response_time": "45s"}', '2024-01-20 10:00:00', 'COMPLETED'),
('RESOURCE_AUDIT', 92, FALSE, 2, '{"cpu_usage": "78%", "memory_usage": "65%", "storage_available": "45PB"}', '2024-01-21 11:00:00', 'COMPLETED'),
('SECURITY_AUDIT', 88, FALSE, 1, '{"failed_logins": 123, "suspicious_activities": 8, "firewall_breaches": 0}', '2024-01-22 14:00:00', 'COMPLETED'),
('CHOSEN_ONE_SELECTION', 0, TRUE, 1, '{"candidates_evaluated": 15, "selection_criteria": "disagreement_index>9.5"}', '2024-01-24 09:00:00', 'COMPLETED'),
('FULL_SYSTEM_AUDIT', 91, FALSE, 2, '{"overall_health": "good", "critical_issues": 2, "performance_score": 94}', '2024-01-23 16:00:00', 'COMPLETED'),
('PRE_REBOOT_AUDIT', 79, TRUE, 1, '{"unstable_nodes": 28, "data_loss_risk": "medium", "reboot_estimated_time": "2h45m"}', '2024-01-25 08:00:00', 'IN_PROGRESS');

-- 7. РАСШИРЕННЫЕ ОТЧЕТЫ

INSERT INTO reports (period_start, period_end, generated_data, created_at) VALUES
('2024-01-21 00:00:00', '2024-01-21 23:59:59', '{"tickets_created": 167, "tickets_closed": 155, "avg_response_time": "2.8m", "stability_score": 93}', '2024-01-22 00:05:00'),
('2024-01-22 00:00:00', '2024-01-22 23:59:59', '{"tickets_created": 189, "tickets_closed": 172, "avg_response_time": "3.5m", "stability_score": 90}', '2024-01-23 00:05:00'),
('2024-01-23 00:00:00', '2024-01-23 23:59:59', '{"tickets_created": 201, "tickets_closed": 188, "avg_response_time": "4.2m", "stability_score": 88}', '2024-01-24 00:05:00'),
('2024-01-24 00:00:00', '2024-01-24 23:59:59', '{"tickets_created": 178, "tickets_closed": 165, "avg_response_time": "3.0m", "stability_score": 91}', '2024-01-25 00:05:00'),
('2024-01-25 00:00:00', '2024-01-25 12:00:00', '{"tickets_created": 95, "tickets_closed": 87, "avg_response_time": "2.1m", "stability_score": 94}', '2024-01-25 12:05:00');

-- 8. РАСШИРЕННЫЕ ТИКЕТЫ (разные сценарии)

INSERT INTO tickets (title, description, threat_level, importance_level, assigned_to_role, anomaly_type, report_id, matrix_coordinates, created_at, updated_at, status) VALUES
-- Низкий уровень угрозы
('Floating newspaper', 'Newspaper floating 5cm above ground', 1, 'LOW', 'MECHANIC', 'PHYSICS_GLITCH', NULL, 'SECTOR_G7:123,456', '2024-01-25 09:00:00', '2024-01-25 09:05:00', 'NEW'),
('Color shift', 'Minor color palette distortion in sunset', 1, 'LOW', 'MECHANIC', 'VISUAL_ARTIFACT', NULL, 'SECTOR_H8:234,567', '2024-01-25 09:30:00', '2024-01-25 09:35:00', 'NEW'),
('Deja vu report', 'Multiple reports of deja vu in same location', 1, 'LOW', 'AGENT_SMITH', 'TIME_PARADOX', NULL, 'SECTOR_I9:345,678', '2024-01-25 10:00:00', '2024-01-25 10:05:00', 'NEW'),

-- Средний уровень угрозы
('NPC dialogue loop', 'NPC repeating same dialogue for 24h', 2, 'MEDIUM', 'MECHANIC', 'SIMULATION_LOGIC_FAILURE', NULL, 'SECTOR_J10:456,789', '2024-01-25 10:30:00', '2024-01-25 10:35:00', 'NEW'),
('Memory leak detection', 'Memory usage spiking in sector', 2, 'MEDIUM', 'MECHANIC', 'UNAUTHORIZED_ACCESS', NULL, 'DATA_CENTER_ALPHA:001,002', '2024-01-25 11:00:00', '2024-01-25 11:05:00', 'IN_PROGRESS'),
('Missing texture batch', '50+ units missing facial textures', 2, 'MEDIUM', 'MECHANIC', 'VISUAL_ARTIFACT', NULL, 'SECTOR_K11:567,890', '2024-01-25 11:30:00', '2024-01-25 11:35:00', 'NEW'),

-- Высокий уровень угрозы
('Mass reality denial', 'Group of 30 units questioning reality', 3, 'HIGH', 'AGENT_SMITH', 'UNIT_AWAKENING', NULL, 'SECTOR_L12:678,901', '2024-01-25 12:00:00', '2024-01-25 12:05:00', 'NEW'),
('Core breach attempt', 'Attempt to access simulation core detected', 3, 'HIGH', 'AGENT_SMITH', 'UNAUTHORIZED_ACCESS', NULL, 'MAINFRAME_CORE:002,002', '2024-01-25 12:30:00', '2024-01-25 12:35:00', 'IN_PROGRESS'),
('Time dilation anomaly', 'Time flowing 15% slower in sector', 3, 'HIGH', 'MECHANIC', 'TIME_PARADOX', NULL, 'SECTOR_M13:789,012', '2024-01-25 13:00:00', '2024-01-25 13:05:00', 'NEW'),

-- Для тестирования массовых глитчей
('Mass physics failure', 'Gravity anomalies affecting large area', 2, 'MEDIUM', 'MECHANIC', 'PHYSICS_GLITCH', NULL, 'SECTOR_N14:890,123', '2024-01-25 13:30:00', '2024-01-25 13:35:00', 'NEW'),

-- Разные статусы для тестирования
('Resolved minor glitch', 'Already fixed door texture issue', 1, 'LOW', 'MECHANIC', 'VISUAL_ARTIFACT', 3, 'SECTOR_O15:901,234', '2024-01-24 14:00:00', '2024-01-24 16:00:00', 'CLOSED'),
('Under investigation', 'Suspicious network activity', 2, 'MEDIUM', 'AGENT_SMITH', 'UNAUTHORIZED_ACCESS', NULL, 'LOGISTICS_HUB:003,003', '2024-01-24 15:00:00', '2024-01-25 09:00:00', 'UNDER_REVIEW'),
('Escalated to architect', 'Critical system instability', 3, 'HIGH', 'ARCHITECT', 'SIMULATION_LOGIC_FAILURE', NULL, 'MAINFRAME_CORE:001,003', '2024-01-24 16:00:00', '2024-01-24 16:30:00', 'ESCALATED');

-- 9. РАСШИРЕННЫЕ ЗАПРОСЫ К ОРАКУЛУ

INSERT INTO oracle_requests (matrix_iteration_id, unit_id, status, requested_by, processed_at, created_at) VALUES
(5, 11, 'COMPLETED', 3, '2024-01-24 10:00:00', '2024-01-24 09:45:00'),
(5, 12, 'FAILED', 4, '2024-01-24 11:30:00', '2024-01-24 11:15:00'),
(5, 13, 'PENDING', 5, NULL, '2024-01-24 12:00:00'),
(5, 14, 'PROCESSING', 6, NULL, '2024-01-24 13:00:00'),
(5, 15, 'COMPLETED', 3, '2024-01-24 14:30:00', '2024-01-24 14:15:00'),
(5, 16, 'PENDING', 4, NULL, '2024-01-24 15:00:00'),
(5, 17, 'COMPLETED', 5, '2024-01-24 16:00:00', '2024-01-24 15:45:00'),
(5, 18, 'FAILED', 6, '2024-01-24 17:30:00', '2024-01-24 17:15:00');

-- 10. РАСШИРЕННЫЕ ПРОГНОЗЫ

INSERT INTO forecasts (oracle_request_id, forecast, created_at) VALUES
(5, '{"success_rate": 0.92, "recommended_action": "monitor", "timeframe": "72h", "risk_factor": 0.15}', '2024-01-24 10:00:00'),
(6, '{"error": "insufficient_data", "retry_recommended": true, "additional_data_needed": ["brain_activity_logs"]}', '2024-01-24 11:30:00'),
(7, '{"success_rate": 0.45, "recommended_action": "immediate_intervention", "timeframe": "12h", "risk_factor": 0.78}', '2024-01-24 14:30:00'),
(9, '{"success_rate": 0.67, "recommended_action": "psychological_profile_update", "timeframe": "48h", "risk_factor": 0.32}', '2024-01-24 16:00:00'),
(10, '{"error": "system_overload", "retry_recommended": false, "suggested_alternative": "direct_observation"}', '2024-01-24 17:30:00');

-- 11. РАСШИРЕННЫЕ ИЗБРАННЫЕ (исторические данные)

INSERT INTO chosen_ones (unit_id, restrictions_lifted, final_decision, selected_by, user_id, matrix_iteration_id, selected_at) VALUES
(5, TRUE, 'Matrix Reboot - Success', 1, 15, 4, '2023-06-15 12:00:00'),
(6, TRUE, 'Matrix Reboot - Partial Success', 1, 16, 3, '2022-03-20 12:00:00'),
(7, FALSE, 'Rejected - Unstable', 1, 17, 2, '2021-01-10 12:00:00'),
(8, TRUE, 'Zion Destruction', 1, 18, 1, '2020-09-05 12:00:00');

-- 12. РАСШИРЕННЫЕ СООБЩЕНИЯ

INSERT INTO messages (from_user_id, to_user_id, text, sent_at) VALUES
-- Оперативные сообщения
(2, 7, 'New candidate detected in sector G7', '2024-01-25 09:15:00'),
(7, 3, 'Please investigate potential awakening event', '2024-01-25 09:20:00'),
(3, 7, 'Acknowledged. Moving to location.', '2024-01-25 09:25:00'),
(2, 10, 'Physics glitch in sector N14 requires attention', '2024-01-25 13:40:00'),
(10, 2, 'On it. Need temporary admin access.', '2024-01-25 13:45:00'),

-- Координационные сообщения
(1, 7, 'Prepare sentinel squad for sector L12', '2024-01-25 12:10:00'),
(7, 1, 'Sentinels dispatched. ETA 15 minutes.', '2024-01-25 12:15:00'),
(6, 1, 'Oracle prediction ready for review', '2024-01-25 14:00:00'),
(1, 6, 'Reviewing now. Stand by for decision.', '2024-01-25 14:05:00'),

-- Технические сообщения
(2, 19, 'System patch available for visual artifacts', '2024-01-25 10:00:00'),
(19, 2, 'Patch applied. Testing now.', '2024-01-25 10:05:00'),
(2, 20, 'Memory leak detected. Investigate immediately.', '2024-01-25 11:10:00'),
(20, 2, 'Investigating. Suspect unauthorized process.', '2024-01-25 11:15:00');

-- 13. РАСШИРЕННЫЕ СВЯЗИ ПОЛЬЗОВАТЕЛЕЙ И ТИКЕТОВ

INSERT INTO users_tickets (user_id, ticket_id, assigned_at, processed_at) VALUES
-- Новые назначения
(19, 6, '2024-01-25 09:05:00', NULL),
(19, 7, '2024-01-25 09:35:00', NULL),
(4, 8, '2024-01-25 10:05:00', NULL),
(20, 9, '2024-01-25 10:35:00', NULL),
(20, 10, '2024-01-25 11:05:00', NULL),
(19, 11, '2024-01-25 11:35:00', NULL),
(5, 12, '2024-01-25 12:05:00', NULL),
(6, 13, '2024-01-25 12:35:00', NULL),
(20, 14, '2024-01-25 13:05:00', NULL),
(19, 15, '2024-01-25 13:35:00', NULL),

-- Обработанные тикеты
(19, 16, '2024-01-24 14:05:00', '2024-01-24 16:00:00'),
(4, 17, '2024-01-24 15:05:00', '2024-01-25 09:00:00'),
(1, 18, '2024-01-24 16:05:00', '2024-01-24 16:30:00');

-- 14. РАСШИРЕННЫЕ СВЯЗИ ТИКЕТОВ И ЮНИТОВ (для тестирования массовых глитчей)

INSERT INTO tickets_units (unit_id, ticket_id, status) VALUES
-- Массовый глитч (15 юнитов)
(21, 15, 'AFFECTED'),
(22, 15, 'AFFECTED'),
(23, 15, 'AFFECTED'),
(24, 15, 'AFFECTED'),
(25, 15, 'AFFECTED'),
(11, 15, 'AFFECTED'),
(12, 15, 'AFFECTED'),
(13, 15, 'AFFECTED'),
(14, 15, 'AFFECTED'),
(15, 15, 'AFFECTED'),
(16, 15, 'AFFECTED'),
(17, 15, 'AFFECTED'),
(18, 15, 'AFFECTED'),
(19, 15, 'AFFECTED'),
(20, 15, 'AFFECTED'),

-- Другие связи
(11, 6, 'WITNESS'),
(12, 7, 'SUSPECT'),
(13, 8, 'AFFECTED'),
(14, 9, 'FIXED'),
(15, 10, 'SUSPECT');

-- 15. РАСШИРЕННЫЕ КОММЕНТАРИИ К ТИКЕТАМ

INSERT INTO tickets_comments (created_by, ticket_id, comment, created_at) VALUES
(7, 6, 'Minor glitch. Assigned to mechanic for routine fix.', '2024-01-25 09:05:00'),
(19, 6, 'Fixed gravity parameter. No side effects detected.', '2024-01-25 09:45:00'),
(7, 7, 'Visual artifact reported by multiple units. Investigating.', '2024-01-25 09:35:00'),
(4, 8, 'Time anomaly detected. Possible paradox risk.', '2024-01-25 10:05:00'),
(20, 9, 'NPC behavior abnormal. Checking dialogue scripts.', '2024-01-25 10:35:00'),
(2, 10, 'Security breach alert! Immediate action required.', '2024-01-25 11:05:00'),
(20, 10, 'Investigating memory leak. Suspect malicious code.', '2024-01-25 11:20:00'),
(7, 11, 'Mass texture issue. Escalating priority.', '2024-01-25 11:35:00'),
(5, 12, 'Group awakening detected! High risk situation.', '2024-01-25 12:05:00'),
(6, 13, 'Core security compromised. All agents on high alert.', '2024-01-25 12:35:00'),
(20, 14, 'Time dilation confirmed. Physics constants unstable.', '2024-01-25 13:05:00'),
(7, 15, 'Mass gravity failure. Over 15 units affected.', '2024-01-25 13:35:00');

-- 16. РАСШИРЕННЫЕ ЗАДАЧИ СЕНТИНЕЛЕЙ

INSERT INTO sentinel_tasks (created_by, status, created_at, sentinel_count, location_id, description) VALUES
(8, 'ACTIVE', '2024-01-25 09:00:00', 25, 27, 'Patrolling Zion perimeter'),
(8, 'COMPLETED', '2024-01-24 20:00:00', 8, 28, 'Destroy rebel outpost'),
(8, 'PENDING', '2024-01-25 10:00:00', 15, 29, 'Intercept rebel transmission'),
(8, 'ACTIVE', '2024-01-25 11:00:00', 30, 30, 'Guard machine city entrance'),
(8, 'CANCELLED', '2024-01-25 12:00:00', 10, 31, 'Scout abandoned area - cancelled due to storm'),
(25, 'ACTIVE', '2024-01-25 13:00:00', 20, 32, 'Search for Nebuchadnezzar'),
(25, 'PENDING', '2024-01-25 14:00:00', 12, 33, 'Investigate energy spike');

-- 17. ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ ДЛЯ ТЕСТИРОВАНИЯ ТРИГГЕРОВ
-- Добавим массовый тикет с большим количеством юнитов для тестирования автоматической эскалации

-- Создаем тикет для массового глитча
INSERT INTO tickets (title, description, threat_level, importance_level, assigned_to_role, anomaly_type, report_id, matrix_coordinates, created_at, updated_at, status) VALUES
('Mass simulation failure', 'Critical failure affecting entire sector population', 3, 'MEDIUM', 'MECHANIC', 'MASS_GLITCH', NULL, 'SECTOR_P16:999,999', '2024-01-25 14:00:00', '2024-01-25 14:05:00', 'NEW');

-- Назначаем тикет
INSERT INTO users_tickets (user_id, ticket_id, assigned_at, processed_at) VALUES
(19, 19, '2024-01-25 14:05:00', NULL);

-- Добавляем более 100 юнитов к этому тикету для тестирования триггера
-- (В реальном скрипте здесь был бы цикл или генерация, но для примера добавим несколько)
INSERT INTO tickets_units (unit_id, ticket_id, status) VALUES
(1, 19, 'AFFECTED'),
(2, 19, 'AFFECTED'),
(3, 19, 'AFFECTED'),
(4, 19, 'AFFECTED'),
(5, 19, 'AFFECTED'),
(6, 19, 'AFFECTED'),
(7, 19, 'AFFECTED'),
(8, 19, 'AFFECTED'),
(9, 19, 'AFFECTED'),
(10, 19, 'AFFECTED'),
(11, 19, 'AFFECTED'),
(12, 19, 'AFFECTED'),
(13, 19, 'AFFECTED'),
(14, 19, 'AFFECTED'),
(15, 19, 'AFFECTED');

-- Добавляем комментарий
INSERT INTO tickets_comments (created_by, ticket_id, comment, created_at) VALUES
(7, 19, 'Massive system failure detected. Emergency protocols activated.', '2024-01-25 14:05:00');

-- 18. ДОПОЛНИТЕЛЬНЫЕ ТЕСТОВЫЕ СЦЕНАРИИ

-- Создаем юнита с высоким индексом несогласия для тестирования триггера create_candidate
INSERT INTO units (disagreement_index,