-- ============================================================================
-- Migration 37: 创建 user_ninety_day_progress 表
--
-- 这个表用于追踪用户在90天挑战中的详细进度
-- 与users表中的基础字段配合使用
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_ninety_day_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_day INTEGER NOT NULL DEFAULT 1 CHECK (current_day >= 1 AND current_day <= 90),
    completed_days JSONB DEFAULT '[]'::jsonb,  -- [1, 2, 3, 5, 7]
    tencore_progress JSONB DEFAULT '{}'::jsonb,  -- {"1": 60, "2": 40, "3": 30}
    specialized_progress JSONB DEFAULT '{}'::jsonb,  -- {"五分点": {"1分点": 80}}
    total_training_time INTEGER DEFAULT 0,  -- Total minutes
    last_training_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estimated_completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_ninety_day_progress_user ON user_ninety_day_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ninety_day_progress_current_day ON user_ninety_day_progress(current_day);
CREATE INDEX IF NOT EXISTS idx_user_ninety_day_progress_start_date ON user_ninety_day_progress(start_date);

-- 添加注释
COMMENT ON TABLE user_ninety_day_progress IS '用户90天挑战进度表，追踪详细训练进度';
COMMENT ON COLUMN user_ninety_day_progress.user_id IS '用户ID（唯一）';
COMMENT ON COLUMN user_ninety_day_progress.current_day IS '当前训练到第几天 (1-90)';
COMMENT ON COLUMN user_ninety_day_progress.completed_days IS '已完成的天数列表 JSONB数组';
COMMENT ON COLUMN user_ninety_day_progress.tencore_progress IS '十大招进度百分比 JSONB对象';
COMMENT ON COLUMN user_ninety_day_progress.skill_mastery IS '技能掌握程度 JSONB对象';
COMMENT ON COLUMN user_ninety_day_progress.total_training_time IS '累计训练时长（分钟）';
COMMENT ON COLUMN user_ninety_day_progress.start_date IS '开始90天挑战的日期';
COMMENT ON COLUMN user_ninety_day_progress.estimated_completion_date IS '预计完成日期';

-- 创建更新触发器
DROP TRIGGER IF EXISTS update_user_ninety_day_progress_updated_at ON user_ninety_day_progress;
CREATE TRIGGER update_user_ninety_day_progress_updated_at
    BEFORE UPDATE ON user_ninety_day_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Migration完成
-- ============================================================================
