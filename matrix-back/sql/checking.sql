
-- ============================================
-- ТЕСТИРОВАНИЕ БАЗЫ ДАННЫХ - РАСШИРЕННАЯ ВЕРСИЯ
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'НАЧАЛО ТЕСТИРОВАНИЯ БАЗЫ ДАННЫХ';
    RAISE NOTICE 'Время начала: %', NOW();
    RAISE NOTICE '============================================';
END $$;

-- 1. ПРОВЕРКА ТРИГГЕРА МАССОВОГО ГЛИТЧА (trg_escalate_mass_glitch)
-- Тест: создаем массовый глитч (>100 юнитов)

DO $$ 
DECLARE 
    test_ticket_id INTEGER;
    test_unit_id INTEGER;
    i INTEGER;
    units_count_before INTEGER;
    units_count_after INTEGER;
    ticket_importance_before VARCHAR(50);
    ticket_importance_after VARCHAR(50);
    messages_count_before INTEGER;
    messages_count_after INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '1. ТЕСТ ТРИГГЕРА МАССОВОГО ГЛИТЧА';
    RAISE NOTICE '============================================';
    
    -- Запоминаем начальные данные
    SELECT COUNT(*) INTO messages_count_before FROM messages;
    RAISE NOTICE 'Сообщений до теста: %', messages_count_before;
    
    -- Создаем тестовый тикет
    INSERT INTO tickets (
        title, description, threat_level, importance_level,
        assigned_to_role_id, anomaly_type_id, matrix_coordinates,
        created_at, updated_at, status
    ) VALUES (
        'Тест массового глитча', 
        'Тестирование автоматического повышения важности при массовом поражении юнитов', 
        1, 'Низкий',
        8, 8, 'TEST:000,000',
        NOW(), NOW(), 'новый'
    ) RETURNING id INTO test_ticket_id;
    
    RAISE NOTICE 'Создан тестовый тикет:';
    RAISE NOTICE '  - ID: %', test_ticket_id;
    RAISE NOTICE '  - Название: "Тест массового глитча"';
    RAISE NOTICE '  - Изначальная важность: "Низкий"';
    
    -- Запоминаем важность до теста
    SELECT importance_level INTO ticket_importance_before 
    FROM tickets WHERE id = test_ticket_id;
    
    -- Создаем 101 связь с юнитами
    RAISE NOTICE '';
    RAISE NOTICE 'Создание 101 связи тикет-юнит...';
    
    FOR i IN 1..101 LOOP
        INSERT INTO units (disagreement_index, status, status_update_at, real_location_id)
        VALUES (1.0, 'нормальный', NOW(), 1)
        RETURNING id INTO test_unit_id;
        
        INSERT INTO tickets_units (unit_id, ticket_id, status)
        VALUES (test_unit_id, test_ticket_id, 'затронут');
        
        -- Прогресс-бар
        IF i % 10 = 0 THEN
            RAISE NOTICE '  Создано связей: % из 101', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✓ Создано 101 связей тикет-юнит';
    
    -- Даем время триггеру на обработку
    RAISE NOTICE 'Ожидание обработки триггером (1 сек)...';
    PERFORM pg_sleep(1);
    
    -- Проверяем результат
    RAISE NOTICE '';
    RAISE NOTICE 'ПРОВЕРКА РЕЗУЛЬТАТОВ:';
    
    -- Проверяем, повысилась ли важность
    SELECT importance_level INTO ticket_importance_after 
    FROM tickets WHERE id = test_ticket_id;
    
    IF ticket_importance_after = 'Высокий' THEN
        RAISE NOTICE '✓ ТРИГГЕР СРАБОТАЛ УСПЕШНО';
        RAISE NOTICE '  - Важность изменена: "%" → "%"', 
            ticket_importance_before, ticket_importance_after;
    ELSE
        RAISE NOTICE '✗ ТРИГГЕР НЕ СРАБОТАЛ';
        RAISE NOTICE '  - Важность осталась: "%"', ticket_importance_after;
    END IF;
    
    -- Проверяем, создалось ли сообщение для Смотрителя
    SELECT COUNT(*) INTO messages_count_after FROM messages;
    DECLARE
        new_messages_count INTEGER;
        watcher_message_exists BOOLEAN;
    BEGIN
        new_messages_count := messages_count_after - messages_count_before;
        RAISE NOTICE '  - Создано новых сообщений: %', new_messages_count;
        
        watcher_message_exists := EXISTS (
            SELECT 1 FROM messages 
            WHERE text LIKE '%массовый глитч%' 
            AND text LIKE '%' || test_ticket_id || '%'
            AND text LIKE '%Высок%'
        );
        
        IF watcher_message_exists THEN
            RAISE NOTICE '✓ Сообщение для Смотрителя создано';
        ELSE
            RAISE NOTICE '✗ Сообщение для Смотрителя не создано';
        END IF;
    END;
    
    -- Дополнительные проверки
    DECLARE
        units_linked_count INTEGER;
        ticket_update_time TIMESTAMP;
    BEGIN
        -- Количество связанных юнитов
        SELECT COUNT(*) INTO units_linked_count
        FROM tickets_units WHERE ticket_id = test_ticket_id;
        RAISE NOTICE '  - Юнитов связано с тикетом: %', units_linked_count;
        
        -- Время обновления тикета
        SELECT updated_at INTO ticket_update_time
        FROM tickets WHERE id = test_ticket_id;
        RAISE NOTICE '  - Тикет обновлен в: %', ticket_update_time;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Тест завершен.';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✗ ОШИБКА ПРИ ТЕСТИРОВАНИИ: %', SQLERRM;
END $$;

-- 2. ПРОВЕРКА ТРИГГЕРА СОЗДАНИЯ КАНДИДАТА (trg_create_candidate)
-- Тест: создаем юнита с высоким индексом несогласия

DO $$ 
DECLARE 
    test_unit_id INTEGER;
    test_unit_id2 INTEGER;
    oracle_request_count INTEGER;
    oracle_request_data RECORD;
    system_user_exists BOOLEAN;
    matrix_iteration_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '2. ТЕСТ ТРИГГЕРА СОЗДАНИЯ КАНДИДАТА';
    RAISE NOTICE '============================================';
    
    -- Проверяем необходимые данные
    system_user_exists := EXISTS (SELECT 1 FROM users WHERE username = 'system');
    matrix_iteration_exists := EXISTS (SELECT 1 FROM matrix_iterations);
    
    RAISE NOTICE 'ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА:';
    RAISE NOTICE '  - Пользователь "system" существует: %', 
        CASE WHEN system_user_exists THEN '✓' ELSE '✗ (будет создан автоматически)' END;
    RAISE NOTICE '  - Матричная итерация существует: %', 
        CASE WHEN matrix_iteration_exists THEN '✓' ELSE '✗ (будет создана автоматически)' END;
    
    -- ТЕСТ 1: Создание нового юнита с индексом > 8.5
    RAISE NOTICE '';
    RAISE NOTICE 'ТЕСТ 1: Создание кандидата (disagreement_index = 9.0)';
    
    INSERT INTO units (disagreement_index, status, dossier, status_update_at, real_location_id)
    VALUES (
        9.0, 
        'нормальный', 
        'Тестовый кандидат для проверки триггера', 
        NOW(), 
        1
    ) RETURNING id INTO test_unit_id;
    
    RAISE NOTICE '  - Создан юнит ID: %', test_unit_id;
    RAISE NOTICE '  - Индекс несогласия: 9.0';
    RAISE NOTICE '  - Досье: "Тестовый кандидат для проверки триггера"';
    
    -- Даем время триггеру
    RAISE NOTICE '  Ожидание обработки триггером...';
    PERFORM pg_sleep(1);
    
    -- Проверяем, создался ли запрос к Оракулу
    SELECT COUNT(*) INTO oracle_request_count 
    FROM oracle_requests 
    WHERE unit_id = test_unit_id 
    AND status = 'pending';
    
    IF oracle_request_count > 0 THEN
        RAISE NOTICE '✓ ТРИГГЕР СРАБОТАЛ: запрос к Оракулу создан';
        
        -- Получаем детали запроса
        SELECT * INTO oracle_request_data
        FROM oracle_requests 
        WHERE unit_id = test_unit_id 
        ORDER BY created_at DESC 
        LIMIT 1;
        
        RAISE NOTICE '  - ID запроса: %', oracle_request_data.id;
        RAISE NOTICE '  - Статус: %', oracle_request_data.status;
        RAISE NOTICE '  - Создан: %', oracle_request_data.created_at;
        RAISE NOTICE '  - Запросил: пользователь ID %', oracle_request_data.requested_by;
        
    ELSE
        RAISE NOTICE '✗ ТРИГГЕР НЕ СРАБОТАЛ: запрос к Оракулу не создан';
    END IF;
    
    -- ТЕСТ 2: Обновление существующего юнита
    RAISE NOTICE '';
    RAISE NOTICE 'ТЕСТ 2: Обновление юнита до кандидата (disagreement_index = 9.0 → 9.5)';
    
    UPDATE units 
    SET disagreement_index = 9.5,
        dossier = 'Обновленное досье кандидата',
        status_update_at = NOW()
    WHERE id = test_unit_id;
    
    RAISE NOTICE '  - Обновлен юнит ID: %', test_unit_id;
    RAISE NOTICE '  - Новый индекс несогласия: 9.5';
    
    PERFORM pg_sleep(1);
    
    SELECT COUNT(*) INTO oracle_request_count 
    FROM oracle_requests 
    WHERE unit_id = test_unit_id;
    
    IF oracle_request_count >= 2 THEN
        RAISE NOTICE '✓ ТРИГГЕР СРАБОТАЛ ПРИ ОБНОВЛЕНИИ: создан второй запрос';
        RAISE NOTICE '  - Всего запросов для этого юнита: %', oracle_request_count;
    ELSE
        RAISE NOTICE '✗ ТРИГГЕР НЕ СРАБОТАЛ ПРИ ОБНОВЛЕНИИ';
        RAISE NOTICE '  - Всего запросов: %', oracle_request_count;
    END IF;
    
    -- ТЕСТ 3: Создание юнита без триггера (индекс < 8.5)
    RAISE NOTICE '';
    RAISE NOTICE 'ТЕСТ 3: Создание обычного юнита (disagreement_index = 7.0)';
    
    INSERT INTO units (disagreement_index, status, status_update_at, real_location_id)
    VALUES (7.0, 'нормальный', NOW(), 1)
    RETURNING id INTO test_unit_id2;
    
    PERFORM pg_sleep(1);
    
    SELECT COUNT(*) INTO oracle_request_count 
    FROM oracle_requests 
    WHERE unit_id = test_unit_id2;
    
    IF oracle_request_count = 0 THEN
        RAISE NOTICE '✓ ТРИГГЕР НЕ СРАБОТАЛ (корректно): индекс 7.0 < 8.5';
        RAISE NOTICE '  - Запросов создано: 0';
    ELSE
        RAISE NOTICE '✗ ТРИГГЕР СРАБОТАЛ НЕКОРРЕКТНО: должен был игнорировать индекс 7.0';
        RAISE NOTICE '  - Запросов создано: %', oracle_request_count;
    END IF;
    
    -- Сводка
    RAISE NOTICE '';
    RAISE NOTICE 'ИТОГИ ТЕСТА ТРИГГЕРА:';
    DECLARE
        total_units INTEGER;
        total_oracle_requests INTEGER;
        trigger_success_rate NUMERIC;
    BEGIN
        SELECT COUNT(*) INTO total_units FROM units;
        SELECT COUNT(*) INTO total_oracle_requests FROM oracle_requests;
        
        RAISE NOTICE '  - Всего юнитов в системе: %', total_units;
        RAISE NOTICE '  - Всего запросов к Оракулу: %', total_oracle_requests;
        
        IF total_units > 0 THEN
            trigger_success_rate := (total_oracle_requests::NUMERIC / total_units::NUMERIC) * 100;
            RAISE NOTICE '  - Процент юнитов с запросами: % %%', ROUND(trigger_success_rate, 2);
        END IF;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Тест завершен.';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✗ ОШИБКА ПРИ ТЕСТИРОВАНИИ: %', SQLERRM;
END $$;

-- 3. ПРОВЕРКА ФУНКЦИЙ И ПРОЦЕДУР

DO $$
DECLARE
    new_ticket_id INTEGER;
    report_id INTEGER;
    chosen_one_id INTEGER;
    request_id INTEGER;
    test_result_count INTEGER := 0;
    test_failed_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '3. ТЕСТИРОВАНИЕ ФУНКЦИЙ И ПРОЦЕДУР';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Будет протестировано 4 основные функции:';
    RAISE NOTICE '  1. UC-101: create_glitch_ticket_manual()';
    RAISE NOTICE '  2. UC-103: generate_daily_report()';
    RAISE NOTICE '  3. UC-201: request_oracle_prediction()';
    RAISE NOTICE '  4. UC-302: select_chosen_one()';
    RAISE NOTICE '';
    
    -- ===========================================
    -- ТЕСТ UC-101: создание тикета
    -- ===========================================
    BEGIN
        RAISE NOTICE 'ТЕСТ UC-101: создание тикета вручную';
        RAISE NOTICE '----------------------------------------';
        
        test_result_count := test_result_count + 1;
        
        new_ticket_id := create_glitch_ticket_manual(
            'Тест ручного создания тикета',
            'Это тестовый тикет созданный через функцию create_glitch_ticket_manual(). ' ||
            'Используется для проверки работы системы ручного создания аномалий.',
            2,  -- threat_level (средний)
            1,  -- anomaly_type_id
            'TEST:123,456'  -- координаты
        );
        
        RAISE NOTICE '✓ ФУНКЦИЯ ВЫПОЛНЕНА УСПЕШНО';
        RAISE NOTICE '  - Создан тикет ID: %', new_ticket_id;
        
        -- Проверяем созданный тикет
        DECLARE
            ticket_data RECORD;
        BEGIN
            SELECT * INTO ticket_data 
            FROM tickets 
            WHERE id = new_ticket_id;
            
            IF ticket_data.id IS NOT NULL THEN
                RAISE NOTICE '  - Название: "%"', ticket_data.title;
                RAISE NOTICE '  - Уровень угрозы: %', ticket_data.threat_level;
                RAISE NOTICE '  - Важность: "%"', ticket_data.importance_level;
                RAISE NOTICE '  - Статус: "%"', ticket_data.status;
                RAISE NOTICE '  - Координаты: "%"', ticket_data.matrix_coordinates;
                RAISE NOTICE '  - Создан: %', ticket_data.created_at;
            END IF;
        END;
        
        -- Тест назначения тикета
        BEGIN
            RAISE NOTICE '';
            RAISE NOTICE '  ДОПОЛНИТЕЛЬНЫЙ ТЕСТ: назначение тикета';
            
            -- Создаем тестовую роль если нет
            INSERT INTO roles (name) VALUES ('ТестоваяРоль') 
            ON CONFLICT DO NOTHING;
            
            -- Назначаем тикет
            CALL assign_ticket(new_ticket_id, 'ТестоваяРоль');
            
            -- Проверяем назначение
            DECLARE
                assigned_role_id INTEGER;
                comment_exists BOOLEAN;
            BEGIN
                SELECT assigned_to_role_id INTO assigned_role_id
                FROM tickets WHERE id = new_ticket_id;
                
                comment_exists := EXISTS (
                    SELECT 1 FROM tickets_comments 
                    WHERE ticket_id = new_ticket_id 
                    AND comment LIKE '%ТестоваяРоль%'
                );
                
                IF assigned_role_id IS NOT NULL THEN
                    RAISE NOTICE '    ✓ Тикет назначен на роль ID: %', assigned_role_id;
                END IF;
                
                IF comment_exists THEN
                    RAISE NOTICE '    ✓ Комментарий о назначении создан';
                END IF;
            END;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '    ⚠ Ошибка назначения тикета: %', SQLERRM;
        END;
        
    EXCEPTION WHEN OTHERS THEN
        test_failed_count := test_failed_count + 1;
        RAISE NOTICE '✗ ОШИБКА СОЗДАНИЯ ТИКЕТА: %', SQLERRM;
    END;
    
    -- ===========================================
    -- ТЕСТ UC-103: генерация отчета
    -- ===========================================
    BEGIN
        RAISE NOTICE '';
        RAISE NOTICE 'ТЕСТ UC-103: генерация ежедневного отчета';
        RAISE NOTICE '----------------------------------------';
        
        test_result_count := test_result_count + 1;
        
        -- Создаем тестовые данные для отчета
        DECLARE
            test_tickets_created INTEGER := 0;
        BEGIN
            RAISE NOTICE '  Подготовка тестовых данных...';
            
            -- Создаем несколько тестовых тикетов
            FOR i IN 1..5 LOOP
                INSERT INTO tickets (
                    title, description, threat_level, importance_level,
                    assigned_to_role_id, anomaly_type_id, matrix_coordinates,
                    created_at, updated_at, status
                ) VALUES (
                    'Тестовый тикет ' || i,
                    'Описание тестового тикета ' || i,
                    (i % 3) + 1,  -- threat_level 1-3
                    CASE WHEN i = 1 THEN 'Высокий' WHEN i = 2 THEN 'Средний' ELSE 'Низкий' END,
                    8, 1, 'TEST:' || i || ',' || (i * 100),
                    '2024-01-20 10:00:00'::TIMESTAMP + (i || ' hours')::INTERVAL,
                    '2024-01-20 10:00:00'::TIMESTAMP + (i || ' hours')::INTERVAL,
                    CASE WHEN i <= 2 THEN 'закрыт' WHEN i = 3 THEN 'на проверке' ELSE 'новый' END
                );
                test_tickets_created := test_tickets_created + 1;
            END LOOP;
            
            RAISE NOTICE '  Создано тестовых тикетов: %', test_tickets_created;
        END;
        
        -- Генерируем отчет
        report_id := generate_daily_report(
            '2024-01-20 00:00:00',
            '2024-01-20 23:59:59'
        );
        
        RAISE NOTICE '✓ ОТЧЕТ СОЗДАН УСПЕШНО';
        RAISE NOTICE '  - ID отчета: %', report_id;
        
        -- Проверяем созданный отчет
        DECLARE
            report_data RECORD;
            report_json JSON;
        BEGIN
            SELECT * INTO report_data 
            FROM reports 
            WHERE id = report_id;
            
            IF report_data.id IS NOT NULL THEN
                RAISE NOTICE '  - Период: % - %', 
                    report_data.period_start, report_data.period_end;
                RAISE NOTICE '  - Создан: %', report_data.created_at;
                RAISE NOTICE '  - Размер данных: % символов', 
                    LENGTH(report_data.generated_data);
                
                -- Парсим JSON для деталей
                BEGIN
                    report_json := report_data.generated_data::JSON;
                    RAISE NOTICE '  - Всего тикетов за период: %', 
                        report_json->>'total_tickets';
                    RAISE NOTICE '  - Закрытых тикетов: %', 
                        report_json->>'closed_tickets';
                    RAISE NOTICE '  - Тикетов на проверке: %', 
                        report_json->>'pending_tickets';
                    RAISE NOTICE '  - Высокоприоритетных: %', 
                        report_json->>'high_priority_tickets';
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE '  - Формат данных: TEXT (не JSON)';
                END;
            END IF;
        END;
        
    EXCEPTION WHEN OTHERS THEN
        test_failed_count := test_failed_count + 1;
        RAISE NOTICE '✗ ОШИБКА ГЕНЕРАЦИИ ОТЧЕТА: %', SQLERRM;
    END;
    
    -- ===========================================
    -- ТЕСТ UC-201: запрос прогноза от Оракула
    -- ===========================================
    BEGIN
        RAISE NOTICE '';
        RAISE NOTICE 'ТЕСТ UC-201: запрос прогноза от Оракула';
        RAISE NOTICE '----------------------------------------';
        
        test_result_count := test_result_count + 1;
        
        -- Подготавливаем тестовые данные
        DECLARE
            test_unit_id INTEGER;
            test_user_id INTEGER;
        BEGIN
            -- Создаем тестового юнита
            INSERT INTO units (disagreement_index, status)
            VALUES (7.5, 'нормальный')
            RETURNING id INTO test_unit_id;
            
            -- Создаем тестового пользователя
            INSERT INTO users (username, password, role_id, is_active, created_at)
            SELECT 'test_oracle_user', 'pass', id, TRUE, NOW()
            FROM roles WHERE name = 'Архитектор'
            LIMIT 1
            RETURNING id INTO test_user_id;
            
            RAISE NOTICE '  Подготовлены тестовые данные:';
            RAISE NOTICE '    - Юнит ID: %', test_unit_id;
            RAISE NOTICE '    - Пользователь ID: %', test_user_id;
            
            -- Запрашиваем прогноз
            request_id := request_oracle_prediction(test_unit_id, test_user_id);
            
            RAISE NOTICE '✓ ЗАПРОС К ОРАКУЛУ СОЗДАН';
            RAISE NOTICE '  - ID запроса: %', request_id;
            
            -- Проверяем созданный запрос
            DECLARE
                oracle_request_data RECORD;
            BEGIN
                SELECT * INTO oracle_request_data
                FROM oracle_requests 
                WHERE id = request_id;
                
                IF oracle_request_data.id IS NOT NULL THEN
                    RAISE NOTICE '  - Статус: "%"', oracle_request_data.status;
                    RAISE NOTICE '  - ID юнита: %', oracle_request_data.unit_id;
                    RAISE NOTICE '  - Запросил: пользователь ID %', oracle_request_data.requested_by;
                    RAISE NOTICE '  - Создан: %', oracle_request_data.created_at;
                END IF;
            END;
            
            -- Тест обработки прогноза
            BEGIN
                RAISE NOTICE '';
                RAISE NOTICE '  ДОПОЛНИТЕЛЬНЫЙ ТЕСТ: обработка прогноза';
                
                CALL process_oracle_prediction(
                    request_id,
                    'Прогноз Оракула: высокая вероятность успешной интеграции. ' ||
                    'Рекомендуется продолжить наблюдение в течение 48 часов.'
                );
                
                -- Проверяем результаты
                DECLARE
                    forecast_exists BOOLEAN;
                    request_updated BOOLEAN;
                    message_exists BOOLEAN;
                BEGIN
                    forecast_exists := EXISTS (
                        SELECT 1 FROM forecasts 
                        WHERE oracle_request_id = request_id
                    );
                    
                    request_updated := EXISTS (
                        SELECT 1 FROM oracle_requests 
                        WHERE id = request_id 
                        AND status = 'completed'
                        AND processed_at IS NOT NULL
                    );
                    
                    message_exists := EXISTS (
                        SELECT 1 FROM messages 
                        WHERE text LIKE '%' || request_id || '%'
                        AND text LIKE '%готов%'
                    );
                    
                    IF forecast_exists THEN
                        RAISE NOTICE '    ✓ Прогноз создан';
                    END IF;
                    
                    IF request_updated THEN
                        RAISE NOTICE '    ✓ Статус запроса обновлен на "completed"';
                    END IF;
                    
                    IF message_exists THEN
                        RAISE NOTICE '    ✓ Уведомление отправлено';
                    END IF;
                END;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE '    ⚠ Ошибка обработки прогноза: %', SQLERRM;
            END;
            
        END;
        
    EXCEPTION WHEN OTHERS THEN
        test_failed_count := test_failed_count + 1;
        RAISE NOTICE '✗ ОШИБКА ЗАПРОСА ПРОГНОЗА: %', SQLERRM;
    END;
    
    -- ===========================================
    -- ТЕСТ UC-302: выбор Избранного
    -- ===========================================
    BEGIN
        RAISE NOTICE '';
        RAISE NOTICE 'ТЕСТ UC-302: выбор Избранного';
        RAISE NOTICE '----------------------------------------';
        
        test_result_count := test_result_count + 1;
        
        DECLARE
            test_unit_id INTEGER;
            test_architect_id INTEGER;
            test_matrix_id INTEGER;
            chosen_one_record RECORD;
            created_user RECORD;
        BEGIN
            RAISE NOTICE 'Подготовка тестовых данных...';
            
            -- 1. Подготовка ролей
            INSERT INTO roles (name) 
            VALUES ('Избранный'), ('Архитектор')
            ON CONFLICT (name) DO NOTHING;
            
            -- 2. Создаем матричную итерацию
            INSERT INTO matrix_iterations (num)
            VALUES (COALESCE((SELECT MAX(num) FROM matrix_iterations), 0) + 1)
            RETURNING id INTO test_matrix_id;
            
            RAISE NOTICE '  - Матричная итерация ID: %', test_matrix_id;
            
            -- 3. Создаем тестового юнита
            INSERT INTO units (
                disagreement_index, 
                status, 
                status_update_at, 
                real_location_id,
                dossier
            ) VALUES (
                10.0, 
                'нормальный', 
                NOW(), 
                1,
                'Кандидат с исключительным потенциалом для выбора Избранным'
            )
            RETURNING id INTO test_unit_id;
            
            RAISE NOTICE '  - Юнит ID: %', test_unit_id;
            RAISE NOTICE '  - Индекс несогласия: 10.0';
            RAISE NOTICE '  - Досье: "Кандидат с исключительным потенциалом"';
            
            -- 4. Создаем тестового Архитектора
            INSERT INTO users (
                username, 
                password, 
                role_id, 
                is_active,
                created_at
            )
            SELECT 
                'test_architect_' || test_unit_id,
                'secure_password_123',
                id,
                TRUE,
                NOW()
            FROM roles 
            WHERE name = 'Архитектор'
            RETURNING id INTO test_architect_id;
            
            RAISE NOTICE '  - Архитектор ID: %', test_architect_id;
            RAISE NOTICE '  - Имя пользователя: "test_architect_%"', test_unit_id;
            
            -- 5. Вызываем функцию выбора Избранного
            RAISE NOTICE '';
            RAISE NOTICE 'Вызов функции select_chosen_one...';
            
            chosen_one_id := select_chosen_one(
                test_unit_id,
                test_architect_id,
                test_matrix_id
            );
            
            RAISE NOTICE '✓ ИЗБРАННЫЙ ВЫБРАН УСПЕШНО';
            RAISE NOTICE '  - ID записи chosen_ones: %', chosen_one_id;
            
            -- 6. Детальная проверка результатов
            RAISE NOTICE '';
            RAISE NOTICE 'ДЕТАЛЬНАЯ ПРОВЕРКА РЕЗУЛЬТАТОВ:';
            
            -- Получаем данные о выборе
            SELECT * INTO chosen_one_record
            FROM chosen_ones 
            WHERE id = chosen_one_id;
            
            IF chosen_one_record.id IS NOT NULL THEN
                RAISE NOTICE '  Запись chosen_ones:';
                RAISE NOTICE '    - ID: %', chosen_one_record.id;
                RAISE NOTICE '    - ID юнита: %', chosen_one_record.unit_id;
                RAISE NOTICE '    - Выбран пользователем ID: %', chosen_one_record.selected_by;
                RAISE NOTICE '    - ID пользователя-Избранного: %', chosen_one_record.user_id;
                RAISE NOTICE '    - Итерация матрицы: %', chosen_one_record.matrix_iteration_id;
                RAISE NOTICE '    - Время выбора: %', chosen_one_record.selected_at;
                RAISE NOTICE '    - Ограничения сняты: %', chosen_one_record.restrictions_lifted;
            END IF;
            
            -- Проверяем созданного пользователя
            SELECT * INTO created_user
            FROM users 
            WHERE id = chosen_one_record.user_id;
            
            IF created_user.id IS NOT NULL THEN
                RAISE NOTICE '';
                RAISE NOTICE '  Созданный пользователь для Избранного:';
                RAISE NOTICE '    - ID: %', created_user.id;
                RAISE NOTICE '    - Имя пользователя: "%"', created_user.username;
                RAISE NOTICE '    - Роль ID: %', created_user.role_id;
                RAISE NOTICE '    - Активен: %', created_user.is_active;
                RAISE NOTICE '    - Создан: %', created_user.created_at;
            END IF;
            
            -- Проверяем обновление юнита
            DECLARE
                updated_unit RECORD;
            BEGIN
                SELECT * INTO updated_unit
                FROM units 
                WHERE id = test_unit_id;
                
                IF updated_unit.status = 'Избранный' THEN
                    RAISE NOTICE '';
                    RAISE NOTICE '  Обновление юнита:';
                    RAISE NOTICE '    - Новый статус: "%"', updated_unit.status;
                    RAISE NOTICE '    - Время обновления статуса: %', updated_unit.status_update_at;
                ELSE
                    RAISE NOTICE '    ⚠ Статус юнита не обновлен!';
                END IF;
            END;
            
            -- Проверяем наличие роли "Избранный"
            DECLARE
                chosen_role_id INTEGER;
            BEGIN
                SELECT id INTO chosen_role_id
                FROM roles 
                WHERE name = 'Избранный';
                
                IF chosen_role_id IS NOT NULL THEN
                    RAISE NOTICE '';
                    RAISE NOTICE '  Роль "Избранный":';
                    RAISE NOTICE '    - ID роли: %', chosen_role_id;
                END IF;
            END;
            
            -- Статистика
            DECLARE
                total_chosen_ones INTEGER;
                total_users INTEGER;
            BEGIN
                SELECT COUNT(*) INTO total_chosen_ones FROM chosen_ones;
                SELECT COUNT(*) INTO total_users FROM users 
                WHERE username LIKE 'chosen_%';
                
                RAISE NOTICE '';
                RAISE NOTICE '  СТАТИСТИКА СИСТЕМЫ:';
                RAISE NOTICE '    - Всего Избранных в системе: %', total_chosen_ones;
                RAISE NOTICE '    - Всего пользователей-Избранных: %', total_users;
            END;
            
        END;
        
    EXCEPTION WHEN OTHERS THEN
        test_failed_count := test_failed_count + 1;
        RAISE NOTICE '✗ ОШИБКА ВЫБОРА ИЗБРАННОГО: %', SQLERRM;
        RAISE NOTICE '  Тип ошибки: %', SQLSTATE;
    END;
    
    -- ===========================================
    -- ИТОГИ ТЕСТИРОВАНИЯ ФУНКЦИЙ
    -- ===========================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ИТОГИ ТЕСТИРОВАНИЯ ФУНКЦИЙ';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Всего тестов выполнено: %', test_result_count;
    RAISE NOTICE 'Успешных тестов: %', test_result_count - test_failed_count;
    RAISE NOTICE 'Неудачных тестов: %', test_failed_count;
    
    DECLARE
        success_rate NUMERIC;
    BEGIN
        IF test_result_count > 0 THEN
            success_rate := ((test_result_count - test_failed_count)::NUMERIC / test_result_count::NUMERIC) * 100;
            RAISE NOTICE 'Успешность: % %%', ROUND(success_rate, 2);
        END IF;
        
        IF test_failed_count = 0 THEN
            RAISE NOTICE '✓ ВСЕ ФУНКЦИИ РАБОТАЮТ КОРРЕКТНО!';
        ELSE
            RAISE NOTICE '⚠ НЕКОТОРЫЕ ФУНКЦИИ ТРЕБУЮТ ДОРАБОТКИ';
        END IF;
    END;
    
END $$;

-- 4. ПРОВЕРКА ОГРАНИЧЕНИЙ ЦЕЛОСТНОСТИ

DO $$
DECLARE
    constraint_test_count INTEGER := 0;
    constraint_failed_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '4. ПРОВЕРКА ОГРАНИЧЕНИЙ ЦЕЛОСТНОСТИ';
    RAISE NOTICE '============================================';
    
    -- ТЕСТ 1: threat_level ограничение (1-3)
    BEGIN
        constraint_test_count := constraint_test_count + 1;
        
        RAISE NOTICE 'ТЕСТ 1: Ограничение threat_level (допустимые значения: 1-3)';
        
        -- Пытаемся создать тикет с неправильным threat_level
        BEGIN
            INSERT INTO tickets (
                title, threat_level, importance_level,
                assigned_to_role_id, anomaly_type_id, matrix_coordinates,
                created_at, updated_at, status
            ) VALUES (
                'Неправильный threat_level', 
                5, -- Неправильное значение
                'Низкий',
                1, 1, 'TEST:000,000',
                NOW(), NOW(), 'новый'
            );
            
            RAISE NOTICE '✗ ОШИБКА: должно было возникнуть исключение!';
            constraint_failed_count := constraint_failed_count + 1;
            
        EXCEPTION 
            WHEN check_violation THEN
                RAISE NOTICE '✓ ТЕСТ ПРОЙДЕН: ограничение работает';
            WHEN OTHERS THEN
                RAISE NOTICE '✗ НЕОЖИДАННАЯ ОШИБКА: %', SQLERRM;
                constraint_failed_count := constraint_failed_count + 1;
        END;
        
    EXCEPTION WHEN OTHERS THEN
        constraint_failed_count := constraint_failed_count + 1;
        RAISE NOTICE '✗ ОШИБКА В ТЕСТЕ: %', SQLERRM;
    END;
    
    -- ТЕСТ 2: importance_level ограничение
    BEGIN
        constraint_test_count := constraint_test_count + 1;
        
        RAISE NOTICE '';
        RAISE NOTICE 'ТЕСТ 2: Ограничение importance_level';
        
        -- Пытаемся создать тикет с неправильным importance_level
        BEGIN
            INSERT INTO tickets (
                title, threat_level, importance_level,
                assigned_to_role_id, anomaly_type_id, matrix_coordinates,
                created_at, updated_at, status
            ) VALUES (
                'Неправильный importance_level', 
                2, 
                'НедопустимыйУровень', -- Неправильное значение
                1, 1, 'TEST:000,000',
                NOW(), NOW(), 'новый'
            );
            
            RAISE NOTICE '✗ ОШИБКА: должно было возникнуть исключение!';
            constraint_failed_count := constraint_failed_count + 1;
            
        EXCEPTION 
            WHEN check_violation THEN
                RAISE NOTICE '✓ ТЕСТ ПРОЙДЕН: ограничение работает';
            WHEN OTHERS THEN
                RAISE NOTICE '✗ НЕОЖИДАННАЯ ОШИБКА: %', SQLERRM;
                constraint_failed_count := constraint_failed_count + 1;
        END;
        
    EXCEPTION WHEN OTHERS THEN
        constraint_failed_count := constraint_failed_count + 1;
        RAISE NOTICE '✗ ОШИБКА В ТЕСТЕ: %', SQLERRM;
    END;
    
    -- ТЕСТ 3: unique_username ограничение
    BEGIN
        constraint_test_count := constraint_test_count + 1;
        
        RAISE NOTICE '';
        RAISE NOTICE 'ТЕСТ 3: Ограничение уникальности username';
        
        -- Пытаемся создать пользователя с существующим username
        DECLARE
            existing_username TEXT;
        BEGIN
            -- Получаем существующее имя пользователя
            SELECT username INTO existing_username 
            FROM users 
            LIMIT 1;
            
            BEGIN
                INSERT INTO users (username, password, role_id, created_at, is_active)
                VALUES (existing_username, 'test_pass', 1, NOW(), TRUE);
                
                RAISE NOTICE '✗ ОШИБКА: должно было возникнуть исключение!';
                constraint_failed_count := constraint_failed_count + 1;
                
            EXCEPTION 
                WHEN unique_violation THEN
                    RAISE NOTICE '✓ ТЕСТ ПРОЙДЕН: ограничение уникальности работает';
                WHEN OTHERS THEN
                    RAISE NOTICE '✗ НЕОЖИДАННАЯ ОШИБКА: %', SQLERRM;
                    constraint_failed_count := constraint_failed_count + 1;
            END;
        END;
        
    EXCEPTION WHEN OTHERS THEN
        constraint_failed_count := constraint_failed_count + 1;
        RAISE NOTICE '✗ ОШИБКА В ТЕСТЕ: %', SQLERRM;
    END;
    
    -- ===========================================
    -- ИТОГИ ПРОВЕРКИ ОГРАНИЧЕНИЙ
    -- ===========================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ИТОГИ ПРОВЕРКИ ОГРАНИЧЕНИЙ ЦЕЛОСТНОСТИ';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Всего тестов выполнено: %', constraint_test_count;
    RAISE NOTICE 'Успешных тестов: %', constraint_test_count - constraint_failed_count;
    RAISE NOTICE 'Неудачных тестов: %', constraint_failed_count;
    
    DECLARE
        success_rate NUMERIC;
    BEGIN
        IF constraint_test_count > 0 THEN
            success_rate := ((constraint_test_count - constraint_failed_count)::NUMERIC / constraint_test_count::NUMERIC) * 100;
            RAISE NOTICE 'Успешность: % %%', ROUND(success_rate, 2);
        END IF;
        
        IF constraint_failed_count = 0 THEN
            RAISE NOTICE '✓ ВСЕ ОГРАНИЧЕНИЯ РАБОТАЮТ КОРРЕКТНО!';
        ELSE
            RAISE NOTICE '⚠ НЕКОТОРЫЕ ОГРАНИЧЕНИЯ ТРЕБУЮТ ДОРАБОТКИ';
        END IF;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ЗАВЕРШЕНИЕ ТЕСТИРОВАНИЯ БАЗЫ ДАННЫХ';
    RAISE NOTICE 'Время завершения: %', NOW();
    RAISE NOTICE '============================================';
    
END $$;

