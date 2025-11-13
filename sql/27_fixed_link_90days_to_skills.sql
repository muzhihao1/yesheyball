-- ============================================================================
-- Migration 27 (FIXED): 建立90天课程与十大招系统的关联
-- 90天课程是十大招训练的具体安排
--
-- 修复说明：删除旧的UUID类型字段，重新创建VARCHAR(50)类型字段
-- ============================================================================

-- 1. 先删除可能存在的旧字段（如果类型不匹配）
ALTER TABLE ninety_day_curriculum
DROP COLUMN IF EXISTS tencore_skill_id CASCADE,
DROP COLUMN IF EXISTS primary_sub_skill_id CASCADE;

-- 2. 删除可能存在的旧关联表
DROP TABLE IF EXISTS curriculum_day_units CASCADE;

-- 3. 重新添加正确类型的关联字段
ALTER TABLE ninety_day_curriculum
ADD COLUMN tencore_skill_id VARCHAR(50) REFERENCES skills(id) ON DELETE SET NULL,
ADD COLUMN primary_sub_skill_id VARCHAR(50) REFERENCES sub_skills(id) ON DELETE SET NULL;

-- 4. 创建多对多关联表：一天课程可以包含多个训练单元
CREATE TABLE curriculum_day_units (
    id SERIAL PRIMARY KEY,
    day_number INTEGER NOT NULL REFERENCES ninety_day_curriculum(day_number) ON DELETE CASCADE,
    unit_id VARCHAR(50) NOT NULL REFERENCES training_units(id) ON DELETE CASCADE,
    unit_order INTEGER NOT NULL,             -- 在该天训练中的顺序
    is_required BOOLEAN DEFAULT true,        -- 是否必修
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_number, unit_id)
);

COMMENT ON TABLE curriculum_day_units IS '90天课程与训练单元的多对多关联表';
COMMENT ON COLUMN curriculum_day_units.unit_order IS '该单元在当天训练中的顺序';

-- 5. 创建索引
CREATE INDEX idx_ninety_day_curriculum_skill_id ON ninety_day_curriculum(tencore_skill_id);
CREATE INDEX idx_ninety_day_curriculum_sub_skill_id ON ninety_day_curriculum(primary_sub_skill_id);
CREATE INDEX idx_curriculum_day_units_day_number ON curriculum_day_units(day_number);
CREATE INDEX idx_curriculum_day_units_unit_id ON curriculum_day_units(unit_id);

-- ============================================================================
-- 6. 更新ninety_day_curriculum表，添加skill_id映射（基于现有数据推断）
-- ============================================================================

-- 第1-14天 → 第一招：基本功
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_1'
WHERE day_number BETWEEN 1 AND 14;

-- 第15-30天 → 第二招：发力
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_2'
WHERE day_number BETWEEN 15 AND 30;

-- 第31-37天 → 第三招：高效五分点
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_3'
WHERE day_number BETWEEN 31 AND 37;

-- 第38-48天 → 第四招：准度
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_4'
WHERE day_number BETWEEN 38 AND 48;

-- 第49-60天 → 第五招：杆法
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_5'
WHERE day_number BETWEEN 49 AND 60;

-- 第61-67天 → 第六招：分离角
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_6'
WHERE day_number BETWEEN 61 AND 67;

-- 第68-76天 → 第七招：走位
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_7'
WHERE day_number BETWEEN 68 AND 76;

-- 第77-83天 → 第八招：轻松清蛇彩
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_8'
WHERE day_number BETWEEN 77 AND 83;

-- 第84-87天 → 第九招：技能
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_9'
WHERE day_number BETWEEN 84 AND 87;

-- 第88-90天 → 第十招：思路
UPDATE ninety_day_curriculum
SET tencore_skill_id = 'skill_10'
WHERE day_number BETWEEN 88 AND 90;

-- ============================================================================
-- 7. 验证关联结果
-- ============================================================================

-- 验证映射统计
SELECT
    tencore_skill_id,
    COUNT(*) as day_count,
    MIN(day_number) as start_day,
    MAX(day_number) as end_day
FROM ninety_day_curriculum
WHERE tencore_skill_id IS NOT NULL
GROUP BY tencore_skill_id
ORDER BY start_day;

-- 检查未关联的天数（应该返回0行）
SELECT
    day_number,
    title,
    tencore_skill_id
FROM ninety_day_curriculum
WHERE tencore_skill_id IS NULL
ORDER BY day_number;

-- 验证字段类型
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ninety_day_curriculum'
AND column_name IN ('tencore_skill_id', 'primary_sub_skill_id')
ORDER BY column_name;

-- 最终统计
SELECT
    '✅ 90天课程已关联到十大招' as status,
    COUNT(DISTINCT tencore_skill_id) as skill_count,
    COUNT(*) as total_days,
    COUNT(CASE WHEN tencore_skill_id IS NOT NULL THEN 1 END) as mapped_days
FROM ninety_day_curriculum;
