-- ============================================================================
-- 数据库诊断脚本 - 逐步检查
-- 用于诊断Supabase生产环境的数据库状态
-- ============================================================================

-- 步骤1：列出所有public schema下的表
-- 这会显示当前数据库中所有的表名
SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 如果上面的查询成功，继续执行下面的查询
-- 如果失败，说明数据库连接有问题

-- ============================================================================
-- 步骤2：检查核心表是否存在（分别检查）
-- ============================================================================

-- 检查users表
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'users'
) as users_exists;

-- 检查training_programs表
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'training_programs'
) as training_programs_exists;

-- 检查training_days表
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'training_days'
) as training_days_exists;

-- 检查90天系统表
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'tencore_skills'
) as tencore_skills_exists;

SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'ninety_day_curriculum'
) as ninety_day_curriculum_exists;

-- ============================================================================
-- 步骤3：如果表存在，检查数据行数（只有在表存在时才会成功）
-- ============================================================================

-- 注意：如果上面的检查显示某个表不存在，下面相应的查询会失败
-- 请根据上面的结果决定是否执行下面的查询

-- 尝试查询users表行数（如果存在）
-- SELECT COUNT(*) as users_count FROM users;

-- 尝试查询training_programs表行数（如果存在）
-- SELECT COUNT(*) as training_programs_count FROM training_programs;

-- 尝试查询training_days表行数（如果存在）
-- SELECT COUNT(*) as training_days_count FROM training_days;

-- 尝试查询tencore_skills表行数（如果存在）
-- SELECT COUNT(*) as tencore_skills_count FROM tencore_skills;

-- 尝试查询ninety_day_curriculum表行数（如果存在）
-- SELECT COUNT(*) as ninety_day_curriculum_count FROM ninety_day_curriculum;
