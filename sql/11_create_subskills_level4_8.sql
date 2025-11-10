-- ============================================================================
-- V2.1 Training System: Level 4-8 子技能创建
-- ============================================================================
-- 为Level 4-8创建10个子技能
-- 这是导入训练单元的前置条件
-- 作者: 耶氏台球学院
-- 日期: 2025-01-10
-- ============================================================================

-- 开始事务
BEGIN;

-- ============================================================================
-- Level 4: 技巧进阶 - 杆法精通
-- Skill: 杆法技术 (已存在于skills表)
-- ============================================================================

-- Sub-skill 4.1: 低杆与高杆控制
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '低杆与高杆控制',
    1,
    '掌握低杆和高杆的击球技术，理解前旋和后旋的物理原理，学习三级低杆进阶和高杆走位控制'
FROM training_skills
WHERE skill_name = '杆法技术'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- Sub-skill 4.2: 分离角原理与应用
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '分离角原理与应用',
    2,
    '理解90度分离角原理，掌握力量与分离角的配合，学习杆法对分离角的影响，应用于实战走位'
FROM training_skills
WHERE skill_name = '杆法技术'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- ============================================================================
-- Level 5: 战术运用 - 走位与布局
-- Skill: 走位技术 (已存在于skills表)
-- ============================================================================

-- Sub-skill 5.1: 基础走位技术
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '基础走位技术',
    1,
    '掌握三种基础走位方式：不吃库走位、一库走位、多库走位，学习走位路线规划和力量控制'
FROM training_skills
WHERE skill_name = '走位技术'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- Sub-skill 5.2: 清台思路初探
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '清台思路初探',
    2,
    '学习清台的基本思路和方法，掌握球型分析、走位规划和问题球处理，从简单到复杂逐步提升清台能力'
FROM training_skills
WHERE skill_name = '走位技术'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- ============================================================================
-- Level 6: 实战演练 - 加塞与清台
-- Skill: 加塞技术 (已存在于skills表)
-- ============================================================================

-- Sub-skill 6.1: 加塞瞄准与走位
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '加塞瞄准与走位',
    1,
    '掌握傅家俊5分点加塞瞄准法，理解加塞原理和身位调整，学习顺塞和反塞的走位应用'
FROM training_skills
WHERE skill_name = '加塞技术'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- Sub-skill 6.2: 实战清台提升
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '实战清台提升',
    2,
    '在实战中应用加塞技术提升清台能力，完成中高级清台演练和实战清台考核'
FROM training_skills
WHERE skill_name = '加塞技术'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- ============================================================================
-- Level 7: 综合提升 - 高级技能
-- Skill: 高级技术 (已存在于skills表)
-- ============================================================================

-- Sub-skill 7.1: 特殊技术掌握
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '特殊技术掌握',
    1,
    '掌握角度球精准瞄准、中袋球特训、弧线球、翻腕技术等特殊技术，扩展技术储备'
FROM training_skills
WHERE skill_name = '高级技术'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- Sub-skill 7.2: 瞄准技术精进
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '瞄准技术精进',
    2,
    '精进瞄准技术，包括极限高球瞄准、瞄准锁定技术，完成高级技术综合测试'
FROM training_skills
WHERE skill_name = '高级技术'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- ============================================================================
-- Level 8: 大师之境 - 思路与心态
-- Skill: 竞技心态 (已存在于skills表)
-- ============================================================================

-- Sub-skill 8.1: 系统化日常训练
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '系统化日常训练',
    1,
    '建立系统的日常训练习惯，包括热身系统、肌肉激活套路和节奏训练法'
FROM training_skills
WHERE skill_name = '竞技心态'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- Sub-skill 8.2: 竞技心态培养
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    id,
    '竞技心态培养',
    2,
    '培养比赛心态和大师风范，掌握压力管理、心理调节和综合运用能力'
FROM training_skills
WHERE skill_name = '竞技心态'
ON CONFLICT (skill_id, sub_skill_name) DO NOTHING;

-- 提交事务
COMMIT;

-- ============================================================================
-- 验证子技能创建
-- ============================================================================

DO $$
DECLARE
    total_subskills INTEGER;
    level4_count INTEGER;
    level5_count INTEGER;
    level6_count INTEGER;
    level7_count INTEGER;
    level8_count INTEGER;
BEGIN
    -- 统计各级别子技能数量
    SELECT COUNT(*) INTO level4_count
    FROM sub_skills ss
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '杆法技术';

    SELECT COUNT(*) INTO level5_count
    FROM sub_skills ss
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '走位技术';

    SELECT COUNT(*) INTO level6_count
    FROM sub_skills ss
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '加塞技术';

    SELECT COUNT(*) INTO level7_count
    FROM sub_skills ss
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '高级技术';

    SELECT COUNT(*) INTO level8_count
    FROM sub_skills ss
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '竞技心态';

    total_subskills := level4_count + level5_count + level6_count + level7_count + level8_count;

    -- 输出验证结果
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Level 4-8 子技能创建验证';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Level 4 (杆法技术): % 个子技能', level4_count;
    RAISE NOTICE 'Level 5 (走位技术): % 个子技能', level5_count;
    RAISE NOTICE 'Level 6 (加塞技术): % 个子技能', level6_count;
    RAISE NOTICE 'Level 7 (高级技术): % 个子技能', level7_count;
    RAISE NOTICE 'Level 8 (竞技心态): % 个子技能', level8_count;
    RAISE NOTICE '-------------------------------------------';
    RAISE NOTICE '总计: % 个子技能', total_subskills;
    RAISE NOTICE '===========================================';

    IF total_subskills >= 10 THEN
        RAISE NOTICE '✅ 子技能创建成功！';
    ELSE
        RAISE WARNING '⚠️  子技能创建不完整，期望10个，实际%个', total_subskills;
    END IF;
END $$;

-- ============================================================================
-- 查询子技能详细信息
-- ============================================================================

SELECT
    s.skill_name AS "技能名称",
    ss.sub_skill_name AS "子技能名称",
    ss.sub_skill_order AS "顺序",
    ss.description AS "描述",
    ss.id AS "子技能ID"
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name IN ('杆法技术', '走位技术', '加塞技术', '高级技术', '竞技心态')
ORDER BY s.skill_name, ss.sub_skill_order;

-- ============================================================================
-- 使用说明
-- ============================================================================
--
-- 执行顺序:
-- 1. 确保skills表中已有对应的技能记录
-- 2. 执行本脚本创建子技能
-- 3. 执行训练单元导入脚本 (06-10_insert_level4_8_units.sql)
--
-- 回滚方法:
-- 如果需要重新导入，可以删除这些子技能:
-- DELETE FROM sub_skills WHERE sub_skill_name IN (
--   '低杆与高杆控制', '分离角原理与应用',
--   '基础走位技术', '清台思路初探',
--   '加塞瞄准与走位', '实战清台提升',
--   '特殊技术掌握', '瞄准技术精进',
--   '系统化日常训练', '竞技心态培养'
-- );
--
-- 注意事项:
-- - 使用 ON CONFLICT DO NOTHING 避免重复插入
-- - sub_skills表有 UNIQUE(skill_id, sub_skill_name) 约束
-- - 如果技能不存在，INSERT将不会执行（SELECT返回空）
-- ============================================================================
