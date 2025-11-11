-- ============================================================================
-- 90天训练系统：数据库表创建
-- ============================================================================
-- 创建十大招系统、90天课程、专项训练相关表
-- 作者: 耶氏台球学院
-- 日期: 2025-01-11
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. 创建十大招主表
-- ============================================================================

CREATE TABLE IF NOT EXISTS tencore_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_number INTEGER NOT NULL UNIQUE CHECK (skill_number BETWEEN 1 AND 10),
  skill_name VARCHAR(50) NOT NULL,
  description TEXT,
  training_days INTEGER NOT NULL, -- 该招需要的训练天数
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tencore_skills_number ON tencore_skills(skill_number);
CREATE INDEX IF NOT EXISTS idx_tencore_skills_order ON tencore_skills(order_index);

-- 插入十大招数据
INSERT INTO tencore_skills (skill_number, skill_name, description, training_days, order_index) VALUES
(1, '基本功', '握杆、手架、站位、入位、节奏等台球基础技术，是所有技术的根基', 15, 1),
(2, '发力', '掌握大力、中力、小力三种力度控制，学习穿透力和满弓发力技术', 15, 2),
(3, '高效五分点', '傅家俊五分点瞄准法，精准瞄准的核心技术', 7, 3),
(4, '准度', '平行法、重合法、度数法三大瞄准系统，提升进球精准度', 11, 4),
(5, '杆法', '高中低杆和加塞技术，掌握母球旋转控制', 12, 5),
(6, '分离角', '90度分离角原理及力量配合，理解母球走位规律', 7, 6),
(7, '走位', '点线面三维走位思维，掌握母球精准控制', 9, 7),
(8, '轻松清蛇彩', '提升清台能力和实战水平，从简单到复杂逐步提升', 7, 8),
(9, '技能', '开球、翻袋、解球等特殊技术，扩展技术储备', 4, 9),
(10, '思路', '比赛心态和战术思维，培养大师风范', 3, 10)
ON CONFLICT (skill_number) DO NOTHING;

-- ============================================================================
-- 2. 创建90天训练课程表
-- ============================================================================

CREATE TABLE IF NOT EXISTS ninety_day_curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 90),
  tencore_skill_id UUID NOT NULL REFERENCES tencore_skills(id) ON DELETE CASCADE,
  training_type VARCHAR(20) NOT NULL CHECK (training_type IN ('系统', '专项', '测试', '理论', '考核')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  original_course_ref VARCHAR(50), -- 原52集课程引用，如"第1集"
  objectives JSONB DEFAULT '[]', -- 训练目标 ["目标1", "目标2"]
  key_points JSONB DEFAULT '[]', -- 技术要点
  practice_requirements JSONB DEFAULT '{}', -- 练习要求
  estimated_duration INTEGER DEFAULT 60, -- 预计训练时长（分钟）
  difficulty VARCHAR(10) CHECK (difficulty IN ('初级', '中级', '高级')),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ninety_day_curriculum_day ON ninety_day_curriculum(day_number);
CREATE INDEX IF NOT EXISTS idx_ninety_day_curriculum_skill ON ninety_day_curriculum(tencore_skill_id);
CREATE INDEX IF NOT EXISTS idx_ninety_day_curriculum_type ON ninety_day_curriculum(training_type);
CREATE INDEX IF NOT EXISTS idx_ninety_day_curriculum_order ON ninety_day_curriculum(order_index);

-- ============================================================================
-- 3. 创建专项训练表
-- ============================================================================

CREATE TABLE IF NOT EXISTS specialized_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL, -- '五分点', '力度', '分离角'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  training_method TEXT, -- 训练方法详细说明
  evaluation_criteria JSONB DEFAULT '{}', -- 评估标准 {"初级": "...", "中级": "...", "高级": "..."}
  related_tencore_skills JSONB DEFAULT '[]', -- 关联的十大招 [3, 4, 5]
  difficulty VARCHAR(10) CHECK (difficulty IN ('初级', '中级', '高级')),
  estimated_duration INTEGER DEFAULT 30, -- 预计训练时长（分钟）
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_specialized_training_category ON specialized_training(category);
CREATE INDEX IF NOT EXISTS idx_specialized_training_difficulty ON specialized_training(difficulty);
CREATE INDEX IF NOT EXISTS idx_specialized_training_order ON specialized_training(order_index);

-- ============================================================================
-- 4. 创建用户90天训练进度表
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_ninety_day_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1 CHECK (current_day BETWEEN 1 AND 90),
  completed_days JSONB DEFAULT '[]', -- 已完成的天数数组 [1, 2, 3]
  tencore_progress JSONB DEFAULT '{}', -- 十大招完成度 {"1": 60, "2": 40}
  specialized_progress JSONB DEFAULT '{}', -- 专项训练完成度 {"五分点": {"1分点": 80}}
  total_training_time INTEGER DEFAULT 0, -- 总训练时长（分钟）
  last_training_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_ninety_day_progress_user ON user_ninety_day_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ninety_day_progress_current ON user_ninety_day_progress(current_day);

-- ============================================================================
-- 5. 创建训练记录表（记录每天的训练详情）
-- ============================================================================

CREATE TABLE IF NOT EXISTS ninety_day_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 90),
  curriculum_id UUID REFERENCES ninety_day_curriculum(id) ON DELETE CASCADE,
  training_type VARCHAR(20) NOT NULL, -- 系统/专项/测试
  duration INTEGER NOT NULL, -- 实际训练时长（分钟）
  rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- 自评分数
  notes TEXT, -- 训练笔记
  ai_feedback TEXT, -- AI教练反馈
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ninety_day_training_records_user ON ninety_day_training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ninety_day_training_records_day ON ninety_day_training_records(day_number);
CREATE INDEX IF NOT EXISTS idx_ninety_day_training_records_completed ON ninety_day_training_records(completed_at);

-- ============================================================================
-- 验证表创建
-- ============================================================================

DO $$
DECLARE
    tencore_count INTEGER;
    curriculum_count INTEGER;
    specialized_count INTEGER;
BEGIN
    -- 统计表记录数量
    SELECT COUNT(*) INTO tencore_count FROM tencore_skills;
    SELECT COUNT(*) INTO curriculum_count FROM ninety_day_curriculum;
    SELECT COUNT(*) INTO specialized_count FROM specialized_training;

    -- 输出验证结果
    RAISE NOTICE '===========================================';
    RAISE NOTICE '90天训练系统表创建验证';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '十大招表: % 条记录', tencore_count;
    RAISE NOTICE '90天课程表: % 条记录', curriculum_count;
    RAISE NOTICE '专项训练表: % 条记录', specialized_count;
    RAISE NOTICE '===========================================';

    IF tencore_count = 10 THEN
        RAISE NOTICE '✅ 十大招数据导入成功！';
    ELSE
        RAISE WARNING '⚠️  十大招数据不完整，期望10条，实际%条', tencore_count;
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- 使用说明
-- ============================================================================
--
-- 执行顺序:
-- 1. 执行本脚本创建表结构和十大招数据
-- 2. 执行 13_insert_90day_curriculum.sql 导入90天课程数据
-- 3. 执行 14_insert_specialized_training.sql 导入专项训练数据
--
-- 回滚方法:
-- DROP TABLE IF EXISTS ninety_day_training_records CASCADE;
-- DROP TABLE IF EXISTS user_ninety_day_progress CASCADE;
-- DROP TABLE IF EXISTS specialized_training CASCADE;
-- DROP TABLE IF EXISTS ninety_day_curriculum CASCADE;
-- DROP TABLE IF EXISTS tencore_skills CASCADE;
--
-- 注意事项:
-- - 所有表使用 UUID 作为主键
-- - 使用 JSONB 存储灵活数据（目标、要点、进度等）
-- - 创建了完整的索引以提升查询性能
-- - 使用外键约束保证数据完整性
-- ============================================================================
