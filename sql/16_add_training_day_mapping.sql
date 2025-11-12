-- ============================================================================
-- Migration 16: 为ninety_day_curriculum表添加training_day_id外键
-- 用于将90天课程映射到52集详细教学内容
-- ============================================================================

-- 步骤1: 添加training_day_id字段（允许NULL）
ALTER TABLE ninety_day_curriculum
ADD COLUMN IF NOT EXISTS training_day_id INTEGER;

-- 步骤2: 添加外键约束
-- 注意：只有在training_days表中对应记录存在时才能建立引用
ALTER TABLE ninety_day_curriculum
ADD CONSTRAINT fk_ninety_day_to_training_day
FOREIGN KEY (training_day_id)
REFERENCES training_days(id)
ON DELETE SET NULL; -- 如果删除52集课程，90天课程不受影响，只是映射失效

-- 步骤3: 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_ninety_day_training_day_id
ON ninety_day_curriculum(training_day_id);

-- 步骤4: 验证字段添加成功
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ninety_day_curriculum'
    AND column_name = 'training_day_id';

-- 步骤5: 显示当前ninety_day_curriculum表结构
\d ninety_day_curriculum;
