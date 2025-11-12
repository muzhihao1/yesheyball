-- ============================================================================
-- 验证90天训练系统数据库表
-- 用于检查Supabase生产环境中的表是否正确创建
-- ============================================================================

-- 1. 检查所有90天系统相关的表是否存在
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'tencore_skills',
        'ninety_day_curriculum',
        'specialized_training',
        'user_ninety_day_progress',
        'ninety_day_training_records'
    )
ORDER BY table_name;

-- 2. 检查 tencore_skills 表结构和数据
SELECT
    'tencore_skills' as table_name,
    COUNT(*) as row_count
FROM tencore_skills;

-- 查看前3条数据
SELECT
    id,
    skill_number,
    skill_name,
    training_days,
    is_active
FROM tencore_skills
ORDER BY skill_number
LIMIT 3;

-- 3. 检查 ninety_day_curriculum 表结构和数据
SELECT
    'ninety_day_curriculum' as table_name,
    COUNT(*) as row_count
FROM ninety_day_curriculum;

-- 查看前3条数据
SELECT
    id,
    day_number,
    training_type,
    title,
    original_course_ref
FROM ninety_day_curriculum
ORDER BY day_number
LIMIT 3;

-- 4. 检查 specialized_training 表
SELECT
    'specialized_training' as table_name,
    COUNT(*) as row_count
FROM specialized_training;

-- 按分类统计
SELECT
    category,
    COUNT(*) as count
FROM specialized_training
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- 5. 检查 user_ninety_day_progress 表
SELECT
    'user_ninety_day_progress' as table_name,
    COUNT(*) as row_count
FROM user_ninety_day_progress;

-- 6. 检查 ninety_day_training_records 表
SELECT
    'ninety_day_training_records' as table_name,
    COUNT(*) as row_count
FROM ninety_day_training_records;

-- 7. 验证所有表的索引
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'tencore_skills',
        'ninety_day_curriculum',
        'specialized_training',
        'user_ninety_day_progress',
        'ninety_day_training_records'
    )
ORDER BY tablename, indexname;
