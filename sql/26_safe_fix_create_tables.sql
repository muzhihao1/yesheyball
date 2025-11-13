-- ============================================================================
-- Migration 26 (SAFE FIX): 创建十大招系统核心表
-- 安全修复版：只删除存在的表，避免错误
-- ============================================================================

-- 🔍 第一部分：检查并显示当前存在的表
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'skills', 'sub_skills', 'training_units',
        'specialized_trainings', 'specialized_training_plans',
        'plan_unit_mappings', 'user_skill_progress', 'user_unit_completions'
    );

    RAISE NOTICE '当前存在的相关表数量: %', table_count;
END $$;

-- 显示存在的表
SELECT
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'skills', 'sub_skills', 'training_units',
    'specialized_trainings', 'specialized_training_plans',
    'plan_unit_mappings', 'user_skill_progress', 'user_unit_completions'
)
ORDER BY table_name;

-- ============================================================================
-- 🗑️ 第二部分：安全删除已存在的表（按依赖关系逆序）
-- ============================================================================

-- 删除用户数据表
DROP TABLE IF EXISTS user_unit_completions CASCADE;
DROP TABLE IF EXISTS user_skill_progress CASCADE;

-- 删除关联表
DROP TABLE IF EXISTS plan_unit_mappings CASCADE;

-- 删除专项训练表
DROP TABLE IF EXISTS specialized_training_plans CASCADE;
DROP TABLE IF EXISTS specialized_trainings CASCADE;

-- 删除核心训练表
DROP TABLE IF EXISTS training_units CASCADE;
DROP TABLE IF EXISTS sub_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;

-- ============================================================================
-- ✨ 第三部分：创建全新的表结构
-- ============================================================================

-- 1. skills 表 - 十大招主表
CREATE TABLE skills (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    skill_order INTEGER NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. sub_skills 表 - 子技能表
CREATE TABLE sub_skills (
    id VARCHAR(50) PRIMARY KEY,
    skill_id VARCHAR(50) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    sub_skill_order INTEGER NOT NULL,
    unlock_condition TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. training_units 表 - 训练单元表
CREATE TABLE training_units (
    id VARCHAR(50) PRIMARY KEY,
    sub_skill_id VARCHAR(50) NOT NULL REFERENCES sub_skills(id) ON DELETE CASCADE,
    unit_type VARCHAR(20) NOT NULL CHECK (unit_type IN ('theory', 'practice', 'challenge')),
    title VARCHAR(255) NOT NULL,
    content JSONB,
    goal_description TEXT,
    xp_reward INTEGER DEFAULT 10,
    unit_order INTEGER NOT NULL,
    estimated_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. specialized_trainings 表 - 专项训练主表
CREATE TABLE specialized_trainings (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. specialized_training_plans 表 - 专项训练计划表
CREATE TABLE specialized_training_plans (
    id VARCHAR(50) PRIMARY KEY,
    training_id VARCHAR(50) NOT NULL REFERENCES specialized_trainings(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    estimated_time_minutes INTEGER,
    content JSONB,
    xp_reward INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. plan_unit_mappings 表 - 多对多关联表
CREATE TABLE plan_unit_mappings (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(50) NOT NULL REFERENCES specialized_training_plans(id) ON DELETE CASCADE,
    unit_id VARCHAR(50) NOT NULL REFERENCES training_units(id) ON DELETE CASCADE,
    unit_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, unit_id)
);

-- 7. user_skill_progress 表 - 用户技能进度
CREATE TABLE user_skill_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    skill_id VARCHAR(50) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    completed_sub_skills INTEGER DEFAULT 0,
    total_sub_skills INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

-- 8. user_unit_completions 表 - 用户单元完成记录
CREATE TABLE user_unit_completions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    unit_id VARCHAR(50) NOT NULL REFERENCES training_units(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score INTEGER,
    notes TEXT,
    xp_earned INTEGER,
    UNIQUE(user_id, unit_id)
);

-- ============================================================================
-- 📊 第四部分：创建索引
-- ============================================================================

CREATE INDEX idx_sub_skills_skill_id ON sub_skills(skill_id);
CREATE INDEX idx_training_units_sub_skill_id ON training_units(sub_skill_id);
CREATE INDEX idx_training_units_type ON training_units(unit_type);
CREATE INDEX idx_specialized_training_plans_training_id ON specialized_training_plans(training_id);
CREATE INDEX idx_plan_unit_mappings_plan_id ON plan_unit_mappings(plan_id);
CREATE INDEX idx_plan_unit_mappings_unit_id ON plan_unit_mappings(unit_id);
CREATE INDEX idx_user_skill_progress_user_id ON user_skill_progress(user_id);
CREATE INDEX idx_user_skill_progress_skill_id ON user_skill_progress(skill_id);
CREATE INDEX idx_user_unit_completions_user_id ON user_unit_completions(user_id);
CREATE INDEX idx_user_unit_completions_unit_id ON user_unit_completions(unit_id);

-- ============================================================================
-- ✅ 第五部分：验证创建结果
-- ============================================================================

-- 验证所有表已创建
SELECT
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'skills', 'sub_skills', 'training_units',
    'specialized_trainings', 'specialized_training_plans',
    'plan_unit_mappings', 'user_skill_progress', 'user_unit_completions'
)
ORDER BY table_name;

-- 验证所有ID字段都是VARCHAR(50)类型
SELECT
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'skills', 'sub_skills', 'training_units',
    'specialized_trainings', 'specialized_training_plans'
)
AND c.column_name = 'id'
ORDER BY t.table_name;

-- 验证外键关系
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN (
    'sub_skills', 'training_units', 'specialized_training_plans',
    'plan_unit_mappings', 'user_skill_progress', 'user_unit_completions'
)
ORDER BY tc.table_name, kcu.column_name;

-- 最终统计
SELECT
    '✅ 表创建成功' as status,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'skills', 'sub_skills', 'training_units',
    'specialized_trainings', 'specialized_training_plans',
    'plan_unit_mappings', 'user_skill_progress', 'user_unit_completions'
);
