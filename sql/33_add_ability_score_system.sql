-- ============================================================================
-- Migration 33: 添加能力分系统和训练记录统计
-- 用于90天挑战的能力评估和专项训练记录
-- ============================================================================

-- 1. 扩展users表：添加5维能力分字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS accuracy_score REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spin_score REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS positioning_score REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS power_score REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strategy_score REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS clearance_score REAL DEFAULT 0;

-- 能力分计算的原始累计数据
ALTER TABLE users ADD COLUMN IF NOT EXISTS accuracy_total_shots INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS accuracy_successful_shots INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spin_total_difficulty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spin_completed_difficulty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS positioning_total_difficulty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS positioning_completed_difficulty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS power_total_difficulty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS power_completed_difficulty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strategy_total_difficulty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strategy_completed_difficulty_points INTEGER DEFAULT 0;

-- 2. 扩展ninety_day_curriculum表：添加能力维度映射
ALTER TABLE ninety_day_curriculum ADD COLUMN IF NOT EXISTS primary_skill VARCHAR(20);
ALTER TABLE ninety_day_curriculum ADD COLUMN IF NOT EXISTS scoring_method VARCHAR(20) DEFAULT 'completion';
ALTER TABLE ninety_day_curriculum ADD COLUMN IF NOT EXISTS max_attempts INTEGER;

-- 3. 扩展ninety_day_training_records表：添加训练统计数据
ALTER TABLE ninety_day_training_records ADD COLUMN IF NOT EXISTS training_stats JSONB DEFAULT '{}';
ALTER TABLE ninety_day_training_records ADD COLUMN IF NOT EXISTS success_rate REAL;
ALTER TABLE ninety_day_training_records ADD COLUMN IF NOT EXISTS achieved_target BOOLEAN;
ALTER TABLE ninety_day_training_records ADD COLUMN IF NOT EXISTS score_changes JSONB DEFAULT '{}';

-- 4. 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_ninety_day_curriculum_primary_skill
    ON ninety_day_curriculum(primary_skill);
CREATE INDEX IF NOT EXISTS idx_ninety_day_training_records_success_rate
    ON ninety_day_training_records(success_rate);

-- 5. 添加表注释
COMMENT ON COLUMN users.accuracy_score IS '准度分 (0-100)';
COMMENT ON COLUMN users.spin_score IS '杆法分 (0-100)';
COMMENT ON COLUMN users.positioning_score IS '走位分 (0-100)';
COMMENT ON COLUMN users.power_score IS '发力分 (0-100)';
COMMENT ON COLUMN users.strategy_score IS '策略分 (0-100)';
COMMENT ON COLUMN users.clearance_score IS '清台能力总分 (0-100)';

COMMENT ON COLUMN ninety_day_curriculum.primary_skill IS '主要能力维度: accuracy, spin, positioning, power, strategy';
COMMENT ON COLUMN ninety_day_curriculum.scoring_method IS '计分方式: success_rate 或 completion';
COMMENT ON COLUMN ninety_day_curriculum.max_attempts IS '最大尝试次数（用于success_rate模式）';

COMMENT ON COLUMN ninety_day_training_records.training_stats IS '训练统计数据（JSONB）: {total_attempts, successful_shots, angle, etc}';
COMMENT ON COLUMN ninety_day_training_records.success_rate IS '成功率 (0.0 - 1.0)';
COMMENT ON COLUMN ninety_day_training_records.achieved_target IS '是否达标';
COMMENT ON COLUMN ninety_day_training_records.score_changes IS '能力分变化 (JSONB): {accuracy: +5, clearance: +3}';
