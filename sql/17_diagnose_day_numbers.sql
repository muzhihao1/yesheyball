-- ============================================================================
-- 诊断脚本：检查ninety_day_curriculum表中的实际数据
-- ============================================================================

-- 1. 检查所有天数是否存在
SELECT
    COUNT(*) as total_records,
    MIN(day_number) as min_day,
    MAX(day_number) as max_day,
    COUNT(DISTINCT day_number) as distinct_days
FROM ninety_day_curriculum;

-- 2. 查看所有天数列表
SELECT
    day_number,
    original_course_ref,
    title,
    LEFT(description, 50) as description_preview,
    LENGTH(description) as desc_length
FROM ninety_day_curriculum
ORDER BY day_number
LIMIT 20;

-- 3. 检查哪些天数存在
SELECT
    day_number,
    title
FROM ninety_day_curriculum
WHERE day_number IN (1, 2, 3, 8, 9, 10, 11, 18, 19, 20)
ORDER BY day_number;

-- 4. 检查是否有重复的day_number
SELECT
    day_number,
    COUNT(*) as count
FROM ninety_day_curriculum
GROUP BY day_number
HAVING COUNT(*) > 1;

-- 5. 测试单个UPDATE是否会匹配记录（不实际执行）
SELECT
    day_number,
    title,
    '应该会被更新' as status
FROM ninety_day_curriculum
WHERE day_number = 8;

-- 6. 测试范围UPDATE是否会匹配记录
SELECT
    day_number,
    title,
    '应该会被更新' as status
FROM ninety_day_curriculum
WHERE day_number BETWEEN 21 AND 22;
