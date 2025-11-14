-- ============================================================================
-- Migration 38: 添加缺失的列到 user_ninety_day_progress 表
-- ============================================================================

-- 添加 specialized_progress 列
ALTER TABLE user_ninety_day_progress
ADD COLUMN IF NOT EXISTS specialized_progress JSONB DEFAULT '{}'::jsonb;

-- 添加 last_training_date 列
ALTER TABLE user_ninety_day_progress
ADD COLUMN IF NOT EXISTS last_training_date TIMESTAMP WITH TIME ZONE;

-- 移除不需要的 skill_mastery 列（如果存在）
ALTER TABLE user_ninety_day_progress
DROP COLUMN IF EXISTS skill_mastery;

-- 添加注释
COMMENT ON COLUMN user_ninety_day_progress.specialized_progress IS '专项训练进度 JSONB对象';
COMMENT ON COLUMN user_ninety_day_progress.last_training_date IS '最后训练日期';

-- ============================================================================
-- Migration完成
-- ============================================================================
