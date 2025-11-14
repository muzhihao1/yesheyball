-- ============================================================================
-- Migration 35: 创建90天挑战系统与能力分评分系统
--
-- 包含内容：
-- 1. 扩展 skills 表，添加详细内容字段
-- 2. 创建 ninety_day_curriculum 表（90天课程）
-- 3. 创建 ninety_day_training_records 表（90天训练记录）
-- 4. 扩展 users 表，添加5维能力分字段
-- ============================================================================

-- ============================================================================
-- Part 1: 扩展 skills 表
-- ============================================================================

-- 给 skills 表添加详细内容字段
ALTER TABLE skills
ADD COLUMN IF NOT EXISTS detailed_content JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS objectives TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS name VARCHAR(100); -- 添加 name 字段以兼容新系统

-- 为已存在的记录设置 name = title
UPDATE skills SET name = title WHERE name IS NULL;

COMMENT ON COLUMN skills.detailed_content IS '详细训练内容，包含核心思想、训练模块等（JSONB格式）';
COMMENT ON COLUMN skills.objectives IS '训练目标列表';
COMMENT ON COLUMN skills.name IS '技能名称（与title相同，用于兼容）';

-- ============================================================================
-- Part 2: 创建 ninety_day_curriculum 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS ninety_day_curriculum (
    day_number INTEGER PRIMARY KEY CHECK (day_number >= 1 AND day_number <= 90),
    tencore_skill_id VARCHAR(50) REFERENCES skills(id) ON DELETE SET NULL,
    training_type VARCHAR(20) NOT NULL DEFAULT '系统',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    original_course_ref VARCHAR(100),
    objectives TEXT[] NOT NULL DEFAULT '{}',
    key_points TEXT[] NOT NULL DEFAULT '{}',
    practice_requirements JSONB DEFAULT '{}'::jsonb,
    primary_skill VARCHAR(20) CHECK (primary_skill IN ('accuracy', 'spin', 'positioning', 'power', 'strategy')),
    scoring_method VARCHAR(20) DEFAULT 'completion' CHECK (scoring_method IN ('success_rate', 'completion')),
    max_attempts INTEGER,
    estimated_duration INTEGER DEFAULT 30,
    difficulty VARCHAR(10) DEFAULT '初级' CHECK (difficulty IN ('初级', '中级', '高级')),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ninety_day_curriculum IS '90天挑战课程表，每天对应一个训练课程';
COMMENT ON COLUMN ninety_day_curriculum.day_number IS '课程天数 (1-90)';
COMMENT ON COLUMN ninety_day_curriculum.tencore_skill_id IS '所属十大招技能ID';
COMMENT ON COLUMN ninety_day_curriculum.training_type IS '训练类型：系统/专项/实战/理论/测试/考核';
COMMENT ON COLUMN ninety_day_curriculum.primary_skill IS '主要能力维度：accuracy/spin/positioning/power/strategy';
COMMENT ON COLUMN ninety_day_curriculum.scoring_method IS '评分方法：success_rate(成功率)/completion(完成度)';
COMMENT ON COLUMN ninety_day_curriculum.max_attempts IS '最大尝试次数（用于success_rate评分）';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ninety_day_curriculum_skill ON ninety_day_curriculum(tencore_skill_id);
CREATE INDEX IF NOT EXISTS idx_ninety_day_curriculum_primary_skill ON ninety_day_curriculum(primary_skill);
CREATE INDEX IF NOT EXISTS idx_ninety_day_curriculum_difficulty ON ninety_day_curriculum(difficulty);

-- ============================================================================
-- Part 3: 创建 ninety_day_training_records 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS ninety_day_training_records (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL REFERENCES ninety_day_curriculum(day_number) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_minutes INTEGER,
    training_stats JSONB DEFAULT '{}'::jsonb,
    success_rate INTEGER CHECK (success_rate >= 0 AND success_rate <= 100),
    achieved_target BOOLEAN,
    score_changes JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day_number, started_at)
);

COMMENT ON TABLE ninety_day_training_records IS '90天挑战训练记录表';
COMMENT ON COLUMN ninety_day_training_records.training_stats IS '训练统计数据（JSONB格式）：total_attempts, successful_shots等';
COMMENT ON COLUMN ninety_day_training_records.success_rate IS '成功率 (0-100)';
COMMENT ON COLUMN ninety_day_training_records.achieved_target IS '是否达成目标';
COMMENT ON COLUMN ninety_day_training_records.score_changes IS '能力分变化：{accuracy: +5, clearance: +3}';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ninety_day_records_user ON ninety_day_training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ninety_day_records_day ON ninety_day_training_records(day_number);
CREATE INDEX IF NOT EXISTS idx_ninety_day_records_completed ON ninety_day_training_records(completed_at) WHERE completed_at IS NOT NULL;

-- ============================================================================
-- Part 4: 扩展 users 表 - 添加5维能力分字段
-- ============================================================================

-- 添加能力分字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS accuracy_score INTEGER NOT NULL DEFAULT 0 CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
ADD COLUMN IF NOT EXISTS spin_score INTEGER NOT NULL DEFAULT 0 CHECK (spin_score >= 0 AND spin_score <= 100),
ADD COLUMN IF NOT EXISTS positioning_score INTEGER NOT NULL DEFAULT 0 CHECK (positioning_score >= 0 AND positioning_score <= 100),
ADD COLUMN IF NOT EXISTS power_score INTEGER NOT NULL DEFAULT 0 CHECK (power_score >= 0 AND power_score <= 100),
ADD COLUMN IF NOT EXISTS strategy_score INTEGER NOT NULL DEFAULT 0 CHECK (strategy_score >= 0 AND strategy_score <= 100),
ADD COLUMN IF NOT EXISTS clearance_score INTEGER NOT NULL DEFAULT 0 CHECK (clearance_score >= 0 AND clearance_score <= 100);

-- 添加能力分计算的原始数据字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS accuracy_total_shots INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS accuracy_successful_shots INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS spin_total_difficulty_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS spin_completed_difficulty_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS positioning_total_difficulty_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS positioning_completed_difficulty_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS power_total_difficulty_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS power_completed_difficulty_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS strategy_total_difficulty_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS strategy_completed_difficulty_points INTEGER NOT NULL DEFAULT 0;

-- 添加90天挑战相关字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS challenge_start_date DATE,
ADD COLUMN IF NOT EXISTS challenge_current_day INTEGER DEFAULT 0 CHECK (challenge_current_day >= 0 AND challenge_current_day <= 90),
ADD COLUMN IF NOT EXISTS challenge_completed_days INTEGER DEFAULT 0 CHECK (challenge_completed_days >= 0 AND challenge_completed_days <= 90);

COMMENT ON COLUMN users.accuracy_score IS '准度分 (0-100)';
COMMENT ON COLUMN users.spin_score IS '杆法分 (0-100)';
COMMENT ON COLUMN users.positioning_score IS '走位分 (0-100)';
COMMENT ON COLUMN users.power_score IS '发力分 (0-100)';
COMMENT ON COLUMN users.strategy_score IS '策略分 (0-100)';
COMMENT ON COLUMN users.clearance_score IS '清台能力总分 (0-100) - 五维加权平均';

COMMENT ON COLUMN users.accuracy_total_shots IS '准度训练总击球数（用于计算准度分）';
COMMENT ON COLUMN users.accuracy_successful_shots IS '准度训练成功击球数';

COMMENT ON COLUMN users.challenge_start_date IS '90天挑战开始日期';
COMMENT ON COLUMN users.challenge_current_day IS '90天挑战当前天数';
COMMENT ON COLUMN users.challenge_completed_days IS '90天挑战已完成天数';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_clearance_score ON users(clearance_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_challenge_status ON users(challenge_start_date, challenge_current_day) WHERE challenge_start_date IS NOT NULL;

-- ============================================================================
-- Part 5: 创建辅助视图
-- ============================================================================

-- 创建用户90天挑战进度视图
CREATE OR REPLACE VIEW user_90day_challenge_progress AS
SELECT
    u.id AS user_id,
    u.username,
    u.challenge_start_date,
    u.challenge_current_day,
    u.challenge_completed_days,
    u.accuracy_score,
    u.spin_score,
    u.positioning_score,
    u.power_score,
    u.strategy_score,
    u.clearance_score,
    COUNT(DISTINCT ntr.day_number) AS total_trained_days,
    COUNT(DISTINCT CASE WHEN ntr.achieved_target = true THEN ntr.day_number END) AS successful_days,
    CASE
        WHEN u.challenge_start_date IS NOT NULL
        THEN CURRENT_DATE - u.challenge_start_date
        ELSE NULL
    END AS days_since_start
FROM users u
LEFT JOIN ninety_day_training_records ntr ON u.id = ntr.user_id AND ntr.completed_at IS NOT NULL
WHERE u.challenge_start_date IS NOT NULL
GROUP BY u.id, u.username, u.challenge_start_date, u.challenge_current_day, u.challenge_completed_days,
         u.accuracy_score, u.spin_score, u.positioning_score, u.power_score, u.strategy_score, u.clearance_score;

COMMENT ON VIEW user_90day_challenge_progress IS '用户90天挑战进度视图，汇总训练进度和能力分';

-- ============================================================================
-- Migration完成
-- ============================================================================

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 ninety_day_curriculum 表创建更新触发器
DROP TRIGGER IF EXISTS update_ninety_day_curriculum_updated_at ON ninety_day_curriculum;
CREATE TRIGGER update_ninety_day_curriculum_updated_at
    BEFORE UPDATE ON ninety_day_curriculum
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
