-- ============================================================================
-- 验证所有必要的数据库表
-- 用于检查Supabase生产环境中的所有核心表是否存在
-- ============================================================================

-- 检查所有必要的表是否存在
SELECT
    table_name,
    CASE
        WHEN table_name IN (
            'users', 'sessions', 'tasks', 'user_tasks',
            'diary_entries', 'feedbacks', 'training_programs', 'training_days',
            'training_sessions', 'training_notes', 'achievements', 'user_achievements',
            'goals', 'user_goals', 'daily_streaks',
            'tencore_skills', 'ninety_day_curriculum', 'specialized_training',
            'user_ninety_day_progress', 'ninety_day_training_records',
            'training_path_levels', 'training_path_sub_skills', 'training_path_units',
            'user_training_progress'
        ) THEN '✅ 核心表'
        ELSE '⚠️  其他表'
    END as table_category
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%'
ORDER BY
    CASE
        WHEN table_name = 'users' THEN 1
        WHEN table_name = 'sessions' THEN 2
        WHEN table_name LIKE 'tencore%' THEN 3
        WHEN table_name LIKE 'ninety_day%' THEN 4
        ELSE 5
    END,
    table_name;

-- 检查users表是否有数据
SELECT
    'users' as table_name,
    COUNT(*) as row_count,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ 有数据'
        ELSE '⚠️ 表为空'
    END as status
FROM users;

-- 检查90天系统表数据
SELECT
    'tencore_skills' as table_name,
    COUNT(*) as row_count,
    CASE
        WHEN COUNT(*) = 10 THEN '✅ 数据完整'
        WHEN COUNT(*) > 0 THEN '⚠️  数据不完整'
        ELSE '❌ 表为空'
    END as status
FROM tencore_skills;

SELECT
    'ninety_day_curriculum' as table_name,
    COUNT(*) as row_count,
    CASE
        WHEN COUNT(*) = 90 THEN '✅ 数据完整'
        WHEN COUNT(*) > 0 THEN '⚠️  数据不完整'
        ELSE '❌ 表为空'
    END as status
FROM ninety_day_curriculum;

SELECT
    'specialized_training' as table_name,
    COUNT(*) as row_count,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ 有数据'
        ELSE '❌ 表为空'
    END as status
FROM specialized_training;

-- 检查training_programs表数据（30天课程）
SELECT
    'training_programs' as table_name,
    COUNT(*) as row_count,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ 有数据'
        ELSE '⚠️  表为空'
    END as status
FROM training_programs;

-- 检查training_days表数据（52集课程）
SELECT
    'training_days' as table_name,
    COUNT(*) as row_count,
    CASE
        WHEN COUNT(*) >= 52 THEN '✅ 数据完整'
        WHEN COUNT(*) > 0 THEN '⚠️  数据不完整'
        ELSE '❌ 表为空'
    END as status
FROM training_days;
