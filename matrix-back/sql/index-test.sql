-- 1. Очистка старых данных
TRUNCATE tickets_units, tickets, units RESTART IDENTITY CASCADE;

-- 2. Создаем тестовые данные
DO $$
DECLARE
    i INTEGER;
BEGIN
    -- Создаем 10000 юнитов
    FOR i IN 1..10000 LOOP
        INSERT INTO units (disagreement_index, status, dossier, status_update_at, real_location_id)
        VALUES (
            ROUND((RANDOM() * 10)::NUMERIC, 1),
            CASE 
                WHEN RANDOM() > 0.9 THEN 'нестабильный'
                WHEN RANDOM() > 0.8 THEN 'кандидат'
                ELSE 'нормальный'
            END,
            'Тестовый юнит ' || i,
            NOW() - (RANDOM() * 365 || ' days')::INTERVAL,
            1 + (RANDOM() * 9)::INTEGER
        );
    END LOOP;
    
    -- Создаем 5000 тикетов
    FOR i IN 1..5000 LOOP
        INSERT INTO tickets (
            title, description, threat_level, importance_level,
            assigned_to_role_id, anomaly_type_id, matrix_coordinates,
            created_at, updated_at, status
        ) VALUES (
            'Тестовый тикет ' || i,
            'Описание ' || i,
            1 + (RANDOM() * 2)::INTEGER,
            CASE 
                WHEN RANDOM() > 0.8 THEN 'Высокий'
                WHEN RANDOM() > 0.5 THEN 'Средний'
                ELSE 'Низкий'
            END,
            8 + (RANDOM() * 3)::INTEGER,
            1 + (RANDOM() * 5)::INTEGER,
            'MAT:' || (RANDOM() * 1000)::INTEGER || ',' || (RANDOM() * 1000)::INTEGER,
            NOW() - (RANDOM() * 365 || ' days')::INTERVAL,
            NOW() - (RANDOM() * 30 || ' days')::INTERVAL,
            CASE 
                WHEN RANDOM() > 0.7 THEN 'закрыт'
                WHEN RANDOM() > 0.4 THEN 'на проверке'
                ELSE 'новый'
            END
        );
    END LOOP;
    
    RAISE NOTICE 'Создано юнитов: 10000, тикетов: 5000';
END $$;

-- 3. Обновляем статистику для планировщика
ANALYZE units;
ANALYZE tickets;
ANALYZE tickets_units;

-- 4. Создаем индексы для теста
DROP INDEX IF EXISTS idx_test_tickets_importance;
DROP INDEX IF EXISTS idx_test_tickets_created;
DROP INDEX IF EXISTS idx_test_units_disagreement;

CREATE INDEX idx_test_tickets_importance ON tickets(importance_level);
CREATE INDEX idx_test_tickets_created ON tickets(created_at);
CREATE INDEX idx_test_units_disagreement ON units(disagreement_index);

-- 5. Тест 1: JOIN с использованием индексов (этот точно работал)
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ТЕСТ 1: JOIN с индексами (рабочий)';
    RAISE NOTICE '============================================';
END $$;

-- Сначала создадим связи для теста
INSERT INTO tickets_units (unit_id, ticket_id, status)
SELECT 
    (SELECT id FROM units ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM tickets ORDER BY RANDOM() LIMIT 1),
    'затронут'
FROM generate_series(1, 2000);

-- Запрос с JOIN
EXPLAIN ANALYZE
SELECT 
    t.id as ticket_id,
    t.title,
    t.importance_level,
    COUNT(tu.unit_id) as affected_units
FROM tickets t
JOIN tickets_units tu ON t.id = tu.ticket_id
WHERE t.importance_level = 'Высокий'
  AND t.created_at >= NOW() - INTERVAL '180 days'
GROUP BY t.id, t.title, t.importance_level
ORDER BY affected_units DESC
LIMIT 20;

-- 6. Тест 2: Простой запрос по индексу с большим количеством данных
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ТЕСТ 2: Запрос по индексу disagreement_index';
    RAISE NOTICE '============================================';
END $$;

-- Сначала обновим часть данных, чтобы было что искать
UPDATE units 
SET disagreement_index = 9.0 + RANDOM()
WHERE id % 100 = 0;

ANALYZE units;

-- Запрос с индексом
EXPLAIN ANALYZE
SELECT id, disagreement_index, status, dossier
FROM units
WHERE disagreement_index > 9.5
  AND status = 'нормальный'
ORDER BY disagreement_index DESC
LIMIT 50;

-- 7. Тест 3: Составной запрос с двумя индексами
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ТЕСТ 3: Запрос по дате и важности';
    RAISE NOTICE '============================================';
END $$;

-- Обновим некоторые тикеты
UPDATE tickets 
SET importance_level = 'Высокий',
    created_at = NOW() - (RANDOM() * 7 || ' days')::INTERVAL
WHERE id % 50 = 0;

ANALYZE tickets;

-- Запрос с двумя условиями
EXPLAIN ANALYZE
SELECT 
    id,
    title,
    importance_level,
    threat_level,
    created_at,
    status
FROM tickets
WHERE importance_level = 'Высокий'
  AND created_at >= NOW() - INTERVAL '7 days'
  AND status != 'закрыт'
ORDER BY created_at DESC, threat_level DESC
LIMIT 100;

-- 8. Тест 4: Агрегация с GROUP BY и индексом
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ТЕСТ 4: Агрегация с GROUP BY';
    RAISE NOTICE '============================================';
END $$;

EXPLAIN ANALYZE
SELECT 
    importance_level,
    status,
    COUNT(*) as count_tickets,
    AVG(threat_level) as avg_threat,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM tickets
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY importance_level, status
HAVING COUNT(*) > 10
ORDER BY importance_level, status;

-- 9. Статистика использования индексов
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'СТАТИСТИКА ИСПОЛЬЗОВАНИЯ ИНДЕКСОВ';
    RAISE NOTICE '============================================';
END $$;

SELECT 
    schemaname,
    relname as table_name,
    indexrelname as index_name,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
  AND (indexrelname LIKE 'idx_test_%' OR indexrelname LIKE 'idx_tickets_%')
ORDER BY idx_scan DESC;

-- 10. Дополнительный тест: принудительное использование индекса
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ТЕСТ 5: Сравнение с отключенными индексами';
    RAISE NOTICE '============================================';
END $$;

-- Сохраняем текущие настройки
SET LOCAL enable_indexscan = off;
SET LOCAL enable_bitmapscan = off;

EXPLAIN ANALYZE
SELECT id, disagreement_index, status
FROM units
WHERE disagreement_index > 9.5
  AND status = 'нормальный'
ORDER BY disagreement_index DESC
LIMIT 50;

-- Включаем обратно
RESET enable_indexscan;
RESET enable_bitmapscan;

-- Снова тот же запрос с индексами
EXPLAIN ANALYZE
SELECT id, disagreement_index, status
FROM units
WHERE disagreement_index > 9.5
  AND status = 'нормальный'
ORDER BY disagreement_index DESC
LIMIT 50;