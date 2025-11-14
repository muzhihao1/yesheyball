-- ============================================================================
-- Migration 32: 创建专项训练会话和进度追踪表
-- 用于记录用户的专项训练会话和进度
-- ============================================================================

-- 1. 创建专项训练会话表
CREATE TABLE IF NOT EXISTS specialized_training_sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_plan_id VARCHAR(50) NOT NULL REFERENCES specialized_training_plans(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER, -- 训练时长（分钟）
    rating INTEGER, -- 1-5星评分
    notes TEXT,
    xp_earned INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建用户专项训练进度表
CREATE TABLE IF NOT EXISTS user_specialized_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_id VARCHAR(50) NOT NULL REFERENCES specialized_trainings(id) ON DELETE CASCADE,
    completed_plans JSONB DEFAULT '{}', -- { "plan_basic_1": true, ... }
    total_sessions INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    total_xp_earned INTEGER DEFAULT 0,
    average_rating INTEGER, -- 平均评分 * 10（存储为整数）
    last_training_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, training_id)
);

-- 3. 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_specialized_training_sessions_user_id
    ON specialized_training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_specialized_training_sessions_plan_id
    ON specialized_training_sessions(training_plan_id);
CREATE INDEX IF NOT EXISTS idx_specialized_training_sessions_completed_at
    ON specialized_training_sessions(completed_at);

CREATE INDEX IF NOT EXISTS idx_user_specialized_progress_user_id
    ON user_specialized_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_specialized_progress_training_id
    ON user_specialized_progress(training_id);

-- 4. 添加表注释
COMMENT ON TABLE specialized_training_sessions IS '专项训练会话记录表';
COMMENT ON TABLE user_specialized_progress IS '用户专项训练进度表';

COMMENT ON COLUMN specialized_training_sessions.duration IS '训练时长（分钟）';
COMMENT ON COLUMN specialized_training_sessions.rating IS '用户评分（1-5星）';
COMMENT ON COLUMN specialized_training_sessions.xp_earned IS '本次训练获得的经验值';

COMMENT ON COLUMN user_specialized_progress.completed_plans IS '已完成的训练计划（JSONB对象）';
COMMENT ON COLUMN user_specialized_progress.total_sessions IS '总训练次数';
COMMENT ON COLUMN user_specialized_progress.total_minutes IS '总训练时长（分钟）';
COMMENT ON COLUMN user_specialized_progress.average_rating IS '平均评分 * 10（整数存储）';
